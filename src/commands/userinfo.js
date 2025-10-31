/**
 * Commande /userinfo - Version Premium Design
 * Affiche les informations d'un utilisateur avec un design moderne et élégant
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';

/**
 * Calcule l'âge d'un compte en format lisible français
 * @param {number} timestamp - Timestamp de création
 * @returns {string} Âge formaté
 */
function getAccountAge(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (years > 0) return `${years} an${years > 1 ? 's' : ''}`;
    if (months > 0) return `${months} mois`;
    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
    return `${hours} heure${hours > 1 ? 's' : ''}`;
}

/**
 * Génère une phrase personnalisée selon le statut
 * @param {string} status - Statut de l'utilisateur
 * @param {boolean} isBot - Si c'est un bot
 * @returns {string} Phrase personnalisée
 */
function getStatusPhrase(status, isBot) {
    if (isBot) {
        return '🤖 *Cet utilisateur est un bot automatisé*';
    }
    
    const phrases = {
        online: '✨ *Actuellement en ligne et disponible*',
        idle: '💤 *Absent ou inactif pour le moment*',
        dnd: '🔴 *Ne souhaite pas être dérangé*',
        offline: '💫 *Hors ligne ou invisible*'
    };
    
    return phrases[status] || phrases.offline;
}

/**
 * Obtient une couleur selon le statut (design moderne)
 * @param {string} status - Statut de l'utilisateur
 * @param {string} memberColor - Couleur du rôle le plus élevé
 * @returns {number} Couleur en hexadécimal
 */
function getStatusColor(status, memberColor) {
    // Si l'utilisateur a une couleur de rôle, l'utiliser
    if (memberColor && memberColor !== '#000000') {
        return parseInt(memberColor.replace('#', ''), 16);
    }
    
    // Sinon, couleurs modernes selon le statut
    const colors = {
        online: 0x43B581,   // Vert Discord moderne
        idle: 0xFAA61A,     // Orange/Jaune moderne
        dnd: 0xF04747,      // Rouge Discord moderne
        offline: 0x747F8D   // Gris moderne
    };
    
    return colors[status] || colors.offline;
}

/**
 * Récupère les badges Discord de l'utilisateur
 * @param {User} user - L'utilisateur Discord
 * @returns {string} Badges formatés avec emojis
 */
function getUserBadges(user) {
    const flags = user.flags?.toArray() || [];
    
    // Mapping des badges avec leurs emojis et descriptions
    const badgeMap = {
        'Staff': { emoji: '🛡️', name: 'Discord Staff', description: 'Employé Discord' },
        'Partner': { emoji: '🤝', name: 'Partnered Server Owner', description: 'Propriétaire serveur partenaire' },
        'Hypesquad': { emoji: '🎉', name: 'HypeSquad Events', description: 'Membre HypeSquad Events' },
        'HypeSquadOnlineHouse1': { emoji: '💜', name: 'HypeSquad Bravery', description: 'Maison Bravery' },
        'HypeSquadOnlineHouse2': { emoji: '🧡', name: 'HypeSquad Brilliance', description: 'Maison Brilliance' },
        'HypeSquadOnlineHouse3': { emoji: '💚', name: 'HypeSquad Balance', description: 'Maison Balance' },
        'BugHunterLevel1': { emoji: '🐛', name: 'Bug Hunter', description: 'Chasseur de bugs niveau 1' },
        'BugHunterLevel2': { emoji: '🐛✨', name: 'Bug Hunter Gold', description: 'Chasseur de bugs niveau 2' },
        'VerifiedDeveloper': { emoji: '⚙️', name: 'Early Verified Bot Developer', description: 'Développeur vérifié' },
        'PremiumEarlySupporter': { emoji: '💎', name: 'Early Supporter', description: 'Supporter précoce' },
        'ActiveDeveloper': { emoji: '🔧', name: 'Active Developer', description: 'Développeur actif' },
        'CertifiedModerator': { emoji: '🎓', name: 'Certified Moderator', description: 'Modérateur certifié' }
    };
    
    if (flags.length === 0) {
        return '*Aucun badge public*';
    }
    
    const badges = flags
        .filter(flag => badgeMap[flag])
        .map(flag => {
            const badge = badgeMap[flag];
            return `${badge.emoji} **${badge.name}**\n*${badge.description}*`;
        });
    
    return badges.length > 0 ? badges.join('\n\n') : '*Aucun badge public*';
}

/**
 * Détecte le rôle le plus important de l'utilisateur
 * @param {GuildMember} member - Le membre du serveur
 * @returns {Object} Informations sur le rôle principal
 */
