/**
 * Messages constants pour K.Ring Bot
 * Centralise tous les messages utilisateur pour faciliter la maintenance et l'i18n future
 */

export const MESSAGES = {
    // Erreurs génériques
    errors: {
        generic: '❌ Une erreur est survenue. Veuillez réessayer.',
        noPermission: '❌ Vous n\'avez pas la permission d\'utiliser cette commande.',
        botNoPermission: '❌ Je n\'ai pas les permissions nécessaires pour effectuer cette action.',
        rateLimited: '⏱️ Vous allez trop vite ! Réessayez dans {seconds} seconde(s).',
        invalidInput: '❌ Entrée invalide. Veuillez vérifier vos paramètres.',
    },

    // Succès
    success: {
        commandExecuted: '✅ Commande exécutée avec succès.',
        configUpdated: '✅ Configuration mise à jour.',
        channelCreated: '✅ Salon créé avec succès.',
    },

    // Bienvenue
    welcome: {
        title: '👋 Bienvenue sur le serveur !',
        description: 'Nous sommes ravis de t\'accueillir parmi nous, {user} !',
        footer: 'K.Ring Bot - Inspiré d\'Alan Turing',
    },

    // Daily posts
    daily: {
        jokeTitle: '😄 Blague du jour',
        tipTitle: '💡 Conseil du jour',
    },

    // Commandes
    commands: {
        info: {
            success: '✅ Information publiée dans {channel}',
            channelCreated: '📢 Salon #infos créé automatiquement.',
        },
        calc: {
            result: '🔢 Résultat : {result}',
            error: '❌ Expression mathématique invalide.',
        },
        setwelcome: {
            success: '✅ Rôle de bienvenue défini : {role}',
            removed: '✅ Rôle de bienvenue supprimé.',
        },
        status: {
            title: '📊 Statut de K.Ring',
        },
    },

    // Logs
    logs: {
        botStarted: 'Bot démarré avec succès',
        botStopped: 'Bot arrêté',
        commandLoaded: 'Commande chargée: {name}',
        eventLoaded: 'Événement chargé: {name}',
        guildJoined: 'Rejoint le serveur: {name}',
        guildLeft: 'Quitté le serveur: {name}',
    },
};

/**
 * Remplace les placeholders dans un message
 * @param {string} message - Message avec placeholders
 * @param {Object} params - Paramètres à remplacer
 * @returns {string} Message formaté
 */
export function formatMessage(message, params = {}) {
    return message.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
}

export default MESSAGES;
