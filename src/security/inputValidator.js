/**
 * SÉCURITÉ: Validation et Sanitization des Entrées
 * Protège contre les injections, XSS, et entrées malveillantes
 */

import logger from '../utils/logger.js';

class InputValidator {
    constructor() {
        // Patterns dangereux à bloquer
        this.dangerousPatterns = {
            // Injections de code
            codeInjection: [
                /import\s+/i,
                /require\s*\(/i,
                /eval\s*\(/i,
                /function\s*\(/i,
                /=>\s*{/,
                /new\s+Function/i,
                /setTimeout\s*\(/i,
                /setInterval\s*\(/i,
            ],
            
            // Scripts et HTML
            xss: [
                /<script[^>]*>.*?<\/script>/gi,
                /<iframe[^>]*>.*?<\/iframe>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi, // onclick, onerror, etc.
            ],
            
            // Liens suspects
            suspiciousLinks: [
                /discord\.gg\/(?!official)/i,  // Liens d'invitation non officiels
                /bit\.ly/i,
                /tinyurl/i,
                /grabify/i,
                /iplogger/i,
            ],
            
            // Scams connus
            scams: [
                /free.*nitro/i,
                /steam.*gift/i,
                /claim.*prize/i,
                /verify.*account/i,
            ]
        };

        // Extensions de fichiers dangereuses
        this.dangerousExtensions = [
            '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
            '.vbs', '.js', '.jar', '.msi', '.app', '.deb',
            '.apk', '.dmg', '.pkg', '.sh', '.ps1'
        ];
    }

    /**
     * Valide et nettoie une entrée utilisateur
     * @param {string} input - Entrée à valider
     * @param {Object} options - Options de validation
     * @returns {Object} { valid: boolean, sanitized: string, reason: string }
     */
    validate(input, options = {}) {
        const {
            maxLength = 2000,
            allowLinks = false,
            allowCode = false,
            type = 'text'
        } = options;

        // Vérifier la longueur
        if (input.length > maxLength) {
            return {
                valid: false,
                sanitized: '',
                reason: `Entrée trop longue (max: ${maxLength} caractères)`
            };
        }

        // Vérifier les injections de code
        if (!allowCode && this.containsCodeInjection(input)) {
            logger.warn(`⚠️ Tentative d'injection de code détectée: ${input.substring(0, 50)}...`);
            return {
                valid: false,
                sanitized: '',
                reason: 'Code ou script détecté dans l\'entrée'
            };
        }

        // Vérifier les XSS
        if (this.containsXSS(input)) {
            logger.warn(`⚠️ Tentative XSS détectée: ${input.substring(0, 50)}...`);
            return {
                valid: false,
                sanitized: '',
                reason: 'Contenu HTML/JavaScript non autorisé'
            };
        }

        // Vérifier les liens suspects
        if (!allowLinks && this.containsSuspiciousLink(input)) {
            logger.warn(`⚠️ Lien suspect détecté: ${input.substring(0, 50)}...`);
            return {
                valid: false,
                sanitized: '',
                reason: 'Lien suspect ou non autorisé'
            };
        }

        // Vérifier les scams
        if (this.containsScam(input)) {
            logger.warn(`⚠️ Contenu de scam détecté: ${input.substring(0, 50)}...`);
            return {
                valid: false,
                sanitized: '',
                reason: 'Contenu suspect (scam potentiel)'
            };
        }

        // Sanitize l'entrée
        const sanitized = this.sanitize(input);

        return {
            valid: true,
            sanitized,
            reason: ''
        };
    }

    /**
     * Vérifie si l'entrée contient une injection de code
     * @param {string} input - Entrée à vérifier
     * @returns {boolean}
     */
    containsCodeInjection(input) {
        return this.dangerousPatterns.codeInjection.some(pattern => 
            pattern.test(input)
        );
    }

    /**
     * Vérifie si l'entrée contient du XSS
     * @param {string} input - Entrée à vérifier
     * @returns {boolean}
     */
    containsXSS(input) {
        return this.dangerousPatterns.xss.some(pattern => 
            pattern.test(input)
        );
    }

    /**
     * Vérifie si l'entrée contient un lien suspect
     * @param {string} input - Entrée à vérifier
     * @returns {boolean}
     */
    containsSuspiciousLink(input) {
        return this.dangerousPatterns.suspiciousLinks.some(pattern => 
            pattern.test(input)
        );
    }

    /**
     * Vérifie si l'entrée contient du contenu de scam
     * @param {string} input - Entrée à vérifier
     * @returns {boolean}
     */
    containsScam(input) {
        return this.dangerousPatterns.scams.some(pattern => 
            pattern.test(input)
        );
    }

    /**
     * Nettoie une entrée en retirant les caractères dangereux
     * @param {string} input - Entrée à nettoyer
     * @returns {string}
     */
    sanitize(input) {
        return input
            .trim()
            // Retirer les caractères de contrôle
            .replace(/[\x00-\x1F\x7F]/g, '')
            // Retirer les espaces multiples
            .replace(/\s+/g, ' ')
            // Échapper les caractères spéciaux Discord
            .replace(/[`*_~|]/g, '\\$&');
    }

    /**
     * Valide une expression mathématique
     * @param {string} expression - Expression à valider
     * @returns {Object}
     */
    validateMathExpression(expression) {
        // Patterns autorisés pour les calculs (inclut x pour multiplication)
        const allowedPattern = /^[\d\s+\-*\/().,^%xpielog\[\]sqrtsincotan]+$/i;
        
        if (!allowedPattern.test(expression)) {
            return {
                valid: false,
                reason: 'Expression mathématique invalide'
            };
        }

        // Vérifier les patterns dangereux même dans les expressions math
        if (this.containsCodeInjection(expression)) {
            return {
                valid: false,
                reason: 'Code détecté dans l\'expression'
            };
        }

        return {
            valid: true,
            reason: ''
        };
    }

    /**
     * Valide un nom de fichier
     * @param {string} filename - Nom du fichier
     * @returns {Object}
     */
    validateFilename(filename) {
        const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        
        if (this.dangerousExtensions.includes(ext)) {
            logger.warn(`⚠️ Extension de fichier dangereuse détectée: ${ext}`);
            return {
                valid: false,
                reason: `Extension de fichier non autorisée: ${ext}`
            };
        }

        // Vérifier les caractères dangereux dans le nom
        if (/[<>:"|?*\x00-\x1F]/.test(filename)) {
            return {
                valid: false,
                reason: 'Caractères invalides dans le nom de fichier'
            };
        }

        return {
            valid: true,
            reason: ''
        };
    }

    /**
     * Valide un ID Discord
     * @param {string} id - ID à valider
     * @returns {boolean}
     */
    validateDiscordId(id) {
        // Les IDs Discord sont des snowflakes (17-19 chiffres)
        return /^\d{17,19}$/.test(id);
    }

    /**
     * Valide une URL
     * @param {string} url - URL à valider
     * @param {Array} allowedDomains - Domaines autorisés (optionnel)
     * @returns {Object}
     */
    validateUrl(url, allowedDomains = []) {
        try {
            const parsed = new URL(url);
            
            // Vérifier le protocole
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return {
                    valid: false,
                    reason: 'Protocole non autorisé'
                };
            }

            // Vérifier les domaines si spécifiés
            if (allowedDomains.length > 0) {
                const isAllowed = allowedDomains.some(domain => 
                    parsed.hostname.endsWith(domain)
                );
                
                if (!isAllowed) {
                    return {
                        valid: false,
                        reason: 'Domaine non autorisé'
                    };
                }
            }

            return {
                valid: true,
                reason: ''
            };
        } catch (error) {
            return {
                valid: false,
                reason: 'URL invalide'
            };
        }
    }
}

// Instance singleton
const inputValidator = new InputValidator();

export default inputValidator;
