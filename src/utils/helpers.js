/**
 * Fonctions utilitaires réutilisables
 */

import { PermissionFlagsBits } from 'discord.js';

/**
 * Vérifie si un membre a une permission spécifique
 * @param {GuildMember} member - Membre à vérifier
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
export function hasPermission(member, permission) {
    return member.permissions.has(PermissionFlagsBits[permission]);
}

/**
 * Vérifie si le bot a une permission dans un salon
 * @param {GuildChannel} channel - Salon à vérifier
 * @param {GuildMember} botMember - Membre bot
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
export function botHasChannelPermission(channel, botMember, permission) {
    return channel.permissionsFor(botMember).has(PermissionFlagsBits[permission]);
}

/**
 * Trouve ou crée un salon
 * @param {Guild} guild - Serveur Discord
 * @param {string} channelName - Nom du salon
 * @param {Object} options - Options de création
 * @returns {Promise<GuildChannel>}
 */
export async function findOrCreateChannel(guild, channelName, options = {}) {
    const { ChannelType } = await import('discord.js');
    
    let channel = guild.channels.cache.find(
        ch => ch.name === channelName && ch.type === ChannelType.GuildText
    );

    if (!channel) {
        channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            ...options,
        });
    }

    return channel;
}

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number} num - Nombre à formater
 * @returns {string}
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Calcule le temps écoulé depuis une date
 * @param {Date} date - Date de départ
 * @returns {string} Temps formaté
 */
export function getUptime(date) {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const parts = [];
    if (days > 0) parts.push(`${days}j`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '< 1m';
}

/**
 * Tronque un texte à une longueur maximale
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string}
 */
export function truncate(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Vérifie si une chaîne est une URL valide
 * @param {string} str - Chaîne à vérifier
 * @returns {boolean}
 */
export function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * Attend un délai spécifié
 * @param {number} ms - Millisecondes à attendre
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Chunk un tableau en sous-tableaux de taille fixe
 * @param {Array} array - Tableau à découper
 * @param {number} size - Taille des chunks
 * @returns {Array<Array>}
 */
export function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Retire les doublons d'un tableau
 * @param {Array} array - Tableau avec doublons
 * @returns {Array}
 */
export function unique(array) {
    return [...new Set(array)];
}

/**
 * Capitalise la première lettre d'une chaîne
 * @param {string} str - Chaîne à capitaliser
 * @returns {string}
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
