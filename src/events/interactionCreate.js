/**
 * Événement interactionCreate
 * Gère toutes les interactions (commandes slash, boutons, menus, etc.)
 * SÉCURITÉ: Intègre toutes les vérifications de sécurité avant exécution
 */

import logger from '../utils/logger.js';
import commandSecurity from '../security/commandSecurity.js';
import securityLogger from '../security/securityLogger.js';

export default {
    name: 'interactionCreate',
    once: false,

    async execute(interaction) {
        // Gérer uniquement les commandes slash
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`Commande inconnue: ${interaction.commandName}`);
            return;
        }

        try {
            // SÉCURITÉ: Vérifier toutes les conditions de sécurité
            const securityCheck = await commandSecurity.checkSecurity(interaction);
            
            if (!securityCheck.allowed) {
                // Bloquer la commande et informer l'utilisateur
                await interaction.reply({
                    content: securityCheck.reason,
                    ephemeral: true
                });
                return;
            }

            // SÉCURITÉ: Vérifier si l'utilisateur est suspect
            if (commandSecurity.isUserSuspicious(interaction.user)) {
                securityLogger.log('WARNING', 'SUSPICIOUS_USER_COMMAND', {
                    userId: interaction.user.id,
                    username: interaction.user.tag,
                    commandName: interaction.commandName,
                    guildId: interaction.guild?.id
                });
            }

            logger.info(`Commande /${interaction.commandName} exécutée par ${interaction.user.tag} sur ${interaction.guild?.name || 'DM'}`);
            
            // Exécuter la commande
            await command.execute(interaction);
            
        } catch (error) {
            logger.error(`Erreur lors de l'exécution de /${interaction.commandName}`, error);
            
            // SÉCURITÉ: Logger les erreurs de sécurité
            securityLogger.logSecurityError(error, {
                commandName: interaction.commandName,
                userId: interaction.user.id,
                guildId: interaction.guild?.id
            });

            const errorMessage = {
                content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
                ephemeral: true
            };

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            } catch (replyError) {
                logger.error('Impossible de répondre à l\'interaction', replyError);
            }
        }
    }
};
