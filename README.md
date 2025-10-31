# K.Ring


[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Fonctionnalités

- **Commandes slash** : `/info`, `/calc`, `/setwelcome`, `/status`
- **Système de bienvenue** : Attribution automatique de rôles
- **Calculatrice avancée** : Expressions mathématiques complexes
- **Publications quotidiennes** : Contenu programmé
- **Sécurité** : Rate limiting, anti-raid, validation des entrées

## Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd K.Ring

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos identifiants Discord

# Déployer les commandes
npm run deploy

# Lancer le bot
npm start
```

## Configuration

Créez un fichier `.env` avec :

```env
DISCORD_TOKEN=votre_token_bot
CLIENT_ID=votre_client_id
GUILD_ID=votre_guild_id_optionnel
```

**Obtenir les identifiants** :
1. [Discord Developer Portal](https://discord.com/developers/applications)
2. Créer une application → Bot → Copier le token
3. Activer les intents : `PRESENCE`, `SERVER MEMBERS`, `MESSAGE CONTENT`
4. Copier l'Application ID (CLIENT_ID)

**Inviter le bot** :
```
https://discord.com/api/oauth2/authorize?client_id=VOTRE_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

## Structure

```
src/
├── commands/      # Commandes slash
├── events/        # Événements Discord
├── security/      # Modules de sécurité
└── utils/         # Utilitaires
```

## Scripts

```bash
npm start          # Démarrer
npm run dev        # Mode développement
npm run deploy     # Déployer les commandes
```

## Déploiement

**PM2** (recommandé) :
```bash
npm install -g pm2
pm2 start src/index.js --name k-ring
pm2 save && pm2 startup
```

**Alternatives** : Railway, Render, Docker

## Licence

MIT
