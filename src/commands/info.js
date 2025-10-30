/**
 * Commande /info
 * Permet de poster une information dans le salon #infos
 */

import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';
import configManager from '../utils/configManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Publie une information dans le salon #infos')
        .addStringOption(option =>
            option
                .setName('sujet')
                .setDescription('Le sujet ou contenu de l\'information')
                .setRequired(true)
                .setMaxLength(2000)
        ),

    async execute(interaction) {
        try {
            const sujet = interaction.options.getString('sujet');
            const guild = interaction.guild;
            const author = interaction.user;
            const botMember = guild.members.me;

            // Chercher le salon #infos
            let infoChannel = guild.channels.cache.find(
                channel => channel.name === 'infos' && channel.type === ChannelType.GuildText
            );

            // Si le salon n'existe pas, essayer de le créer
            if (!infoChannel) {
                // Vérifier les permissions
                if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return await interaction.reply({
                        content: '❌ Le salon #infos n\'existe pas et je n\'ai pas la permission de le créer. Veuillez créer un salon nommé "infos" ou me donner la permission "Gérer les salons".',
                        ephemeral: true
                    });
                }

                // Créer le salon
                infoChannel = await guild.channels.create({
                    name: 'infos',
                    type: ChannelType.GuildText,
                    topic: '📢 Informations importantes du serveur',
                    reason: `Salon créé automatiquement par K.Ring pour la commande /info`
                });

                logger.success(`Salon #infos créé sur ${guild.name}`);
                configManager.setInfoChannel(guild.id, infoChannel.id);
            }

            // Vérifier les permissions d'envoi
            if (!infoChannel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages)) {
                return await interaction.reply({
                    content: '❌ Je n\'ai pas la permission d\'envoyer des messages dans #infos.',
                    ephemeral: true
                });
            }

            // Créer l'embed d'information
            const infoEmbed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle('📢 Nouvelle Information')
                .setDescription(sujet)
                .setAuthor({
                    name: author.tag,
                    iconURL: author.displayAvatarURL({ dynamic: true })
                })
                .setFooter({
                    text: `Posté via K.Ring`
                })
                .setTimestamp();

            // Envoyer l'information dans #infos
            await infoChannel.send({ embeds: [infoEmbed] });

            // Confirmer à l'utilisateur
            await interaction.reply({
                content: `✅ Information publiée dans ${infoChannel}`,
                ephemeral: true
            });

            logger.info(`Information postée par ${author.tag} dans #infos sur ${guild.name}`);

        } catch (error) {
            logger.error('Erreur lors de l\'exécution de la commande /info', error);
            
            const errorMessage = '❌ Une erreur est survenue lors de la publication de l\'information.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
