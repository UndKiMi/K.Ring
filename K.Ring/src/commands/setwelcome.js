/**
 * Commande /setwelcome
 * Configure le rôle attribué automatiquement aux nouveaux membres
 * Réservée aux administrateurs
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import logger from '../utils/logger.js';
import configManager from '../utils/configManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configure le rôle attribué automatiquement aux nouveaux membres')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Le rôle à attribuer aux nouveaux membres (laisser vide pour désactiver)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const role = interaction.options.getRole('role');
            const guild = interaction.guild;

            // Si aucun rôle n'est fourni, désactiver la fonctionnalité
            if (!role) {
                configManager.setWelcomeRole(guild.id, null);
                
                await interaction.reply({
                    content: '✅ Attribution automatique de rôle désactivée.',
                    ephemeral: true
                });

                logger.info(`Attribution de rôle de bienvenue désactivée sur ${guild.name} par ${interaction.user.tag}`);
                return;
            }

            // Vérifier que le bot peut attribuer ce rôle
            const botMember = guild.members.me;
            const botHighestRole = botMember.roles.highest;

            // Le rôle du bot doit être au-dessus du rôle à attribuer
            if (role.position >= botHighestRole.position) {
                return await interaction.reply({
                    content: `❌ Je ne peux pas attribuer le rôle ${role} car il est au-dessus ou au même niveau que mon rôle le plus élevé.\n\n💡 Déplacez mon rôle au-dessus de ${role} dans les paramètres du serveur.`,
                    ephemeral: true
                });
            }

            // Vérifier que le rôle n'est pas @everyone
            if (role.id === guild.id) {
                return await interaction.reply({
                    content: '❌ Vous ne pouvez pas utiliser le rôle @everyone.',
                    ephemeral: true
                });
            }

            // Vérifier que le bot a la permission de gérer les rôles
            if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return await interaction.reply({
                    content: '❌ Je n\'ai pas la permission de gérer les rôles. Veuillez m\'accorder cette permission.',
                    ephemeral: true
                });
            }

            // Sauvegarder la configuration
            configManager.setWelcomeRole(guild.id, role.id);

            await interaction.reply({
                content: `✅ Le rôle ${role} sera maintenant attribué automatiquement aux nouveaux membres.\n\n💡 Assurez-vous que mon rôle reste au-dessus de ${role} dans la hiérarchie.`,
                ephemeral: true
            });

            logger.success(`Rôle de bienvenue configuré sur ${guild.name}: ${role.name} (${role.id}) par ${interaction.user.tag}`);

        } catch (error) {
            logger.error('Erreur lors de l\'exécution de la commande /setwelcome', error);
            
            const errorMessage = '❌ Une erreur est survenue lors de la configuration du rôle de bienvenue.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
