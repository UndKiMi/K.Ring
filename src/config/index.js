/**
 * Configuration centralisée de K.Ring Bot
 * Toutes les constantes et paramètres du bot
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Valide les variables d'environnement requises
 * @throws {Error} Si une variable requise est manquante
 */
function validateEnv() {
    const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Variables d'environnement manquantes: ${missing.join(', ')}`);
    }
}

validateEnv();

export const config = {
    // Discord
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        guildId: process.env.GUILD_ID || null,
    },

    // Bot
    bot: {
        name: 'K.Ring',
        version: '2.0.0',
        description: 'Bot Discord professionnel inspiré d\'Alan Turing',
        prefix: '!', // Pour commandes textuelles futures
    },

    // Channels par défaut
    channels: {
        info: 'infos',
        daily: 'daily',
        general: 'general',
        logs: 'logs',
    },

    // Rate Limiting
    rateLimit: {
        global: {
            maxAttempts: 5,
            windowMs: 10000, // 10 secondes
        },
        commands: {
            calc: { maxAttempts: 3, windowMs: 5000 },
            info: { maxAttempts: 2, windowMs: 10000 },
            setwelcome: { maxAttempts: 1, windowMs: 30000 },
        },
    },

    // Anti-Raid
    antiRaid: {
        joinThreshold: 5, // Nombre de membres
        joinWindow: 10000, // 10 secondes
        enabled: true,
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info', // debug, info, warn, error
        console: true,
        file: true,
    },

    // Daily Posts
    daily: {
        enabled: true,
        cronSchedule: '0 9 * * *', // 9h00 tous les jours
    },

    // Embed Colors
    colors: {
        primary: 0x3498db,
        success: 0x2ecc71,
        warning: 0xf39c12,
        error: 0xe74c3c,
        info: 0x3498db,
    },

    // Permissions
    permissions: {
        admin: ['Administrator'],
        moderator: ['ManageMessages', 'KickMembers'],
    },
};

export default config;