function getHighestRole(member) {
    const roles = member.roles.cache
        .filter(role => role.id !== member.guild.id)
        .sort((a, b) => b.position - a.position);
    
    if (roles.size === 0) {
        return {
            name: 'Membre standard',
            color: '#99AAB5',
            emoji: '👤',
            description: 'Aucun rôle spécial'
        };
    }
    
    const topRole = roles.first();
    
    // Déterminer le type de rôle selon les permissions
    let roleType = '👤 Membre';
    let description = 'Rôle standard';
    
    if (member.permissions.has('Administrator')) {
        roleType = '👑 Administrateur';
        description = 'Contrôle total du serveur';
    } else if (member.permissions.has('ManageGuild')) {
        roleType = '⚜️ Gestionnaire';
        description = 'Gestion du serveur';
    } else if (member.permissions.has('ModerateMembers') || member.permissions.has('KickMembers') || member.permissions.has('BanMembers')) {
        roleType = '🛡️ Modérateur';
        description = 'Modération des membres';
    } else if (member.permissions.has('ManageMessages')) {
        roleType = '🔨 Modérateur Junior';
        description = 'Gestion des messages';
    } else if (topRole.position > 1) {
        roleType = '⭐ Membre VIP';
        description = 'Rôle spécial';
    }
    
    return {
        name: topRole.name,
        color: topRole.hexColor || '#99AAB5',
        emoji: roleType.split(' ')[0],
        type: roleType,
        description: description,
        position: topRole.position
    };
}

/**
 * Vérifie si l'utilisateur a un avatar animé (Nitro)
 * @param {User} user - L'utilisateur Discord
 * @returns {Object} Informations sur l'avatar
 */
function getAvatarInfo(user) {
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 512 });
    const isAnimated = avatarURL.includes('.gif');
    
    return {
        url: avatarURL,
        isAnimated: isAnimated,
        hasNitro: isAnimated || user.banner !== null,
        indicator: isAnimated ? '✨ Avatar animé (Nitro)' : '📷 Avatar statique'
    };
}

