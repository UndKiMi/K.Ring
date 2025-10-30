/**
 * Système de publication quotidienne automatique
 * Poste une blague ou un conseil chaque jour dans le salon #daily
 */

import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import logger from './logger.js';
import configManager from './configManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le contenu quotidien
const contentPath = path.join(__dirname, '..', '..', 'config', 'daily-content.json');
let dailyContent = { jokes: [], tips: [] };

try {
    const data = fs.readFileSync(contentPath, 'utf8');
    dailyContent = JSON.parse(data);
    logger.info(`Contenu quotidien chargé: ${dailyContent.jokes.length} blagues, ${dailyContent.tips.length} conseils`);
} catch (error) {
    logger.error('Erreur lors du chargement du contenu quotidien', error);
}

/**
 * Sélectionne un contenu aléatoire (blague ou conseil)
 * @returns {string} Contenu sélectionné
 */
function getRandomContent() {
    const allContent = [...dailyContent.jokes, ...dailyContent.tips];
    if (allContent.length === 0) {
        return "🤖 K.Ring vous souhaite une excellente journée !";
    }
    const randomIndex = Math.floor(Math.random() * allContent.length);
    return allContent[randomIndex];
}

/**
 * Trouve ou crée le salon #daily dans un serveur
 * @param {Guild} guild - Le serveur Discord
 * @returns {Promise<TextChannel|null>} Le salon trouvé ou créé
 */
async function findOrCreateDailyChannel(guild) {
    try {
        // Vérifier si un salon est déjà configuré
        const configuredChannelId = configManager.getDailyChannel(guild.id);
        if (configuredChannelId) {
            const channel = guild.channels.cache.get(configuredChannelId);
            if (channel) return channel;
        }

        // Chercher un salon nommé "daily"
        let dailyChannel = guild.channels.cache.find(
            channel => channel.name === 'daily' && channel.type === ChannelType.GuildText
        );

        // Si le salon n'existe pas, le créer
        if (!dailyChannel) {
            // Vérifier les permissions du bot
            const botMember = guild.members.me;
            if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
                logger.warn(`Pas de permission pour créer le salon #daily sur ${guild.name}`);
                return null;
            }

            dailyChannel = await guild.channels.create({
                name: 'daily',
                type: ChannelType.GuildText,
                topic: '📅 Publication quotidienne de K.Ring - Blagues et conseils du jour',
                reason: 'Salon créé automatiquement par K.Ring pour les publications quotidiennes'
            });

            logger.success(`Salon #daily créé sur ${guild.name}`);
        }

        // Sauvegarder dans la configuration
        configManager.setDailyChannel(guild.id, dailyChannel.id);
        return dailyChannel;

    } catch (error) {
        logger.error(`Erreur lors de la création du salon #daily sur ${guild.name}`, error);
        return null;
    }
}

/**
 * Poste le contenu quotidien dans tous les serveurs
 * @param {Client} client - Le client Discord
 */
async function postDailyContent(client) {
    logger.info('Début de la publication quotidienne...');
    
    const content = getRandomContent();
    let successCount = 0;
    let failCount = 0;

    for (const guild of client.guilds.cache.values()) {
        try {
            const dailyChannel = await findOrCreateDailyChannel(guild);
            
            if (!dailyChannel) {
                failCount++;
                continue;
            }

            // Vérifier les permissions d'envoi
            const botMember = guild.members.me;
            if (!dailyChannel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages)) {
                logger.warn(`Pas de permission pour envoyer des messages dans #daily sur ${guild.name}`);
                failCount++;
                continue;
            }

            // Envoyer le message
            await dailyChannel.send({
                content: `📅 **Publication quotidienne du ${new Date().toLocaleDateString('fr-FR')}**\n\n${content}`
            });

            successCount++;
            logger.debug(`Publication quotidienne envoyée sur ${guild.name}`);

        } catch (error) {
            logger.error(`Erreur lors de la publication quotidienne sur ${guild.name}`, error);
            failCount++;
        }
    }

    logger.success(`Publication quotidienne terminée: ${successCount} succès, ${failCount} échecs`);
}

/**
 * Initialise le système de publication quotidienne
 * @param {Client} client - Le client Discord
 */
export function initDailyPost(client) {
    // Planifier la publication quotidienne à 9h00 tous les jours
    // Format cron: seconde minute heure jour mois jour_semaine
    // '0 9 * * *' = tous les jours à 9h00
    cron.schedule('0 9 * * *', async () => {
        await postDailyContent(client);
    }, {
        timezone: "Europe/Paris" // Ajustez selon votre fuseau horaire
    });

    logger.success('Système de publication quotidienne initialisé (9h00 tous les jours)');

    // Option: Poster immédiatement au démarrage (décommentez si souhaité)
    // setTimeout(() => postDailyContent(client), 5000);
}

export default { initDailyPost };
