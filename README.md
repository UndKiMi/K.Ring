# K.Ring Bot Discord 🤖

**K.Ring** est un bot Discord professionnel, modulaire et **production-ready**, nommé en hommage à Alan Turing. Construit avec une architecture scalable et des pratiques de développement modernes.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4)](https://prettier.io/)

## ✨ Caractéristiques

### Architecture professionnelle
- 🏗️ **Architecture modulaire** : Séparation claire des responsabilités
- ⚙️ **Configuration centralisée** : Gestion simplifiée des paramètres
- 🔒 **Sécurité en profondeur** : Rate limiting, validation, anti-raid
- 📝 **Logging structuré** : Traçabilité complète des actions
- 🚀 **CI/CD intégré** : GitHub Actions pour l'automatisation
- 📚 **Documentation complète** : Architecture, déploiement, contribution

### Fonctionnalités
- ⚡ **Commandes slash modernes** : Interface Discord native
- 🎯 **Système de bienvenue** : Messages personnalisés et attribution de rôles
- 🔢 **Calculatrice avancée** : Expressions mathématiques complexes
- 📢 **Publications automatiques** : Contenu quotidien programmé
- 🛡️ **Protection anti-abus** : Rate limiting et détection de raids

## 🌟 Fonctionnalités

### Commandes Slash
- `/info [sujet]` - 🆕 Recherche et publie une actualité réelle sur le sujet dans #infos
- `/calc [expression]` - Évalue des expressions mathématiques complexes
- `/setwelcome [role]` - Configure le rôle attribué automatiquement aux nouveaux membres (Admin)
- `/status` - Affiche les statistiques et fonctionnalités du bot

### Systèmes Automatiques
- **Bienvenue** - Message de bienvenue dans #general avec attribution de rôle configurable
- **Publications quotidiennes** - Blagues et conseils quotidiens dans #daily
- **Réponse aux mentions** - Le bot répond quand il est mentionné
- **Logs** - Système de journalisation des activités et erreurs

## 📋 Prérequis

- **Node.js** version 18.0.0 ou supérieure
- **npm** (inclus avec Node.js)
- Un compte Discord Developer avec un bot créé

## 🚀 Installation

### 1. Cloner ou télécharger le projet

```bash
git clone <votre-repo>
cd K.Ring
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Créez un fichier `.env` à la racine du projet en copiant `.env.example` :

```bash
cp .env.example .env
```

Éditez le fichier `.env` et remplissez les valeurs :

```env
DISCORD_TOKEN=votre_token_bot_discord
CLIENT_ID=votre_client_id
GUILD_ID=votre_guild_id_optionnel
```

#### Obtenir vos identifiants Discord :

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application ou sélectionnez-en une existante
3. Dans l'onglet **Bot** :
   - Créez un bot si ce n'est pas déjà fait
   - Copiez le **Token** (DISCORD_TOKEN)
   - Activez les **Privileged Gateway Intents** :
     - ✅ PRESENCE INTENT
     - ✅ SERVER MEMBERS INTENT
     - ✅ MESSAGE CONTENT INTENT
4. Dans l'onglet **General Information** :
   - Copiez l'**Application ID** (CLIENT_ID)
5. Pour GUILD_ID (optionnel) :
   - Activez le mode développeur dans Discord (Paramètres > Avancés > Mode développeur)
   - Clic droit sur votre serveur > Copier l'identifiant du serveur

### 4. Inviter le bot sur votre serveur

Générez un lien d'invitation avec les permissions nécessaires :

```
https://discord.com/api/oauth2/authorize?client_id=VOTRE_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

Remplacez `VOTRE_CLIENT_ID` par votre CLIENT_ID.

**Permissions requises** :
- Gérer les rôles
- Gérer les canaux
- Envoyer des messages
- Gérer les messages
- Intégrer des liens
- Lire l'historique des messages
- Ajouter des réactions

### 5. Déployer les commandes slash

```bash
npm run deploy
```

Cette commande enregistre toutes les commandes slash auprès de Discord.

### 6. Lancer le bot

```bash
npm start
```

Pour le développement avec rechargement automatique :

```bash
npm run dev
```

## 📁 Structure du projet

```
K.Ring/
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline CI/CD
├── config/                      # Configuration JSON
│   ├── daily-content.json
│   └── guild-config.json        # Auto-généré
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # Architecture détaillée
│   └── DEPLOYMENT.md            # Guide de déploiement
├── logs/                        # Logs (auto-généré)
├── src/
│   ├── commands/                # Commandes slash
│   │   ├── calc.js
│   │   ├── info.js
│   │   ├── setwelcome.js
│   │   └── status.js
│   ├── config/                  # Configuration centralisée
│   │   └── index.js
│   ├── constants/               # Constantes et messages
│   │   └── messages.js
│   ├── events/                  # Événements Discord
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   ├── guildMemberAdd.js
│   │   └── messageCreate.js
│   ├── security/                # Modules de sécurité
│   │   ├── antiRaid.js
│   │   ├── commandSecurity.js
│   │   ├── inputValidator.js
│   │   ├── rateLimiter.js
│   │   └── securityLogger.js
│   ├── utils/                   # Utilitaires
│   │   ├── configManager.js
│   │   ├── dailyPost.js
│   │   ├── helpers.js
│   │   └── logger.js
│   ├── index.js                 # Point d'entrée
│   └── deploy-commands.js       # Déploiement des commandes
├── .env                         # Variables d'environnement (à créer)
├── .env.example
├── .eslintrc.json               # Configuration ESLint
├── .gitignore
├── .prettierrc.json             # Configuration Prettier
├── CONTRIBUTING.md              # Guide de contribution
├── package.json
└── README.md
```

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour plus de détails.

## 🔧 Configuration avancée

### Personnaliser les publications quotidiennes

Éditez `config/daily-content.json` pour ajouter vos propres blagues et conseils.

### Modifier l'heure de publication

Dans `src/utils/dailyPost.js`, modifiez le cron pattern :

```javascript
// Actuellement : tous les jours à 9h00
cron.schedule('0 9 * * *', async () => { ... });

// Exemples :
// '0 12 * * *'  -> Midi
// '0 18 * * *'  -> 18h00
// '0 */6 * * *' -> Toutes les 6 heures
```

## 🐛 Dépannage

### Le bot ne se connecte pas
- Vérifiez que votre token dans `.env` est correct
- Assurez-vous que les intents sont activés dans le Developer Portal

### Les commandes slash n'apparaissent pas
- Exécutez `npm run deploy` pour enregistrer les commandes
- Attendez quelques minutes (peut prendre jusqu'à 1h pour les commandes globales)
- Vérifiez que le bot a la permission `applications.commands`

### Erreurs de permissions
- Vérifiez que le bot a les permissions nécessaires sur le serveur
- Assurez-vous que le rôle du bot est au-dessus des rôles qu'il doit gérer

## 📝 Logs

Les logs sont stockés dans le dossier `logs/` :
- `combined.log` - Tous les logs
- `error.log` - Uniquement les erreurs

## 🚀 Déploiement en production

Plusieurs options de déploiement sont disponibles :

### VPS / Serveur dédié (Recommandé)
```bash
npm install -g pm2
pm2 start src/index.js --name k-ring
pm2 save && pm2 startup
```

### Plateformes Cloud
- **Railway** : Déploiement automatique depuis GitHub
- **Render** : Background worker avec auto-restart
- **Docker** : Container prêt à l'emploi

**Guide complet** : [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🛠️ Développement

### Scripts disponibles

```bash
npm start              # Démarrer le bot
npm run dev            # Mode développement (auto-reload)
npm run deploy         # Déployer les commandes slash
npm run lint           # Vérifier le code
npm run lint:fix       # Corriger automatiquement
npm run format         # Formater le code
npm run validate       # Valider tout (format + lint)
```

### Ajouter une commande

1. Créez `src/commands/macommande.js`
2. Suivez le pattern des commandes existantes
3. Le système de chargement l'intègre automatiquement

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'feat: add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines complètes.

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 👨‍💻 Auteur

Créé avec ❤️ en hommage à Alan Turing

---

**Note** : Ce bot est conçu pour être éducatif et professionnel. Respectez les conditions d'utilisation de Discord et les lois applicables.
