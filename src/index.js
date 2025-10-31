/**
 * K.Ring Discord Bot - Version Optimisée
 * Point d'entrée principal du bot
 * Inspiré d'Alan Turing
 * 
 * OPTIMISATIONS APPLIQUÉES :
 * - Intents minimaux pour réduire la charge
 * - Cache optimisé avec sweepers
 * - Monitoring de performance intégré
 * - Gestion asynchrone améliorée
 */

import { Client, Collection, GatewayIntentBits, Partials, Options } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import { initDailyPost } from './utils/dailyPost.js';
import performanceMonitor from './utils/performanceMonitor.js';

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

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION CLIENT OPTIMISÉE
// ═══════════════════════════════════════════════════════════════
const client = new Client({
    // Intents minimaux pour réduire la charge réseau
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
    ],
    // OPTIMISATION : Sweepers pour nettoyer le cache automatiquement
    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: {
            interval: 3600, // Nettoyer toutes les heures
            lifetime: 1800,  // Garder 30 minutes
        },
        users: {
            interval: 3600,
            filter: () => user => user.bot && user.id !== client.user.id, // Garder seulement les users actifs
        },
    },
    // OPTIMISATION : Limiter le cache
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
        MessageManager: 200, // Max 200 messages en cache
        PresenceManager: 0,  // Pas de cache de présences (économie mémoire)
        ReactionManager: 0,  // Pas de cache de réactions
    }),
    // OPTIMISATION : Désactiver les mentions par défaut
    allowedMentions: {
        parse: ['users'],
        repliedUser: false,
    },
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
 * Gestion de l'arrêt propre du bot
 */
async function shutdown(signal) {
    logger.info(`Signal ${signal} reçu, arrêt du bot...`);
    
    try {
        // Détruire le client Discord
        if (client) {
            await client.destroy();
            logger.info('Client Discord déconnecté');
        }
        
        // Attendre un peu pour les opérations en cours
        await new Promise(resolve => setTimeout(resolve, 500));
        
        logger.info('Arrêt terminé');
        process.exit(0);
    } catch (error) {
        logger.error('Erreur lors de l\'arrêt:', error);
        process.exit(1);
    }
}

// Écouter les signaux d'arrêt
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGKILL', () => shutdown('SIGKILL'));

/**
 * Initialisation du bot
 */
async function init() {
    try {
        logger.info('╔════════════════════════════════════════╗');
        logger.info('║    K.Ring Bot - Démarrage Optimisé    ║');
        logger.info('║   Inspiré d\'Alan Turing (1912-1954)   ║');
        logger.info('╚════════════════════════════════════════╝');

        // Charger les commandes et événements
        await loadCommands();
        await loadEvents();

        // Initialiser le système de publication quotidienne
        initDailyPost(client);

        // ═══════════════════════════════════════════════════════
        // MONITORING AUTOMATIQUE (toutes les 5 minutes)
        // ═══════════════════════════════════════════════════════
        setInterval(() => {
            performanceMonitor.recordSystemMetrics(client);
        }, 300000); // 5 minutes

        // Rapport de performance toutes les heures
        setInterval(() => {
            performanceMonitor.logReport(client);
        }, 3600000); // 1 heure

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
