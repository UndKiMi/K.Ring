import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    console.log('🗑️  Suppression des commandes globales...');
    
    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: [] }
    );
    
    console.log('✅ Commandes globales supprimées avec succès !');
    console.log('💡 Les commandes du serveur restent actives.');
} catch (error) {
    console.error('❌ Erreur:', error);
}
