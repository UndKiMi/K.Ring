/**
 * Commande /status
 * Affiche les statistiques et fonctionnalités du bot
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';
import configManager from '../utils/configManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Affiche les statistiques et fonctionnalités du bot'),

    async execute(interaction) {
        try {
            const client = interaction.client;
            const guild = interaction.guild;

            // Récupérer les statistiques
            const serverCount = client.guilds.cache.size;
            const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const channelCount = client.channels.cache.size;
            const commandCount = client.commands.size;

            // Récupérer la configuration du serveur actuel
            const guildConfig = configManager.getGuildConfig(guild.id);
            const welcomeRole = guildConfig.welcomeRoleId 
                ? guild.roles.cache.get(guildConfig.welcomeRoleId)?.name || 'Rôle introuvable'
                : 'Non configuré';

            // Calculer l'uptime
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            let uptimeString = '';
            if (days > 0) uptimeString += `${days}j `;
            if (hours > 0) uptimeString += `${hours}h `;
            if (minutes > 0) uptimeString += `${minutes}m `;
            uptimeString += `${seconds}s`;

            // Calculer l'utilisation mémoire
            const memoryUsage = process.memoryUsage();
            const memoryMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

            // Créer l'embed de status
            const statusEmbed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle('🤖 K.Ring - Statut du Bot')
                .setDescription('*Inspiré d\'Alan Turing (1912-1954)*\n\nBot Discord professionnel avec gestion avancée de serveur.')
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    {
                        name: '📊 Statistiques Globales',
                        value: [
                            `**Serveurs:** ${serverCount}`,
                            `**Utilisateurs:** ${userCount.toLocaleString('fr-FR')}`,
                            `**Salons:** ${channelCount}`,
                            `**Commandes:** ${commandCount}`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '⚙️ Système',
                        value: [
                            `**Uptime:** ${uptimeString}`,
                            `**Mémoire:** ${memoryMB} MB`,
                            `**Node.js:** ${process.version}`,
                            `**Ping:** ${client.ws.ping}ms`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '🎯 Fonctionnalités Actives',
                        value: [
                            '✅ Commandes Slash',
                            '✅ Système de bienvenue',
                            '✅ Publications quotidiennes',
                            '✅ Calculatrice mathématique',
                            '✅ Gestion d\'informations',
                            '✅ Réponse aux mentions'
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '⚙️ Configuration du Serveur',
                        value: [
                            `**Rôle de bienvenue:** ${welcomeRole}`,
                            `**Salon #infos:** ${guildConfig.infoChannelId ? `<#${guildConfig.infoChannelId}>` : 'Auto-créé'}`,
                            `**Salon #daily:** ${guildConfig.dailyChannelId ? `<#${guildConfig.dailyChannelId}>` : 'Auto-créé'}`
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '📝 Commandes Disponibles',
                        value: [
                            '`/info [sujet]` - Publier une information',
                            '`/calc [expression]` - Calculatrice',
                            '`/setwelcome [role]` - Config bienvenue (Admin)',
                            '`/status` - Afficher ce statut'
                        ].join('\n'),
                        inline: false
                    }
                )
                .setFooter({
                    text: `Demandé par ${interaction.user.tag} • K.Ring v1.0.0`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await interaction.reply({ embeds: [statusEmbed] });

            logger.info(`Commande /status exécutée par ${interaction.user.tag} sur ${guild.name}`);

        } catch (error) {
            logger.error('Erreur lors de l\'exécution de la commande /status', error);
            
            const errorMessage = '❌ Une erreur est survenue lors de la récupération du statut.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
