/**
 * Gestionnaire de configuration pour K.Ring Bot
 * Gère la configuration par serveur (rôles de bienvenue, etc.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin du fichier de configuration
const configDir = path.join(__dirname, '..', '..', 'config');
const configPath = path.join(configDir, 'guild-config.json');

/**
 * Charge la configuration depuis le fichier
 * @returns {Object} Configuration des serveurs
 */
function loadConfig() {
    try {
        // Créer le dossier config s'il n'existe pas
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        // Créer le fichier s'il n'existe pas
        if (!fs.existsSync(configPath)) {
            const defaultConfig = { guilds: {} };
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
            logger.info('Fichier de configuration créé');
            return defaultConfig;
        }

        const data = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error('Erreur lors du chargement de la configuration', error);
        return { guilds: {} };
    }
}

/**
 * Sauvegarde la configuration dans le fichier
 * @param {Object} config - Configuration à sauvegarder
 */
function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        logger.debug('Configuration sauvegardée');
    } catch (error) {
        logger.error('Erreur lors de la sauvegarde de la configuration', error);
    }
}

/**
 * Gestionnaire de configuration
 */
const configManager = {
    /**
     * Obtient la configuration d'un serveur
     * @param {string} guildId - ID du serveur
     * @returns {Object} Configuration du serveur
     */
    getGuildConfig(guildId) {
        const config = loadConfig();
        if (!config.guilds[guildId]) {
            config.guilds[guildId] = {
                welcomeRoleId: null,
                infoChannelId: null,
                dailyChannelId: null
            };
            saveConfig(config);
        }
        return config.guilds[guildId];
    },

    /**
     * Définit le rôle de bienvenue pour un serveur
     * @param {string} guildId - ID du serveur
     * @param {string} roleId - ID du rôle
     */
    setWelcomeRole(guildId, roleId) {
        const config = loadConfig();
        if (!config.guilds[guildId]) {
            config.guilds[guildId] = {};
        }
        config.guilds[guildId].welcomeRoleId = roleId;
        saveConfig(config);
        logger.info(`Rôle de bienvenue défini pour le serveur ${guildId}: ${roleId}`);
    },

    /**
     * Obtient le rôle de bienvenue d'un serveur
     * @param {string} guildId - ID du serveur
     * @returns {string|null} ID du rôle ou null
     */
    getWelcomeRole(guildId) {
        const guildConfig = this.getGuildConfig(guildId);
        return guildConfig.welcomeRoleId;
    },

    /**
     * Définit le salon d'informations pour un serveur
     * @param {string} guildId - ID du serveur
     * @param {string} channelId - ID du salon
     */
    setInfoChannel(guildId, channelId) {
        const config = loadConfig();
        if (!config.guilds[guildId]) {
            config.guilds[guildId] = {};
        }
        config.guilds[guildId].infoChannelId = channelId;
        saveConfig(config);
    },

    /**
     * Obtient le salon d'informations d'un serveur
     * @param {string} guildId - ID du serveur
     * @returns {string|null} ID du salon ou null
     */
    getInfoChannel(guildId) {
        const guildConfig = this.getGuildConfig(guildId);
        return guildConfig.infoChannelId;
    },

    /**
     * Définit le salon quotidien pour un serveur
     * @param {string} guildId - ID du serveur
     * @param {string} channelId - ID du salon
     */
    setDailyChannel(guildId, channelId) {
        const config = loadConfig();
        if (!config.guilds[guildId]) {
            config.guilds[guildId] = {};
        }
        config.guilds[guildId].dailyChannelId = channelId;
        saveConfig(config);
    },

    /**
     * Obtient le salon quotidien d'un serveur
     * @param {string} guildId - ID du serveur
     * @returns {string|null} ID du salon ou null
     */
    getDailyChannel(guildId) {
        const guildConfig = this.getGuildConfig(guildId);
        return guildConfig.dailyChannelId;
    }
};

export default configManager;
