/**
 * Système de logging pour K.Ring Bot
 * Gère les logs console et fichiers avec différents niveaux de sévérité
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Chemins des fichiers de logs
const combinedLogPath = path.join(logsDir, 'combined.log');
const errorLogPath = path.join(logsDir, 'error.log');

/**
 * Formate la date pour les logs
 * @returns {string} Date formatée
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Écrit dans un fichier de log
 * @param {string} filePath - Chemin du fichier
 * @param {string} message - Message à logger
 */
function writeToFile(filePath, message) {
    try {
        fs.appendFileSync(filePath, message + '\n', 'utf8');
    } catch (error) {
        console.error('Erreur lors de l\'écriture du log:', error);
    }
}

/**
 * Formate un message de log
 * @param {string} level - Niveau de log (INFO, WARN, ERROR, DEBUG)
 * @param {string} message - Message
 * @returns {string} Message formaté
 */
function formatMessage(level, message) {
    return `[${getTimestamp()}] [${level}] ${message}`;
}

/**
 * Logger principal
 */
const logger = {
    /**
     * Log d'information
     * @param {string} message - Message à logger
     */
    info(message) {
        const formattedMsg = formatMessage('INFO', message);
        console.log('\x1b[36m%s\x1b[0m', formattedMsg); // Cyan
        writeToFile(combinedLogPath, formattedMsg);
    },

    /**
     * Log d'avertissement
     * @param {string} message - Message à logger
     */
    warn(message) {
        const formattedMsg = formatMessage('WARN', message);
        console.warn('\x1b[33m%s\x1b[0m', formattedMsg); // Jaune
        writeToFile(combinedLogPath, formattedMsg);
    },

    /**
     * Log d'erreur
     * @param {string} message - Message à logger
     * @param {Error} [error] - Objet erreur optionnel
     */
    error(message, error = null) {
        const errorDetails = error ? `\n${error.stack || error.message}` : '';
        const formattedMsg = formatMessage('ERROR', message + errorDetails);
        console.error('\x1b[31m%s\x1b[0m', formattedMsg); // Rouge
        writeToFile(combinedLogPath, formattedMsg);
        writeToFile(errorLogPath, formattedMsg);
    },

    /**
     * Log de debug
     * @param {string} message - Message à logger
     */
    debug(message) {
        const formattedMsg = formatMessage('DEBUG', message);
        console.log('\x1b[90m%s\x1b[0m', formattedMsg); // Gris
        writeToFile(combinedLogPath, formattedMsg);
    },

    /**
     * Log de succès
     * @param {string} message - Message à logger
     */
    success(message) {
        const formattedMsg = formatMessage('SUCCESS', message);
        console.log('\x1b[32m%s\x1b[0m', formattedMsg); // Vert
        writeToFile(combinedLogPath, formattedMsg);
    }
};

export default logger;
