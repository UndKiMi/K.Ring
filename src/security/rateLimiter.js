/**
 * SÉCURITÉ: Rate Limiter
 * Protection contre le spam de commandes et les abus
 * Implémente un système de limitation par utilisateur et par commande
 */

import logger from '../utils/logger.js';
import config from '../config/index.js';

class RateLimiter {
    constructor() {
        // Stockage des tentatives par utilisateur
        this.userAttempts = new Map();
        
        // Configuration des limites depuis config centralisée
        this.limits = config.rateLimit;

        // Nettoyage automatique toutes les 5 minutes
        setInterval(() => this.cleanup(), 300000);
    }

    /**
     * Vérifie si un utilisateur peut exécuter une commande
     * @param {string} userId - ID de l'utilisateur
     * @param {string} commandName - Nom de la commande
     * @returns {Object} { allowed: boolean, retryAfter: number }
     */
    checkLimit(userId, commandName) {
        const now = Date.now();
        const userKey = `${userId}:${commandName}`;
        
        // Récupérer ou créer l'historique de l'utilisateur
        if (!this.userAttempts.has(userKey)) {
            this.userAttempts.set(userKey, []);
        }

        const attempts = this.userAttempts.get(userKey);
        
        // Déterminer la limite applicable
        const limit = this.limits.commands[commandName] || this.limits.global;
        
        // Filtrer les tentatives dans la fenêtre de temps
        const recentAttempts = attempts.filter(timestamp => 
            now - timestamp < limit.windowMs
        );

        // Vérifier si la limite est atteinte
        if (recentAttempts.length >= limit.maxAttempts) {
            const oldestAttempt = Math.min(...recentAttempts);
            const retryAfter = Math.ceil((oldestAttempt + limit.windowMs - now) / 1000);
            
            logger.warn(`Rate limit atteint pour ${userId} sur /${commandName}`);
            
            return {
                allowed: false,
                retryAfter
            };
        }

        // Ajouter la nouvelle tentative
        recentAttempts.push(now);
        this.userAttempts.set(userKey, recentAttempts);

        return {
            allowed: true,
            retryAfter: 0
        };
    }

    /**
     * Vérifie le rate limit global (toutes commandes confondues)
     * @param {string} userId - ID de l'utilisateur
     * @returns {boolean}
     */
    checkGlobalLimit(userId) {
        const now = Date.now();
        const globalKey = `${userId}:global`;
        
        if (!this.userAttempts.has(globalKey)) {
            this.userAttempts.set(globalKey, []);
        }

        const attempts = this.userAttempts.get(globalKey);
        const recentAttempts = attempts.filter(timestamp => 
            now - timestamp < this.limits.global.windowMs
        );

        if (recentAttempts.length >= this.limits.global.maxAttempts) {
            logger.warn(`Rate limit global atteint pour ${userId}`);
            return false;
        }

        recentAttempts.push(now);
        this.userAttempts.set(globalKey, recentAttempts);
        return true;
    }

    /**
     * Nettoie les anciennes entrées pour libérer la mémoire
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 3600000; // 1 heure

        for (const [key, attempts] of this.userAttempts.entries()) {
            const recentAttempts = attempts.filter(timestamp => 
                now - timestamp < maxAge
            );
            
            if (recentAttempts.length === 0) {
                this.userAttempts.delete(key);
            } else {
                this.userAttempts.set(key, recentAttempts);
            }
        }

        logger.debug(`Rate limiter cleanup: ${this.userAttempts.size} entrées actives`);
    }

    /**
     * Réinitialise les limites pour un utilisateur (admin uniquement)
     * @param {string} userId - ID de l'utilisateur
     */
    reset(userId) {
        for (const [key] of this.userAttempts.entries()) {
            if (key.startsWith(userId)) {
                this.userAttempts.delete(key);
            }
        }
        logger.info(`Rate limits réinitialisés pour ${userId}`);
    }
}

// Instance singleton
const rateLimiter = new RateLimiter();

export default rateLimiter;
