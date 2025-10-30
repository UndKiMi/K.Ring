/**
 * Événement messageCreate
 * Déclenché lorsqu'un message est envoyé
 * Gère les réponses aux mentions du bot
 * SÉCURITÉ: Détection de spam et filtrage de contenu
 */

import { PermissionFlagsBits } from 'discord.js';
import logger from '../utils/logger.js';
import antiRaid from '../security/antiRaid.js';
import inputValidator from '../security/inputValidator.js';
import securityLogger from '../security/securityLogger.js';

export default {
    name: 'messageCreate',
    once: false,

    async execute(message) {
        // Ignorer les messages des bots
        if (message.author.bot) return;

        // SÉCURITÉ: Détecter le spam
        if (message.guild) {
            const isSpam = antiRaid.detectSpam(
                message.author.id,
                message.content,
                message.guild.id
            );

            if (isSpam) {
                securityLogger.logSpamDetected(
                    message.author.id,
                    message.author.tag,
                    message.guild.id,
                    5 // Seuil de spam
                );

                // Optionnel: Supprimer le message de spam
                try {
                    if (message.deletable) {
                        await message.delete();
                        logger.warn(`Message de spam supprimé de ${message.author.tag}`);
                    }
                } catch (error) {
                    logger.error('Erreur lors de la suppression du spam', error);
                }

                return;
            }
        }

        // SÉCURITÉ: Filtrer le contenu suspect
        const contentValidation = inputValidator.validate(message.content, {
            maxLength: 2000,
            allowLinks: true,
            allowCode: false
        });

        if (!contentValidation.valid) {
            securityLogger.logSuspiciousContent(
                message.author.id,
                message.author.tag,
                'message',
                contentValidation.reason
            );

            // Optionnel: Supprimer le contenu suspect
            try {
                if (message.deletable && message.guild) {
                    await message.delete();
                    logger.warn(`Contenu suspect supprimé de ${message.author.tag}: ${contentValidation.reason}`);
                }
            } catch (error) {
                logger.error('Erreur lors de la suppression du contenu suspect', error);
            }

            return;
        }

        // Ignorer les messages sans mention du bot
        if (!message.mentions.has(message.client.user)) return;

        try {
            // Vérifier les permissions
            if (!message.channel.permissionsFor(message.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
                logger.warn(`Pas de permission pour répondre dans ${message.channel.name} sur ${message.guild.name}`);
                return;
            }

            // Liste de réponses variées
            const responses = [
                `Bonjour ${message.author} ! 👋 Comment puis-je vous aider ?`,
                `Salut ${message.author} ! 🤖 Utilisez \`/status\` pour voir mes fonctionnalités !`,
                `Hey ${message.author} ! ✨ Je suis K.Ring, votre assistant Discord. Tapez \`/\` pour voir mes commandes !`,
                `${message.author} ! 🎯 Besoin d'aide ? Essayez \`/info\`, \`/calc\` ou \`/status\` !`,
                `Vous m'avez appelé, ${message.author} ? 🔔 Je suis là pour vous aider !`,
                `${message.author} ! 💡 Saviez-vous que je peux faire des calculs mathématiques ? Essayez \`/calc\` !`,
                `Coucou ${message.author} ! 🌟 En hommage à Alan Turing, je suis là pour vous servir !`,
                `${message.author} ! 📊 Tapez \`/status\` pour découvrir tout ce que je peux faire !`
            ];

            // Sélectionner une réponse aléatoire
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            // Envoyer la réponse
            await message.reply(randomResponse);

            logger.info(`Réponse à mention de ${message.author.tag} dans ${message.channel.name} sur ${message.guild.name}`);

        } catch (error) {
            logger.error(`Erreur lors de la réponse à la mention de ${message.author.tag}`, error);
            securityLogger.logSecurityError(error, {
                event: 'messageCreate',
                userId: message.author.id,
                guildId: message.guild?.id
            });
        }
    }
};
