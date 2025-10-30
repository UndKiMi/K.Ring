/**
 * SÉCURITÉ: Logger de Sécurité
 * Trace toutes les activités suspectes et violations de sécurité
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityLogger {
    constructor() {
        // Créer le dossier de logs de sécurité
        this.securityLogsDir = path.join(__dirname, '..', '..', 'logs', 'security');
        if (!fs.existsSync(this.securityLogsDir)) {
            fs.mkdirSync(this.securityLogsDir, { recursive: true });
        }

        this.securityLogPath = path.join(this.securityLogsDir, 'security.log');
        this.incidentsLogPath = path.join(this.securityLogsDir, 'incidents.log');
        
        // Compteurs d'incidents par utilisateur
        this.userIncidents = new Map();
        
        // Seuils d'alerte
        this.thresholds = {
            warningCount: 3,    // 3 warnings = alerte
            banCount: 5         // 5 incidents = ban recommandé
        };
    }

    /**
     * Enregistre un événement de sécurité
     * @param {string} level - Niveau (INFO, WARNING, CRITICAL)
     * @param {string} type - Type d'incident
     * @param {Object} data - Données de l'incident
     */
    log(level, type, data) {
        const timestamp = new Date().toISOString();
        const entry = {
            timestamp,
            level,
            type,
            ...data
        };

        const logLine = JSON.stringify(entry) + '\n';

        // Écrire dans le fichier approprié
        fs.appendFileSync(this.securityLogPath, logLine, 'utf8');

        // Si critique, écrire aussi dans incidents.log
        if (level === 'CRITICAL' || level === 'WARNING') {
            fs.appendFileSync(this.incidentsLogPath, logLine, 'utf8');
        }

        // Afficher dans la console
        const color = level === 'CRITICAL' ? '\x1b[31m' : level === 'WARNING' ? '\x1b[33m' : '\x1b[36m';
        console.log(`${color}[SECURITY ${level}] ${type}: ${JSON.stringify(data)}\x1b[0m`);

        // Tracker les incidents par utilisateur
        if (data.userId) {
            this.trackUserIncident(data.userId, level);
        }
    }

    /**
     * Log une tentative d'injection
     */
    logInjectionAttempt(userId, username, input, commandName) {
        this.log('CRITICAL', 'INJECTION_ATTEMPT', {
            userId,
            username,
            input: input.substring(0, 200),
            commandName,
            action: 'BLOCKED'
        });
    }

    /**
     * Log un dépassement de rate limit
     */
    logRateLimitExceeded(userId, username, commandName) {
        this.log('WARNING', 'RATE_LIMIT_EXCEEDED', {
            userId,
            username,
            commandName
        });
    }

    /**
     * Log une détection de spam
     */
    logSpamDetected(userId, username, guildId, messageCount) {
        this.log('WARNING', 'SPAM_DETECTED', {
            userId,
            username,
            guildId,
            messageCount
        });
    }

    /**
     * Log une détection de raid
     */
    logRaidDetected(guildId, guildName, joinCount) {
        this.log('CRITICAL', 'RAID_DETECTED', {
            guildId,
            guildName,
            joinCount,
            action: 'LOCKDOWN_ACTIVATED'
        });
    }

    /**
     * Log un accès non autorisé
     */
    logUnauthorizedAccess(userId, username, commandName, requiredPermission) {
        this.log('WARNING', 'UNAUTHORIZED_ACCESS', {
            userId,
            username,
            commandName,
            requiredPermission,
            action: 'DENIED'
        });
    }

    /**
     * Log un contenu suspect
     */
    logSuspiciousContent(userId, username, contentType, reason) {
        this.log('WARNING', 'SUSPICIOUS_CONTENT', {
            userId,
            username,
            contentType,
            reason,
            action: 'BLOCKED'
        });
    }

    /**
     * Log une erreur de sécurité
     */
    logSecurityError(error, context) {
        this.log('CRITICAL', 'SECURITY_ERROR', {
            error: error.message,
            stack: error.stack,
            context
        });
    }

    /**
     * Tracker les incidents par utilisateur
     */
    trackUserIncident(userId, level) {
        if (!this.userIncidents.has(userId)) {
            this.userIncidents.set(userId, {
                warnings: 0,
                criticals: 0,
                lastIncident: Date.now()
            });
        }

        const userStats = this.userIncidents.get(userId);
        
        if (level === 'WARNING') {
            userStats.warnings++;
        } else if (level === 'CRITICAL') {
            userStats.criticals++;
        }
        
        userStats.lastIncident = Date.now();
        this.userIncidents.set(userId, userStats);

        // Vérifier les seuils
        const totalIncidents = userStats.warnings + userStats.criticals;
        
        if (totalIncidents >= this.thresholds.banCount) {
            this.log('CRITICAL', 'BAN_RECOMMENDED', {
                userId,
                warnings: userStats.warnings,
                criticals: userStats.criticals,
                totalIncidents
            });
        } else if (totalIncidents >= this.thresholds.warningCount) {
            this.log('WARNING', 'USER_FLAGGED', {
                userId,
                warnings: userStats.warnings,
                criticals: userStats.criticals,
                totalIncidents
            });
        }
    }

    /**
     * Obtient les statistiques d'un utilisateur
     */
    getUserStats(userId) {
        return this.userIncidents.get(userId) || {
            warnings: 0,
            criticals: 0,
            lastIncident: null
        };
    }

    /**
     * Réinitialise les incidents d'un utilisateur
     */
    resetUserIncidents(userId) {
        this.userIncidents.delete(userId);
        this.log('INFO', 'USER_INCIDENTS_RESET', { userId });
    }

    /**
     * Génère un rapport de sécurité
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalUsers: this.userIncidents.size,
            flaggedUsers: [],
            banRecommended: []
        };

        for (const [userId, stats] of this.userIncidents.entries()) {
            const totalIncidents = stats.warnings + stats.criticals;
            
            if (totalIncidents >= this.thresholds.banCount) {
                report.banRecommended.push({ userId, ...stats });
            } else if (totalIncidents >= this.thresholds.warningCount) {
                report.flaggedUsers.push({ userId, ...stats });
            }
        }

        return report;
    }

    /**
     * Nettoie les anciennes entrées (plus de 30 jours)
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours

        for (const [userId, stats] of this.userIncidents.entries()) {
            if (now - stats.lastIncident > maxAge) {
                this.userIncidents.delete(userId);
            }
        }

        this.log('INFO', 'CLEANUP_COMPLETED', {
            remainingUsers: this.userIncidents.size
        });
    }
}

// Instance singleton
const securityLogger = new SecurityLogger();

// Nettoyage automatique tous les jours
setInterval(() => securityLogger.cleanup(), 24 * 60 * 60 * 1000);

export default securityLogger;
