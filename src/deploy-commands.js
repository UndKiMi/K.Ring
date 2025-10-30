/**
 * Script de déploiement des commandes slash
 * Enregistre toutes les commandes auprès de l'API Discord
 */

import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { token, clientId, guildId } = config.discord;

const commandsPath = path.join(__dirname, 'commands');

// Vérifier si le dossier commands existe
if (!fs.existsSync(commandsPath)) {
    console.error('❌ Dossier commands introuvable');
    process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('📦 Chargement des commandes...\n');

// Charger toutes les commandes avec Promise.all
const commandPromises = commandFiles.map(file => {
    const filePath = path.join(commandsPath, file);
    return import(`file://${filePath}`)
        .then(command => {
            if ('data' in command.default && 'execute' in command.default) {
                console.log(`✅ ${command.default.data.name} - ${command.default.data.description}`);
                return command.default.data.toJSON();
            } else {
                console.log(`⚠️  ${file} - Structure invalide (manque 'data' ou 'execute')`);
                return null;
            }
        })
        .catch(error => {
            console.error(`❌ Erreur lors du chargement de ${file}:`, error.message);
            return null;
        });
});

// Attendre que toutes les commandes soient chargées
const loadedCommands = await Promise.all(commandPromises);
const commands = loadedCommands.filter(cmd => cmd !== null);

console.log(`\n📊 Total: ${commands.length} commande(s) à déployer\n`);

// Créer une instance REST
const rest = new REST({ version: '10' }).setToken(token);

try {
    console.log('🚀 Déploiement des commandes slash...\n');

    let data;

    if (guildId) {
        // Déploiement sur un serveur spécifique (instantané, pour les tests)
        console.log(`📍 Déploiement sur le serveur ${guildId} (mode test)`);
        data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        console.log(`✅ ${data.length} commande(s) déployée(s) sur le serveur de test`);
    } else {
        // Déploiement global (peut prendre jusqu'à 1 heure)
        console.log('🌍 Déploiement global (peut prendre jusqu\'à 1 heure)');
        data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        console.log(`✅ ${data.length} commande(s) déployée(s) globalement`);
    }

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   Déploiement terminé avec succès !    ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log('💡 Commandes déployées:');
    data.forEach(cmd => {
        console.log(`   • /${cmd.name}`);
    });

    console.log('\n📝 Note: Si vous avez déployé globalement, les commandes');
    console.log('   peuvent prendre jusqu\'à 1 heure pour apparaître.');
    console.log('   Pour des tests instantanés, utilisez GUILD_ID dans .env\n');

} catch (error) {
    console.error('\n❌ Erreur lors du déploiement:', error);
    
    if (error.code === 50001) {
        console.error('\n⚠️  Erreur: Le bot n\'a pas accès au serveur spécifié.');
        console.error('   Vérifiez que GUILD_ID est correct et que le bot est sur le serveur.\n');
    } else if (error.code === 'TokenInvalid') {
        console.error('\n⚠️  Erreur: Token Discord invalide.');
        console.error('   Vérifiez votre DISCORD_TOKEN dans le fichier .env\n');
    }
}
