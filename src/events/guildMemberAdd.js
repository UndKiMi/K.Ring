/**
 * Événement guildMemberAdd
 * Déclenché lorsqu'un nouveau membre rejoint le serveur
 * Gère le message de bienvenue et l'attribution automatique de rôle
 * SÉCURITÉ: Détection anti-raid et vérification des nouveaux membres
 */

import { ChannelType, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';
import configManager from '../utils/configManager.js';
import antiRaid from '../security/antiRaid.js';
import securityLogger from '../security/securityLogger.js';

export default {
    name: 'guildMemberAdd',
    once: false,

    async execute(member) {
        const guild = member.guild;
        
        try {
            logger.info(`Nouveau membre: ${member.user.tag} a rejoint ${guild.name}`);

            // SÉCURITÉ: Détecter les raids potentiels
            const isRaidSuspect = antiRaid.trackJoin(guild.id, member.user.id);
            
            if (isRaidSuspect) {
                // Activer le lockdown automatique
                antiRaid.enableLockdown(guild.id);
                
                // Logger l'incident
                securityLogger.logRaidDetected(
                    guild.id,
                    guild.name,
                    antiRaid.joinTracking.get(`join:${guild.id}`).length
                );
                
                // Alerter les admins (optionnel: envoyer un message dans un salon admin)
                await notifyAdminsOfRaid(guild);
                
                // Ne pas envoyer de message de bienvenue pendant un raid
                return;
            }

            // SÉCURITÉ: Vérifier si le nom d'utilisateur est suspect
            if (antiRaid.detectSuspiciousUsername(member.user.username)) {
                securityLogger.log('WARNING', 'SUSPICIOUS_NEW_MEMBER', {
                    userId: member.user.id,
                    username: member.user.username,
                    guildId: guild.id,
                    guildName: guild.name,
                    accountAge: Date.now() - member.user.createdTimestamp
                });
            }

            // SÉCURITÉ: Vérifier l'âge du compte (comptes très récents = suspects)
            const accountAgeMs = Date.now() - member.user.createdTimestamp;
            const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);
            
            if (accountAgeDays < 7) {
                securityLogger.log('INFO', 'NEW_ACCOUNT_JOINED', {
                    userId: member.user.id,
                    username: member.user.username,
                    guildId: guild.id,
                    accountAgeDays: Math.floor(accountAgeDays)
                });
            }

            // 1. Envoyer le message de bienvenue dans #general
            await sendWelcomeMessage(member);

            // 2. Attribuer le rôle de bienvenue si configuré
            await assignWelcomeRole(member);

        } catch (error) {
            logger.error(`Erreur lors du traitement du nouveau membre ${member.user.tag} sur ${guild.name}`, error);
            securityLogger.logSecurityError(error, {
                event: 'guildMemberAdd',
                userId: member.user.id,
                guildId: guild.id
            });
        }
    }
};

/**
 * SÉCURITÉ: Notifie les administrateurs d'un raid détecté
 * @param {Guild} guild - Le serveur
 */
async function notifyAdminsOfRaid(guild) {
    try {
        // Chercher un salon admin ou logs
        const adminChannel = guild.channels.cache.find(
            channel => ['admin', 'logs', 'mod-logs', 'security'].includes(channel.name.toLowerCase()) &&
                      channel.type === ChannelType.GuildText
        );

        if (adminChannel && adminChannel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)) {
            const alertEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle('🚨 ALERTE RAID DÉTECTÉ')
                .setDescription('Un raid potentiel a été détecté sur ce serveur.')
                .addFields(
                    { name: '⚠️ Action', value: 'Mode lockdown activé automatiquement', inline: false },
                    { name: '⏱️ Durée', value: '5 minutes', inline: true },
                    { name: '🔒 Statut', value: 'Nouvelles commandes bloquées', inline: true }
                )
                .setTimestamp();

            await adminChannel.send({ embeds: [alertEmbed] });
        }
    } catch (error) {
        logger.error('Erreur lors de la notification admin du raid', error);
    }
}

/**
 * Envoie un message de bienvenue dans le salon #general
 * @param {GuildMember} member - Le nouveau membre
 */
async function sendWelcomeMessage(member) {
    const guild = member.guild;

    try {
        // Chercher le salon #general
        let generalChannel = guild.channels.cache.find(
            channel => channel.name === 'general' && channel.type === ChannelType.GuildText
        );

        // Si pas de #general, chercher le premier salon texte accessible
        if (!generalChannel) {
            generalChannel = guild.channels.cache.find(
                channel => channel.type === ChannelType.GuildText &&
                           channel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)
            );
        }

        if (!generalChannel) {
            logger.warn(`Pas de salon accessible pour le message de bienvenue sur ${guild.name}`);
            return;
        }

        // Vérifier les permissions
        if (!generalChannel.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)) {
            logger.warn(`Pas de permission pour envoyer le message de bienvenue dans ${generalChannel.name} sur ${guild.name}`);
            return;
        }

        // Créer l'embed de bienvenue
        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('👋 Bienvenue !')
            .setDescription(`Bienvenue sur **${guild.name}**, ${member} !\n\nNous sommes ravis de t'accueillir parmi nous. N'hésite pas à te présenter et à découvrir notre communauté !`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👤 Membre', value: member.user.tag, inline: true },
                { name: '📊 Membre n°', value: `${guild.memberCount}`, inline: true },
                { name: '📅 Compte créé le', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`, inline: true }
            )
            .setFooter({
                text: `K.Ring Bot • ${guild.name}`,
                iconURL: guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        await generalChannel.send({
            content: `${member}`,
            embeds: [welcomeEmbed]
        });

        logger.success(`Message de bienvenue envoyé pour ${member.user.tag} dans ${generalChannel.name} sur ${guild.name}`);

    } catch (error) {
        logger.error(`Erreur lors de l'envoi du message de bienvenue pour ${member.user.tag} sur ${guild.name}`, error);
    }
}

/**
 * Attribue le rôle de bienvenue configuré au nouveau membre
 * @param {GuildMember} member - Le nouveau membre
 */
async function assignWelcomeRole(member) {
    const guild = member.guild;

    try {
        // Récupérer le rôle configuré
        const welcomeRoleId = configManager.getWelcomeRole(guild.id);

        if (!welcomeRoleId) {
            logger.debug(`Pas de rôle de bienvenue configuré sur ${guild.name}`);
            return;
        }

        // Vérifier que le rôle existe
        const role = guild.roles.cache.get(welcomeRoleId);
        if (!role) {
            logger.warn(`Rôle de bienvenue ${welcomeRoleId} introuvable sur ${guild.name}`);
            return;
        }

        // Vérifier les permissions du bot
        const botMember = guild.members.me;
        if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
            logger.warn(`Pas de permission pour attribuer des rôles sur ${guild.name}`);
            return;
        }

        // Vérifier la hiérarchie des rôles
        if (role.position >= botMember.roles.highest.position) {
            logger.warn(`Le rôle ${role.name} est trop élevé dans la hiérarchie sur ${guild.name}`);
            return;
        }

        // Attribuer le rôle
        await member.roles.add(role, 'Attribution automatique du rôle de bienvenue par K.Ring');
        
        logger.success(`Rôle ${role.name} attribué à ${member.user.tag} sur ${guild.name}`);

    } catch (error) {
        logger.error(`Erreur lors de l'attribution du rôle de bienvenue à ${member.user.tag} sur ${guild.name}`, error);
    }
}
