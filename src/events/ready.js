/**
 * Événement ready
 * Déclenché lorsque le bot est connecté et prêt
 */

import { ActivityType } from 'discord.js';
import logger from '../utils/logger.js';

export default {
    name: 'ready',
    once: true,

    execute(client) {
        logger.success(`✅ Bot connecté en tant que ${client.user.tag}`);
        logger.info(`📊 Présent sur ${client.guilds.cache.size} serveur(s)`);
        logger.info(`👥 ${client.users.cache.size} utilisateurs en cache`);
        
        // Définir le statut du bot
        client.user.setPresence({
            activities: [{
                name: '/status | K.Ring Bot',
                type: ActivityType.Watching
            }],
            status: 'online'
        });

        logger.info('╔════════════════════════════════════════╗');
        logger.info('║      K.Ring Bot - Opérationnel !      ║');
        logger.info('╚════════════════════════════════════════╝');

        // Afficher les serveurs
        logger.debug('\n📋 Serveurs connectés:');
        client.guilds.cache.forEach(guild => {
            logger.debug(`   • ${guild.name} (${guild.memberCount} membres)`);
        });

        logger.info('\n🚀 Le bot est prêt à recevoir des commandes !');
    }
};
