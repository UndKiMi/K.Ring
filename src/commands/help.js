/**
 * Commande /help
 * Affiche l'aide et la liste des commandes disponibles
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche l\'aide et la liste des commandes disponibles'),

    async execute(interaction) {
        try {
            const helpEmbed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle('📚 K.Ring - Guide d\'utilisation')
                .setDescription('*Inspiré d\'Alan Turing (1912-1954)*\n\nVoici toutes les commandes disponibles :')
                .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    {
                        name: '🧮 /calc [expression]',
                        value: 'Calculatrice mathématique avancée\n• Supporte les opérations complexes\n• Grands nombres (BigNumber)\n• Exemples : `2+2`, `sqrt(16)`, `factorial(20)`, `798379857389 x 58904385704`',
                        inline: false
                    },
                    {
                        name: '📢 /info [sujet]',
                        value: 'Publier une information dans #infos\n• Crée le salon automatiquement si absent\n• Embed professionnel\n• Exemple : `/info Réunion demain à 15h`',
                        inline: false
                    },
                    {
                        name: '⚙️ /setwelcome [role]',
                        value: 'Configurer le rôle de bienvenue (Admin)\n• Attribution automatique aux nouveaux membres\n• Laisser vide pour désactiver\n• Exemple : `/setwelcome @Membre`',
                        inline: false
                    },
                    {
                        name: '📊 /status',
                        value: 'Afficher les statistiques du bot\n• Informations système\n• Fonctionnalités actives\n• Configuration du serveur',
                        inline: false
                    },
                    {
                        name: '❓ /help',
                        value: 'Afficher ce message d\'aide',
                        inline: false
                    }
                )
                .addFields(
                    {
                        name: '🤖 Fonctionnalités automatiques',
                        value: [
                            '• **Bienvenue** : Message automatique dans #general',
                            '• **Mention** : Répond quand vous me mentionnez',
                            '• **Daily** : Blague/conseil quotidien à 9h dans #daily',
                            '• **Anti-spam** : Protection contre les raids et le spam',
                            '• **Sécurité** : Validation des entrées et rate limiting'
                        ].join('\n'),
                        inline: false
                    }
                )
                .setFooter({
                    text: `K.Ring Bot v2.0 • Demandé par ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await interaction.reply({ embeds: [helpEmbed], ephemeral: true });

            logger.info(`Commande /help exécutée par ${interaction.user.tag}`);

        } catch (error) {
            logger.error('Erreur lors de l\'exécution de la commande /help', error);
            
            const errorMessage = '❌ Une erreur est survenue lors de l\'affichage de l\'aide.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
