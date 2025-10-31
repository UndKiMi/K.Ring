/**
 * Commande /ping
 * Affiche la latence du bot
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot'),

    async execute(interaction) {
        try {
            const sent = await interaction.reply({ 
                content: '🏓 Pong! Calcul de la latence...', 
                fetchReply: true 
            });

            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(interaction.client.ws.ping);

            // Déterminer la couleur selon la latence
            let color = 0x2ecc71; // Vert
            if (latency > 200 || apiLatency > 200) {
                color = 0xf39c12; // Orange
            }
            if (latency > 500 || apiLatency > 500) {
                color = 0xe74c3c; // Rouge
            }

            const pingEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle('🏓 Pong!')
                .addFields(
                    { name: '📡 Latence du bot', value: `${latency}ms`, inline: true },
                    { name: '💬 Latence API Discord', value: `${apiLatency}ms`, inline: true }
                )
                .setFooter({
                    text: `Demandé par ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await interaction.editReply({ 
                content: null,
                embeds: [pingEmbed] 
            });

            logger.info(`Commande /ping exécutée par ${interaction.user.tag} - Latence: ${latency}ms`);

        } catch (error) {
            logger.error('Erreur lors de l\'exécution de la commande /ping', error);
            
            const errorMessage = '❌ Une erreur est survenue lors du calcul de la latence.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