export default {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Affiche les informations d\'un utilisateur avec un design moderne')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('L\'utilisateur à afficher (vous par défaut)')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
            const member = await interaction.guild.members.fetch(targetUser.id);
            
            // Récupérer les données complètes de l'utilisateur (pour les badges)
            const fullUser = await targetUser.fetch();

            // ═══════════════════════════════════════════════════════
            // RÉCUPÉRATION DES DONNÉES
            // ═══════════════════════════════════════════════════════

            const status = member.presence?.status || 'offline';
            const isBot = targetUser.bot;
            
            // Calculer les âges
            const accountAge = getAccountAge(targetUser.createdTimestamp);
            const memberAge = getAccountAge(member.joinedTimestamp);
            
            // Récupérer les badges Discord
            const userBadges = getUserBadges(fullUser);
            
            // Récupérer le rôle le plus important
            const highestRole = getHighestRole(member);
            
            // Informations sur l'avatar
            const avatarInfo = getAvatarInfo(targetUser);
            
            // Récupérer les rôles avec couleurs
            const rolesFiltered = member.roles.cache
                .filter(role => role.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position);
            
            const topRoles = Array.from(rolesFiltered.values()).slice(0, 8);
            const remainingCount = rolesFiltered.size - 8;
            
            // Formater les rôles avec badges colorés
            let roleDisplay = '';
            if (topRoles.length > 0) {
                roleDisplay = topRoles.map(role => {
                    const color = role.hexColor !== '#000000' ? role.hexColor : '';
                    return `\`${role.name}\``;
                }).join(' • ');
                
                if (remainingCount > 0) {
                    roleDisplay += `\n*+${remainingCount} autre${remainingCount > 1 ? 's' : ''} rôle${remainingCount > 1 ? 's' : ''}*`;
                }
            } else {
                roleDisplay = '*Aucun rôle attribué*';
            }

            // ═══════════════════════════════════════════════════════
            // ICÔNES ET EMOJIS MODERNES
            // ═══════════════════════════════════════════════════════

            const statusEmojis = {
                online: '🟢',
                idle: '🟡',
                dnd: '🔴',
                offline: '⚫'
            };
            
            const statusLabels = {
                online: 'En ligne',
                idle: 'Absent',
                dnd: 'Ne pas déranger',
                offline: 'Hors ligne'
            };

            // ═══════════════════════════════════════════════════════
            // CONSTRUCTION DE L'EMBED PREMIUM
            // ═══════════════════════════════════════════════════════

            const userInfoEmbed = new EmbedBuilder()
                .setColor(getStatusColor(status, member.displayHexColor))
                .setAuthor({
                    name: `${targetUser.username} ${avatarInfo.hasNitro ? '✨' : ''}`,
                    iconURL: avatarInfo.url
                })
                .setDescription(`${getStatusPhrase(status, isBot)}\n\n${avatarInfo.indicator}`)
                .setThumbnail(avatarInfo.url)
                
                // ═══ SECTION IDENTITÉ ═══
                .addFields({
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '**👤 IDENTITÉ**',
                    inline: false
                })
                .addFields(
                    {
                        name: '🆔 Identifiant',
                        value: `\`\`\`${targetUser.id}\`\`\``,
                        inline: true
                    },
                    {
                        name: '📛 Pseudo serveur',
                        value: member.nickname ? `**${member.nickname}**` : '*Aucun pseudo*',
                        inline: true
                    },
                    {
                        name: '🏷️ Tag Discord',
                        value: `**${targetUser.tag}**`,
                        inline: true
                    }
                )
                
                // ═══ SECTION STATUT ═══
                .addFields({
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '**📊 STATUT & PRÉSENCE**',
                    inline: false
                })
                .addFields(
                    {
                        name: '💫 Statut actuel',
                        value: `${statusEmojis[status] || '⚫'} **${statusLabels[status] || 'Hors ligne'}**`,
                        inline: true
                    },
                    {
                        name: '🎮 Activité',
                        value: member.presence?.activities?.[0]?.name || '*Aucune activité*',
                        inline: true
                    },
                    {
                        name: '👤 Type de compte',
                        value: isBot ? '**Bot** 🤖' : '**Utilisateur** 👤',
                        inline: true
                    }
                )
                
                // ═══ SECTION RÔLE PRINCIPAL ═══
                .addFields({
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '**👑 RÔLE PRINCIPAL**',
                    inline: false
                })
                .addFields({
                    name: `${highestRole.emoji} ${highestRole.type}`,
                    value: [
                        `**Nom:** \`${highestRole.name}\``,
                        `**Type:** ${highestRole.description}`,
                        `**Position:** #${highestRole.position}`,
                        `**Couleur:** ${highestRole.color}`
                    ].join('\n'),
                    inline: false
                })
                
                // ═══ SECTION BADGES DISCORD ═══
                .addFields({
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '**🏆 BADGES DISCORD**',
                    inline: false
                })
                .addFields({
                    name: '⠀',
                    value: userBadges,
                    inline: false
                })
                
                // ═══ SECTION DATES ═══
                .addFields({
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '**📅 HISTORIQUE**',
                    inline: false
                })
                .addFields(
                    {
                        name: '🎂 Compte créé',
                        value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:D>\n*Il y a ${accountAge}*`,
                        inline: true
                    },
                    {
                        name: '📥 A rejoint le serveur',
                        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>\n*Il y a ${memberAge}*`,
                        inline: true
                    },
                    {
                        name: '📊 Position d\'arrivée',
                        value: `**#${Array.from(interaction.guild.members.cache.values())
                            .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
                            .findIndex(m => m.id === member.id) + 1}** / ${interaction.guild.memberCount}`,
                        inline: true
                    }
                )
                
                // ═══ SECTION RÔLES ═══
                .addFields({
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: `**🎭 RÔLES** • \`${rolesFiltered.size}\` rôle${rolesFiltered.size > 1 ? 's' : ''}`,
                    inline: false
                })
                .addFields({
                    name: '⠀', // Espace invisible pour le design
                    value: roleDisplay,
                    inline: false
                })
                
                // ═══ SECTION PERMISSIONS ═══
                .addFields({
                    name: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    value: '**🔐 PERMISSIONS CLÉS**',
                    inline: false
                })
                .addFields({
                    name: '⠀',
                    value: [
                        member.permissions.has('Administrator') ? '✅ Administrateur' : '❌ Administrateur',
                        member.permissions.has('ManageGuild') ? '✅ Gérer le serveur' : '❌ Gérer le serveur',
                        member.permissions.has('ManageChannels') ? '✅ Gérer les salons' : '❌ Gérer les salons',
                        member.permissions.has('ManageRoles') ? '✅ Gérer les rôles' : '❌ Gérer les rôles',
                        member.permissions.has('KickMembers') ? '✅ Expulser des membres' : '❌ Expulser des membres',
                        member.permissions.has('BanMembers') ? '✅ Bannir des membres' : '❌ Bannir des membres'
                    ].join('\n'),
                    inline: false
                })
                
                .setFooter({
                    text: `Demandé par ${interaction.user.username} • K.Ring Premium`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            // Ajouter la bannière si elle existe (effet visuel premium)
            if (targetUser.banner) {
                userInfoEmbed.setImage(targetUser.bannerURL({ size: 2048 }));
            }

            await interaction.reply({ embeds: [userInfoEmbed] });

            logger.info(`Commande /userinfo exécutée par ${interaction.user.tag} pour ${targetUser.tag}`);

        } catch (error) {
            logger.error('Erreur lors de l\'exécution de la commande /userinfo', error);
            
            const errorMessage = '❌ Une erreur est survenue lors de la récupération des informations de l\'utilisateur.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
