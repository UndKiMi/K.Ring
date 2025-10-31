/**
 * Commande /monitor
 * Affiche les métriques de performance du bot (Admin uniquement)
 * 
 * OPTIMISATIONS :
 * - Réponse ephemeral pour ne pas polluer
 * - Calculs asynchrones
 * - Format compact et lisible
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import performanceMonitor from '../utils/performanceMonitor.js';
import logger from '../utils/logger.js';
import os from 'os';

export default {
    data: new SlashCommandBuilder()
        .setName('monitor')
        .setDescription('[Admin] Affiche les métriques de performance du bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('Action à effectuer')
                .addChoices(
                    { name: 'Afficher les stats', value: 'show' },
                    { name: 'Réinitialiser les métriques', value: 'reset' }
                )
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const action = interaction.options.getString('action') || 'show';
            
            if (action === 'reset') {
                performanceMonitor.reset();
                return await interaction.reply({
                    content: '✅ Métriques de performance réinitialisées.',
                    ephemeral: true
                });
            }

            // Générer le rapport
            const report = performanceMonitor.generateReport(interaction.client);
            
            // Créer l'embed
            const monitorEmbed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle('📊 Monitoring K.Ring')
                .setDescription('Métriques de performance en temps réel')
                .addFields(
                    {
                        name: '⏱️ Uptime',
                        value: report.uptime,
                        inline: true
                    },
                    {
                        name: '📡 Ping Discord',
                        value: `${report.ping}ms`,
                        inline: true
                    },
                    {
                        name: '🖥️ CPU Load',
                        value: report.cpu.load,
                        inline: true
                    },
                    {
                        name: '💾 Mémoire',
                        value: `${report.memory.used}MB / ${report.memory.total}MB\nRSS: ${report.memory.rss}MB`,
                        inline: true
                    },
                    {
                        name: '🔧 CPU',
                        value: `${report.cpu.cores} cores\n${report.cpu.model.substring(0, 30)}...`,
                        inline: true
                    },
                    {
                        name: '📊 Serveurs',
                        value: `${interaction.client.guilds.cache.size}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: 'K.Ring Performance Monitor',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            // Ajouter les stats des commandes
            const commandStats = [];
            for (const [name, stats] of Object.entries(report.commands)) {
                if (stats && stats.count > 0) {
                    commandStats.push(
                        `**/${name}**: ${stats.avg}ms avg | ${stats.p95}ms p95 | ${stats.count} calls`
                    );
                }
            }

            if (commandStats.length > 0) {
                monitorEmbed.addFields({
                    name: '⚡ Latence des commandes',
                    value: commandStats.slice(0, 10).join('\n') || 'Aucune donnée',
                    inline: false
                });
            }

            await interaction.reply({
                embeds: [monitorEmbed],
                ephemeral: true
            });

            logger.info(`Rapport de performance consulté par ${interaction.user.tag}`);

        } catch (error) {
            logger.error('Erreur /monitor:', error);
            await interaction.reply({
                content: '❌ Erreur lors de la génération du rapport.',
                ephemeral: true
            });
        }
    }
};
