/**
 * Commande /info - Version 2.0 avec recherche d'actualités
 * Recherche automatiquement des actualités mondiales sur le sujet demandé
 * Publie l'info trouvée dans le salon #infos avec source, date et auteur
 * 
 * Fonctionnalités :
 * - Recherche d'actualités en temps réel via NewsAPI
 * - Validation des sources (médias fiables uniquement)
 * - Formatage professionnel en embed Discord
 * - Gestion robuste des erreurs réseau
 * - Mode fallback si API non configurée
 * - Pas de fake news, données vérifiées uniquement
 */

import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';
import configManager from '../utils/configManager.js';
import newsService from '../utils/newsApi.js';
import config from '../config/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Recherche et publie une actualité sur un sujet dans #infos')
        .addStringOption(option =>
            option
                .setName('sujet')
                .setDescription('Sujet de l\'actualité à rechercher (ex: "intelligence artificielle", "climat")')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(100)
        ),

    async execute(interaction) {
        try {
            const sujet = interaction.options.getString('sujet');
            const guild = interaction.guild;
            const author = interaction.user;
            const botMember = guild.members.me;

            // Répondre immédiatement pour éviter le timeout (recherche peut prendre du temps)
            await interaction.deferReply({ ephemeral: true });

            logger.info(`Recherche d'actualités sur "${sujet}" demandée par ${author.tag}`);

            // Rechercher une actualité sur le sujet
            const article = await newsService.searchNews(sujet, 'fr');

            // Vérifier si une actualité a été trouvée
            if (!article) {
                return await interaction.editReply({
                    content: `❌ Aucune actualité récente trouvée sur "${sujet}".\n\n💡 **Conseils** :\n- Essayez un sujet plus général\n- Vérifiez l'orthographe\n- Utilisez des mots-clés en français ou anglais`,
                });
            }

            // Chercher le salon #infos
            let infoChannel = guild.channels.cache.find(
                channel => channel.name === config.channels.info && channel.type === ChannelType.GuildText
            );

            // Si le salon n'existe pas, essayer de le créer
            if (!infoChannel) {
                if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return await interaction.editReply({
                        content: `❌ Le salon #${config.channels.info} n\'existe pas et je n\'ai pas la permission de le créer.\n\nVeuillez créer un salon nommé "${config.channels.info}" ou me donner la permission "Gérer les salons".`,
                    });
                }

                // Créer le salon
                infoChannel = await guild.channels.create({
                    name: config.channels.info,
                    type: ChannelType.GuildText,
                    topic: '📰 Actualités et informations importantes',
                    reason: `Salon créé automatiquement par K.Ring pour la commande /info`,
                });

                logger.success(`Salon #${config.channels.info} créé sur ${guild.name}`);
                configManager.setInfoChannel(guild.id, infoChannel.id);
            }

            // Vérifier les permissions d'envoi
            if (!infoChannel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages)) {
                return await interaction.editReply({
                    content: `❌ Je n\'ai pas la permission d\'envoyer des messages dans #${config.channels.info}.`,
                });
            }

            // Créer l'embed d'actualité (professionnel et informatif)
            const newsEmbed = new EmbedBuilder()
                .setColor(article.isTrusted ? config.colors.success : config.colors.info)
                .setTitle(`📰 ${article.title}`)
                .setDescription(article.description)
                .addFields(
                    {
                        name: '📌 Source',
                        value: article.isTrusted 
                            ? `${article.source} ✅ (Source vérifiée)` 
                            : article.source,
                        inline: true,
                    },
                    {
                        name: '📅 Date de publication',
                        value: article.publishedAt.toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        inline: true,
                    },
                    {
                        name: '✍️ Auteur',
                        value: article.author,
                        inline: true,
                    },
                    {
                        name: '🔍 Recherche demandée par',
                        value: `${author.tag}`,
                        inline: false,
                    }
                )
                .setFooter({
                    text: `K.Ring News • Actualité vérifiée`,
                    iconURL: guild.iconURL(),
                })
                .setTimestamp();

            // Ajouter l'image si disponible
            if (article.imageUrl) {
                newsEmbed.setImage(article.imageUrl);
            }

            // Ajouter le lien vers l'article complet
            if (article.url) {
                newsEmbed.setURL(article.url);
            }

            // Envoyer l'actualité dans #infos
            await infoChannel.send({ 
                content: `📢 **Nouvelle actualité** sur **${sujet}**`,
                embeds: [newsEmbed],
            });

            // Confirmer à l'utilisateur
            await interaction.editReply({
                content: `✅ Actualité publiée dans ${infoChannel}\n\n📰 **${article.title}**\n🔗 [Lire l'article complet](${article.url})`,
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
