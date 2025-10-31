/**
 * Commande /serverinfo
 * Affiche les informations détaillées du serveur
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Affiche les informations détaillées du serveur'),

    async execute(interaction) {
        try {
            const guild = interaction.guild;

            // Récupérer les statistiques
            const owner = await guild.fetchOwner();
            const channels = guild.channels.cache;
            const textChannels = channels.filter(c => c.type === 0).size;
            const voiceChannels = channels.filter(c => c.type === 2).size;
            const categories = channels.filter(c => c.type === 4).size;
            const roles = guild.roles.cache.size;
            const emojis = guild.emojis.cache.size;
            const boostLevel = guild.premiumTier;
            const boostCount = guild.premiumSubscriptionCount || 0;

            // Niveau de vérification
            const verificationLevels = {
                0: 'Aucune',
                1: 'Faible',
                2: 'Moyenne',
                3: 'Élevée',
                4: 'Très élevée'
            };

            const serverInfoEmbed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle(`📋 Informations sur ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
                .addFields(
                    {
                        name: '👑 Propriétaire',
                        value: `${owner.user.tag}`,
                        inline: true
                    },
                    {
                        name: '📅 Créé le',
                        value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
                        inline: true
                    },
                    {
                        name: '🆔 ID du serveur',
                        value: `\`${guild.id}\``,
                        inline: true
                    },
                    {
                        name: '👥 Membres',
                        value: `${guild.memberCount} membres`,
                        inline: true
                    },
                    {
                        name: '💬 Salons',
                        value: `${textChannels} texte\n${voiceChannels} vocal\n${categories} catégories`,
                        inline: true
                    },
                    {
                        name: '🎭 Rôles',
                        value: `${roles} rôles`,
                        inline: true
                    },
                    {
                        name: '😀 Emojis',
                        value: `${emojis} emojis`,
                        inline: true
                    },
                    {
                        name: '🔒 Niveau de vérification',
                        value: verificationLevels[guild.verificationLevel] || 'Inconnu',
                        inline: true
                    },
                    {
                        name: '⚡ Boosts',
                        value: `Niveau ${boostLevel}\n${boostCount} boost(s)`,
                        inline: true
                    }
                )
                .setFooter({
                    text: `Demandé par ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            // Ajouter la bannière si elle existe
            if (guild.banner) {
                serverInfoEmbed.setImage(guild.bannerURL({ size: 1024 }));
            }

            await interaction.reply({ embeds: [serverInfoEmbed] });

            logger.info(`Commande /serverinfo exécutée par ${interaction.user.tag} sur ${guild.name}`);

        } catch (error) {
            logger.error('Erreur lors de l\'exécution de la commande /serverinfo', error);
            
            const errorMessage = '❌ Une erreur est survenue lors de la récupération des informations du serveur.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
