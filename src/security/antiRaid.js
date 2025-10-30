/**
 * SÉCURITÉ: Protection Anti-Raid
 * Détecte et bloque les raids (joins massifs, spam, etc.)
 */

import logger from '../utils/logger.js';

class AntiRaid {
    constructor() {
        // Tracking des joins par serveur
        this.joinTracking = new Map();
        
        // Tracking des messages par utilisateur
        this.messageTracking = new Map();
        
        // Serveurs en mode lockdown
        this.lockdownGuilds = new Set();
        
        // Configuration
        this.config = {
            // Seuil de joins suspects: 5 membres en 10 secondes
            joinThreshold: 5,
            joinWindowMs: 10000,
            
            // Seuil de spam: 5 messages identiques en 5 secondes
            spamThreshold: 5,
            spamWindowMs: 5000,
            
            // Durée du lockdown automatique
            lockdownDurationMs: 300000 // 5 minutes
        };

        // Nettoyage périodique
        setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Enregistre un nouveau membre et détecte les raids potentiels
     * @param {string} guildId - ID du serveur
     * @param {string} userId - ID de l'utilisateur
     * @returns {boolean} true si suspect
     */
    trackJoin(guildId, userId) {
        const now = Date.now();
        const key = `join:${guildId}`;
        
        if (!this.joinTracking.has(key)) {
            this.joinTracking.set(key, []);
        }

        const joins = this.joinTracking.get(key);
        
        // Filtrer les joins récents
        const recentJoins = joins.filter(j => now - j.timestamp < this.config.joinWindowMs);
        
        // Ajouter le nouveau join
        recentJoins.push({ userId, timestamp: now });
        this.joinTracking.set(key, recentJoins);

        // Vérifier si le seuil est atteint
        if (recentJoins.length >= this.config.joinThreshold) {
            logger.error(`⚠️ RAID DÉTECTÉ sur serveur ${guildId}: ${recentJoins.length} joins en ${this.config.joinWindowMs}ms`);
            return true;
        }

        return false;
    }

    /**
     * Détecte le spam de messages
     * @param {string} userId - ID de l'utilisateur
     * @param {string} content - Contenu du message
     * @param {string} guildId - ID du serveur
     * @returns {boolean} true si spam détecté
     */
    detectSpam(userId, content, guildId) {
        const now = Date.now();
        const key = `msg:${userId}:${guildId}`;
        
        if (!this.messageTracking.has(key)) {
            this.messageTracking.set(key, []);
        }

        const messages = this.messageTracking.get(key);
        
        // Filtrer les messages récents
        const recentMessages = messages.filter(m => now - m.timestamp < this.config.spamWindowMs);
        
        // Ajouter le nouveau message
        recentMessages.push({ content, timestamp: now });
        this.messageTracking.set(key, recentMessages);

        // Compter les messages identiques
        const identicalCount = recentMessages.filter(m => m.content === content).length;

        if (identicalCount >= this.config.spamThreshold) {
            logger.warn(`⚠️ SPAM DÉTECTÉ: ${userId} a envoyé ${identicalCount} messages identiques`);
            return true;
        }

        return false;
    }

    /**
     * Active le mode lockdown sur un serveur
     * @param {string} guildId - ID du serveur
     * @param {number} durationMs - Durée du lockdown (optionnel)
     */
    enableLockdown(guildId, durationMs = this.config.lockdownDurationMs) {
        this.lockdownGuilds.add(guildId);
        logger.error(`🔒 LOCKDOWN activé sur serveur ${guildId} pour ${durationMs}ms`);

        // Désactiver automatiquement après la durée
        setTimeout(() => {
            this.disableLockdown(guildId);
        }, durationMs);
    }

    /**
     * Désactive le mode lockdown
     * @param {string} guildId - ID du serveur
     */
    disableLockdown(guildId) {
        this.lockdownGuilds.delete(guildId);
        logger.info(`🔓 LOCKDOWN désactivé sur serveur ${guildId}`);
    }

    /**
     * Vérifie si un serveur est en lockdown
     * @param {string} guildId - ID du serveur
     * @returns {boolean}
     */
    isLocked(guildId) {
        return this.lockdownGuilds.has(guildId);
    }

    /**
     * Détecte les patterns de noms suspects (bots, raids)
     * @param {string} username - Nom d'utilisateur
     * @returns {boolean} true si suspect
     */
    detectSuspiciousUsername(username) {
        const suspiciousPatterns = [
            /discord\.gg/i,      // Liens d'invitation
            /nitro/i,            // Scam nitro
            /free.*nitro/i,      // Free nitro scam
            /\d{10,}/,           // Longues séquences de chiffres
            /(.)\1{5,}/,         // Caractères répétés
        ];

        return suspiciousPatterns.some(pattern => pattern.test(username));
    }

    /**
     * Nettoie les anciennes données
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 3600000; // 1 heure

        // Nettoyer les joins
        for (const [key, joins] of this.joinTracking.entries()) {
            const recent = joins.filter(j => now - j.timestamp < maxAge);
            if (recent.length === 0) {
                this.joinTracking.delete(key);
            } else {
                this.joinTracking.set(key, recent);
            }
        }

        // Nettoyer les messages
        for (const [key, messages] of this.messageTracking.entries()) {
            const recent = messages.filter(m => now - m.timestamp < maxAge);
            if (recent.length === 0) {
                this.messageTracking.delete(key);
            } else {
                this.messageTracking.set(key, recent);
            }
        }

        logger.debug(`Anti-raid cleanup: ${this.joinTracking.size} guilds, ${this.messageTracking.size} users trackés`);
    }
}

// Instance singleton
const antiRaid = new AntiRaid();

export default antiRaid;
