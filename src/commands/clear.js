/**
 * Commande /clear
 * Supprime un nombre de messages dans le salon (modération)
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime un nombre de messages dans le salon (modération)')
        .addIntegerOption(option =>
            option
                .setName('nombre')
                .setDescription('Nombre de messages à supprimer (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        try {
            const amount = interaction.options.getInteger('nombre');
            const channel = interaction.channel;

            // Vérifier les permissions du bot
            if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageMessages)) {
                return await interaction.reply({
                    content: '❌ Je n\'ai pas la permission de gérer les messages dans ce salon.',
                    ephemeral: true
                });
            }

            // Répondre immédiatement (éphémère)
            await interaction.reply({
                content: `🗑️ Suppression de ${amount} message(s) en cours...`,
                ephemeral: true
            });

            // Supprimer les messages
            const deleted = await channel.bulkDelete(amount, true);

            // Confirmer la suppression
            await interaction.editReply({
                content: `✅ ${deleted.size} message(s) supprimé(s) avec succès.`
            });

            logger.info(`${deleted.size} message(s) supprimé(s) dans ${channel.name} par ${interaction.user.tag} sur ${interaction.guild.name}`);

        } catch (error) {
            logger.error('Erreur lors de l\'exécution de la commande /clear', error);
            
            let errorMessage = '❌ Une erreur est survenue lors de la suppression des messages.';
            
            if (error.code === 50034) {
                errorMessage = '❌ Impossible de supprimer des messages de plus de 14 jours.';
            }
            
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
