/**
 * SÉCURITÉ: Middleware de Sécurité pour les Commandes
 * Applique toutes les vérifications de sécurité avant l'exécution des commandes
 */

import rateLimiter from './rateLimiter.js';
import inputValidator from './inputValidator.js';
import securityLogger from './securityLogger.js';
import antiRaid from './antiRaid.js';
import { PermissionFlagsBits } from 'discord.js';

class CommandSecurity {
    /**
     * Vérifie toutes les conditions de sécurité avant d'exécuter une commande
     * @param {Interaction} interaction - L'interaction Discord
     * @returns {Object} { allowed: boolean, reason: string }
     */
    async checkSecurity(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.tag;
        const commandName = interaction.commandName;
        const guildId = interaction.guild?.id;

        // 1. Vérifier si le serveur est en lockdown
        if (guildId && antiRaid.isLocked(guildId)) {
            securityLogger.log('WARNING', 'COMMAND_BLOCKED_LOCKDOWN', {
                userId,
                username,
                commandName,
                guildId
            });
            
            return {
                allowed: false,
                reason: '🔒 Le serveur est actuellement en mode protection. Veuillez réessayer dans quelques minutes.'
            };
        }

        // 2. Vérifier le rate limit global
        if (!rateLimiter.checkGlobalLimit(userId)) {
            securityLogger.logRateLimitExceeded(userId, username, 'GLOBAL');
            
            return {
                allowed: false,
                reason: '⏱️ Vous envoyez trop de commandes. Veuillez patienter quelques secondes.'
            };
        }

        // 3. Vérifier le rate limit spécifique à la commande
        const rateLimitCheck = rateLimiter.checkLimit(userId, commandName);
        if (!rateLimitCheck.allowed) {
            securityLogger.logRateLimitExceeded(userId, username, commandName);
            
            return {
                allowed: false,
                reason: `⏱️ Vous utilisez cette commande trop rapidement. Réessayez dans ${rateLimitCheck.retryAfter} seconde(s).`
            };
        }

        // 4. Vérifier les permissions pour les commandes sensibles
        const permissionCheck = this.checkPermissions(interaction);
        if (!permissionCheck.allowed) {
            securityLogger.logUnauthorizedAccess(
                userId,
                username,
                commandName,
                permissionCheck.requiredPermission
            );
            
            return {
                allowed: false,
                reason: permissionCheck.reason
            };
        }

        // 5. Valider les options de la commande
        const inputCheck = this.validateCommandInputs(interaction);
        if (!inputCheck.valid) {
            securityLogger.logInjectionAttempt(
                userId,
                username,
                inputCheck.invalidInput,
                commandName
            );
            
            return {
                allowed: false,
                reason: `❌ ${inputCheck.reason}`
            };
        }

        return {
            allowed: true,
            reason: ''
        };
    }

    /**
     * Vérifie les permissions pour les commandes sensibles
     * @param {Interaction} interaction
     * @returns {Object}
     */
    checkPermissions(interaction) {
        const commandName = interaction.commandName;
        const member = interaction.member;

        // Commandes réservées aux administrateurs
        const adminCommands = ['setwelcome'];
        
        if (adminCommands.includes(commandName)) {
            if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
                return {
                    allowed: false,
                    reason: '❌ Cette commande est réservée aux administrateurs.',
                    requiredPermission: 'Administrator'
                };
            }
        }

        return {
            allowed: true,
            reason: '',
            requiredPermission: null
        };
    }

    /**
     * Valide toutes les entrées d'une commande
     * @param {Interaction} interaction
     * @returns {Object}
     */
    validateCommandInputs(interaction) {
        const commandName = interaction.commandName;
        
        // Validation spécifique par commande
        switch (commandName) {
            case 'calc':
                return this.validateCalcInput(interaction);
            case 'info':
                return this.validateInfoInput(interaction);
            default:
                return { valid: true };
        }
    }

    /**
     * Valide l'entrée de la commande /calc
     * @param {Interaction} interaction
     * @returns {Object}
     */
    validateCalcInput(interaction) {
        const expression = interaction.options.getString('expression');
        
        // Validation mathématique spécifique
        const mathValidation = inputValidator.validateMathExpression(expression);
        if (!mathValidation.valid) {
            return {
                valid: false,
                invalidInput: expression,
                reason: mathValidation.reason
            };
        }

        // Validation générale
        const validation = inputValidator.validate(expression, {
            maxLength: 500,
            allowLinks: false,
            allowCode: false
        });

        if (!validation.valid) {
            return {
                valid: false,
                invalidInput: expression,
                reason: validation.reason
            };
        }

        return { valid: true };
    }

    /**
     * Valide l'entrée de la commande /info
     * @param {Interaction} interaction
     * @returns {Object}
     */
    validateInfoInput(interaction) {
        const sujet = interaction.options.getString('sujet');
        
        const validation = inputValidator.validate(sujet, {
            maxLength: 2000,
            allowLinks: false,
            allowCode: false
        });

        if (!validation.valid) {
            return {
                valid: false,
                invalidInput: sujet,
                reason: validation.reason
            };
        }

        return { valid: true };
    }

    /**
     * Vérifie si un utilisateur est suspect
     * @param {User} user
     * @returns {boolean}
     */
    isUserSuspicious(user) {
        // Vérifier le nom d'utilisateur
        if (antiRaid.detectSuspiciousUsername(user.username)) {
            securityLogger.log('WARNING', 'SUSPICIOUS_USERNAME', {
                userId: user.id,
                username: user.username
            });
            return true;
        }

        // Vérifier l'historique d'incidents
        const stats = securityLogger.getUserStats(user.id);
        if (stats.criticals > 0 || stats.warnings >= 3) {
            return true;
        }

        return false;
    }
}

// Instance singleton
const commandSecurity = new CommandSecurity();

export default commandSecurity;
