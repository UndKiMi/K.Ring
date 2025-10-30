# K.Ring Bot Discord 🤖🔒

**K.Ring** est un bot Discord professionnel, modulaire et **sécurisé**, nommé en hommage à Alan Turing. Il offre des fonctionnalités avancées de gestion de serveur, calculs mathématiques, système de bienvenue, et publications automatiques.

## 🛡️ Sécurité Production-Ready

Ce bot intègre **toutes les protections de sécurité** recommandées pour un déploiement en production 2025:
- ✅ Protection anti-raid et anti-spam
- ✅ Rate limiting complet
- ✅ Validation stricte des entrées
- ✅ Logging de sécurité
- ✅ Filtrage de contenu malveillant
- ✅ Protection des secrets

**Voir:** [SECURITY_REPORT.md](SECURITY_REPORT.md) pour le rapport complet

## 🌟 Fonctionnalités

### Commandes Slash
- `/info [sujet]` - Publie une information dans le salon #infos
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
├── src/
│   ├── index.js                 # Point d'entrée principal
│   ├── deploy-commands.js       # Script de déploiement des commandes
│   ├── commands/                # Commandes slash
│   │   ├── info.js
│   │   ├── calc.js
│   │   ├── setwelcome.js
│   │   └── status.js
│   ├── events/                  # Gestionnaires d'événements
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   ├── guildMemberAdd.js
│   │   └── messageCreate.js
│   └── utils/                   # Utilitaires
│       ├── logger.js
│       ├── configManager.js
│       └── dailyPost.js
├── config/                      # Fichiers de configuration
│   ├── daily-content.json       # Contenu des publications quotidiennes
│   └── guild-config.json        # Configuration par serveur (auto-généré)
├── logs/                        # Journaux d'activité
├── .env                         # Variables d'environnement (à créer)
├── .env.example                 # Exemple de configuration
├── .gitignore
├── package.json
└── README.md
```

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

### Sur un VPS/Serveur dédié

1. Installez Node.js 18+
2. Clonez le projet
3. Installez les dépendances : `npm install --production`
4. Configurez `.env`
5. Utilisez PM2 pour la gestion du processus :

```bash
npm install -g pm2
pm2 start src/index.js --name k-ring
pm2 save
pm2 startup
```

### Sur Heroku

1. Créez une application Heroku
2. Ajoutez les variables d'environnement dans Settings > Config Vars
3. Déployez via Git ou GitHub integration

### Sur Railway/Render

1. Connectez votre repository
2. Configurez les variables d'environnement
3. Le déploiement se fait automatiquement

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou pull requests.

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

## 👨‍💻 Auteur

Créé avec ❤️ en hommage à Alan Turing

---

**Note** : Ce bot est conçu pour être éducatif et professionnel. Respectez les conditions d'utilisation de Discord et les lois applicables.
