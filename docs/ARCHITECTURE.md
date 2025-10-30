# Architecture K.Ring Bot

## Vue d'ensemble

K.Ring est structuré selon une architecture modulaire et scalable, suivant les meilleures pratiques de développement backend.

## Structure des dossiers

```
K.Ring/
├── .github/
│   └── workflows/          # CI/CD avec GitHub Actions
│       └── ci.yml
├── config/                 # Fichiers de configuration JSON
│   ├── daily-content.json  # Contenu des publications quotidiennes
│   └── guild-config.json   # Configuration par serveur (auto-généré)
├── docs/                   # Documentation du projet
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── API.md
├── logs/                   # Journaux d'activité (auto-généré)
│   ├── combined.log
│   └── error.log
├── src/                    # Code source
│   ├── commands/           # Commandes slash Discord
│   │   ├── calc.js
│   │   ├── info.js
│   │   ├── setwelcome.js
│   │   └── status.js
│   ├── config/             # Configuration centralisée
│   │   └── index.js
│   ├── constants/          # Constantes et messages
│   │   └── messages.js
│   ├── events/             # Gestionnaires d'événements Discord
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   ├── guildMemberAdd.js
│   │   └── messageCreate.js
│   ├── security/           # Modules de sécurité
│   │   ├── antiRaid.js
│   │   ├── commandSecurity.js
│   │   ├── inputValidator.js
│   │   ├── rateLimiter.js
│   │   └── securityLogger.js
│   ├── utils/              # Utilitaires réutilisables
│   │   ├── configManager.js
│   │   ├── dailyPost.js
│   │   ├── helpers.js
│   │   └── logger.js
│   ├── index.js            # Point d'entrée principal
│   └── deploy-commands.js  # Script de déploiement des commandes
├── .env                    # Variables d'environnement (à créer)
├── .env.example            # Template des variables
├── .eslintrc.json          # Configuration ESLint
├── .gitignore
├── .prettierrc.json        # Configuration Prettier
├── package.json
└── README.md
```

## Principes architecturaux

### 1. Séparation des responsabilités

Chaque module a une responsabilité unique et bien définie :

- **commands/** : Logique métier des commandes
- **events/** : Gestion des événements Discord
- **security/** : Couche de sécurité (rate limiting, validation, anti-raid)
- **utils/** : Fonctions utilitaires réutilisables
- **config/** : Configuration centralisée

### 2. Configuration centralisée

Toute la configuration est centralisée dans `src/config/index.js` :
- Variables d'environnement
- Constantes du bot
- Paramètres de sécurité
- Configuration des couleurs, channels, etc.

### 3. Gestion des erreurs

Système de gestion d'erreurs à plusieurs niveaux :
- Try/catch dans chaque commande
- Gestionnaires globaux pour les erreurs non capturées
- Logging détaillé avec stack traces

### 4. Logging structuré

Système de logging avec niveaux de sévérité :
- `debug` : Informations de débogage
- `info` : Informations générales
- `warn` : Avertissements
- `error` : Erreurs avec stack traces
- `success` : Opérations réussies

### 5. Sécurité en profondeur

Plusieurs couches de sécurité :
- **Rate Limiting** : Limite les abus par utilisateur
- **Input Validation** : Valide toutes les entrées utilisateur
- **Anti-Raid** : Détecte et bloque les raids
- **Command Security** : Vérifie les permissions

## Flux de données

### Commande Slash

```
Utilisateur → Discord API → interactionCreate Event
                                    ↓
                            Rate Limiter Check
                                    ↓
                            Input Validation
                                    ↓
                            Command Security
                                    ↓
                            Command Execute
                                    ↓
                            Response → Discord API → Utilisateur
```

### Événement (ex: nouveau membre)

```
Discord API → guildMemberAdd Event
                    ↓
            Anti-Raid Check
                    ↓
            Config Manager (récupère le rôle)
                    ↓
            Assign Role + Send Welcome
                    ↓
            Logger (enregistre l'action)
```

## Patterns utilisés

### 1. Singleton Pattern
- `rateLimiter` : Instance unique partagée
- `configManager` : Gestion centralisée de la config
- `logger` : Logger unique pour tout le bot

### 2. Command Pattern
Chaque commande est un module autonome avec :
```javascript
export default {
    data: SlashCommandBuilder,
    async execute(interaction) { ... }
}
```

### 3. Event-Driven Architecture
Le bot réagit aux événements Discord de manière asynchrone.

### 4. Factory Pattern
Les helpers créent des objets complexes (channels, embeds) de manière standardisée.

## Extensibilité

### Ajouter une nouvelle commande

1. Créer `src/commands/macommande.js`
2. Exporter `data` (SlashCommandBuilder) et `execute`
3. Le système de chargement automatique l'intègre

### Ajouter un nouvel événement

1. Créer `src/events/monevent.js`
2. Exporter `name`, `execute`, et optionnellement `once`
3. Chargement automatique au démarrage

### Ajouter un module de sécurité

1. Créer dans `src/security/`
2. Importer dans `interactionCreate.js` ou autre event
3. Appliquer avant l'exécution de la commande

## Performance

### Optimisations implémentées

- **Chargement asynchrone** : Toutes les I/O sont asynchrones
- **Caching** : Discord.js cache automatiquement les données
- **Cleanup automatique** : Rate limiter nettoie les anciennes entrées
- **Lazy loading** : Les modules sont chargés uniquement quand nécessaire

### Métriques à surveiller

- Temps de réponse des commandes
- Utilisation mémoire (Map du rate limiter)
- Taille des fichiers de logs
- Nombre de requêtes API Discord

## Sécurité

### Bonnes pratiques implémentées

✅ Variables d'environnement pour les secrets  
✅ Validation stricte des entrées  
✅ Rate limiting par utilisateur et commande  
✅ Logging de sécurité  
✅ Protection anti-raid  
✅ Permissions vérifiées avant exécution  
✅ Pas de secrets dans le code  
✅ .gitignore configuré correctement  

## Maintenance

### Logs

Les logs sont stockés dans `logs/` :
- `combined.log` : Tous les logs
- `error.log` : Uniquement les erreurs

Rotation recommandée : tous les 7 jours ou 100 MB.

### Configuration par serveur

Stockée dans `config/guild-config.json`, format :
```json
{
  "guilds": {
    "GUILD_ID": {
      "welcomeRoleId": "ROLE_ID",
      "infoChannelId": "CHANNEL_ID",
      "dailyChannelId": "CHANNEL_ID"
    }
  }
}
```

### Mise à jour des dépendances

```bash
npm outdated          # Vérifier les mises à jour
npm update            # Mettre à jour (minor/patch)
npm audit             # Vérifier les vulnérabilités
npm audit fix         # Corriger automatiquement
```

## Tests (à implémenter)

Structure recommandée :
```
tests/
├── unit/
│   ├── utils/
│   └── security/
├── integration/
│   └── commands/
└── e2e/
    └── scenarios/
```

## Déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour les instructions détaillées.

## Contribution

Voir [CONTRIBUTING.md](../CONTRIBUTING.md) pour les guidelines de contribution.
