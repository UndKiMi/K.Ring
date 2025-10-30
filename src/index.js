/**
 * K.Ring Discord Bot
 * Point d'entrée principal du bot
 * Inspiré d'Alan Turing
 */

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import { initDailyPost } from './utils/dailyPost.js';

// Configuration ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

// Vérifier que le token est présent
if (!process.env.DISCORD_TOKEN) {
    logger.error('DISCORD_TOKEN manquant dans le fichier .env');
    process.exit(1);
}

// Créer le client Discord avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
    ],
});

// Collection pour stocker les commandes
client.commands = new Collection();

/**
 * Charge toutes les commandes depuis le dossier commands
 */
async function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    
    // Vérifier si le dossier existe
    if (!fs.existsSync(commandsPath)) {
        logger.warn('Dossier commands introuvable');
        return;
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            // Importer le module de commande
            const command = await import(`file://${filePath}`);
            
            // Vérifier que la commande a les propriétés requises
            if ('data' in command.default && 'execute' in command.default) {
                client.commands.set(command.default.data.name, command.default);
                logger.debug(`Commande chargée: ${command.default.data.name}`);
            } else {
                logger.warn(`La commande ${file} ne contient pas les propriétés 'data' ou 'execute'`);
            }
        } catch (error) {
            logger.error(`Erreur lors du chargement de la commande ${file}`, error);
        }
    }

    logger.success(`${client.commands.size} commande(s) chargée(s)`);
}

/**
 * Charge tous les événements depuis le dossier events
 */
async function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    
    // Vérifier si le dossier existe
    if (!fs.existsSync(eventsPath)) {
        logger.warn('Dossier events introuvable');
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
            // Importer le module d'événement
            const event = await import(`file://${filePath}`);
            
            // Vérifier que l'événement a les propriétés requises
            if ('name' in event.default && 'execute' in event.default) {
                // Enregistrer l'événement
                if (event.default.once) {
                    client.once(event.default.name, (...args) => event.default.execute(...args));
                } else {
                    client.on(event.default.name, (...args) => event.default.execute(...args));
                }
                logger.debug(`Événement chargé: ${event.default.name}`);
            } else {
                logger.warn(`L'événement ${file} ne contient pas les propriétés 'name' ou 'execute'`);
            }
        } catch (error) {
            logger.error(`Erreur lors du chargement de l'événement ${file}`, error);
        }
    }

    logger.success(`Événements chargés depuis ${eventsPath}`);
}

/**
 * Gestion des erreurs non capturées
 */
process.on('unhandledRejection', (error) => {
    logger.error('Promesse rejetée non gérée:', error);
});

process.on('uncaughtException', (error) => {
    logger.error('Exception non capturée:', error);
    process.exit(1);
});

/**
 * Initialisation du bot
 */
async function init() {
    try {
        logger.info('╔════════════════════════════════════════╗');
        logger.info('║        K.Ring Bot - Démarrage          ║');
        logger.info('║   Inspiré d\'Alan Turing (1912-1954)   ║');
        logger.info('╚════════════════════════════════════════╝');

        // Charger les commandes et événements
        await loadCommands();
        await loadEvents();

        // Initialiser le système de publication quotidienne
        initDailyPost(client);

        // Connexion au bot Discord
        logger.info('Connexion à Discord...');
        await client.login(process.env.DISCORD_TOKEN);

    } catch (error) {
        logger.error('Erreur lors de l\'initialisation du bot', error);
        process.exit(1);
    }
}

// Lancer le bot
init();

// Exporter le client pour les tests
export default client;
