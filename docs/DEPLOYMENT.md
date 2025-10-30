# Guide de Déploiement K.Ring Bot

## Prérequis

- Node.js 18.x ou supérieur
- npm 9.x ou supérieur
- Compte Discord Developer
- Git (pour le déploiement via GitHub)

## Configuration initiale

### 1. Variables d'environnement

Créez un fichier `.env` à la racine :

```env
# Discord Bot Configuration
DISCORD_TOKEN=votre_token_bot_discord
CLIENT_ID=votre_client_id
GUILD_ID=votre_guild_id_optionnel

# Logging (optionnel)
LOG_LEVEL=info
```

### 2. Installation des dépendances

```bash
npm install --production
```

Pour le développement (avec ESLint et Prettier) :
```bash
npm install
```

### 3. Déploiement des commandes

```bash
npm run deploy
```

## Déploiement en Production

### Option 1 : VPS / Serveur dédié (Recommandé)

#### Installation

```bash
# Cloner le repository
git clone https://github.com/yourusername/k-ring-bot.git
cd k-ring-bot

# Installer les dépendances
npm install --production

# Configurer les variables d'environnement
cp .env.example .env
nano .env  # Éditer avec vos valeurs

# Déployer les commandes
npm run deploy
```

#### Utilisation de PM2 (Process Manager)

PM2 garantit que le bot redémarre automatiquement en cas de crash.

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer le bot
pm2 start src/index.js --name k-ring

# Sauvegarder la configuration PM2
pm2 save

# Configurer le démarrage automatique au boot
pm2 startup

# Autres commandes utiles
pm2 status           # Voir le statut
pm2 logs k-ring      # Voir les logs
pm2 restart k-ring   # Redémarrer
pm2 stop k-ring      # Arrêter
pm2 delete k-ring    # Supprimer
```

#### Configuration PM2 avancée

Créez `ecosystem.config.cjs` :

```javascript
module.exports = {
    apps: [{
        name: 'k-ring',
        script: './src/index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        env: {
            NODE_ENV: 'production',
        },
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    }],
};
```

Puis démarrer avec :
```bash
pm2 start ecosystem.config.cjs
```

### Option 2 : Railway

Railway offre un déploiement simple et gratuit (avec limitations).

#### Déploiement

1. Créez un compte sur [Railway.app](https://railway.app)
2. Connectez votre repository GitHub
3. Créez un nouveau projet
4. Ajoutez les variables d'environnement dans l'interface
5. Railway détecte automatiquement Node.js et déploie

#### Configuration Railway

Créez `railway.json` (optionnel) :

```json
{
    "$schema": "https://railway.app/railway.schema.json",
    "build": {
        "builder": "NIXPACKS"
    },
    "deploy": {
        "startCommand": "npm start",
        "restartPolicyType": "ON_FAILURE",
        "restartPolicyMaxRetries": 10
    }
}
```

### Option 3 : Render

Render offre également un tier gratuit pour les services.

#### Déploiement

1. Créez un compte sur [Render.com](https://render.com)
2. Créez un nouveau "Background Worker"
3. Connectez votre repository
4. Configuration :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Ajoutez les variables d'environnement

### Option 4 : Heroku

⚠️ Heroku n'a plus de tier gratuit, mais reste une option viable.

#### Déploiement

```bash
# Installer Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Se connecter
heroku login

# Créer l'application
heroku create k-ring-bot

# Configurer les variables
heroku config:set DISCORD_TOKEN=votre_token
heroku config:set CLIENT_ID=votre_client_id

# Déployer
git push heroku main

# Voir les logs
heroku logs --tail
```

Créez `Procfile` :
```
worker: node src/index.js
```

### Option 5 : Docker

#### Dockerfile

Créez `Dockerfile` :

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p logs config

# Utilisateur non-root pour la sécurité
USER node

# Démarrer le bot
CMD ["node", "src/index.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  k-ring-bot:
    build: .
    container_name: k-ring-bot
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### Commandes Docker

```bash
# Build et démarrer
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Redémarrer
docker-compose restart

# Arrêter
docker-compose down
```

## Mise à jour en production

### Avec Git

```bash
# Sauvegarder les fichiers de config
cp config/guild-config.json config/guild-config.json.backup

# Récupérer les mises à jour
git pull origin main

# Installer les nouvelles dépendances
npm install --production

# Redéployer les commandes si nécessaire
npm run deploy

# Redémarrer le bot
pm2 restart k-ring
```

### Avec Docker

```bash
# Récupérer les mises à jour
git pull origin main

# Rebuild et redémarrer
docker-compose up -d --build
```

## Monitoring et Logs

### Logs locaux

Les logs sont dans `logs/` :
- `combined.log` : Tous les logs
- `error.log` : Erreurs uniquement

### Rotation des logs

Avec `logrotate` (Linux) :

```bash
# /etc/logrotate.d/k-ring
/chemin/vers/k-ring/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    missingok
    copytruncate
}
```

### Monitoring avec PM2

```bash
# Monitoring en temps réel
pm2 monit

# Statistiques
pm2 show k-ring
```

## Sécurité en production

### Checklist

- [ ] `.env` n'est pas commité (vérifier `.gitignore`)
- [ ] Variables d'environnement configurées sur la plateforme
- [ ] Permissions Discord minimales nécessaires
- [ ] Rate limiting activé
- [ ] Logs de sécurité activés
- [ ] Mises à jour de sécurité npm (`npm audit`)
- [ ] HTTPS pour les webhooks (si utilisés)
- [ ] Firewall configuré (VPS uniquement)

### Permissions Discord recommandées

Permissions minimales pour le bot :
- Gérer les rôles
- Gérer les canaux
- Envoyer des messages
- Gérer les messages
- Intégrer des liens
- Lire l'historique des messages
- Ajouter des réactions
- Utiliser les commandes slash

## Sauvegarde

### Fichiers à sauvegarder

- `config/guild-config.json` : Configuration des serveurs
- `logs/` : Historique des logs (optionnel)
- `.env` : Variables d'environnement (sécurisé)

### Script de sauvegarde

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/k-ring"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Sauvegarder la config
cp config/guild-config.json $BACKUP_DIR/guild-config_$DATE.json

# Compresser les logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz logs/

# Garder seulement les 7 dernières sauvegardes
find $BACKUP_DIR -type f -mtime +7 -delete
```

## Dépannage

### Le bot ne démarre pas

```bash
# Vérifier les logs
pm2 logs k-ring --lines 100

# Vérifier les variables d'environnement
pm2 env k-ring

# Tester manuellement
node src/index.js
```

### Les commandes ne s'affichent pas

```bash
# Redéployer les commandes
npm run deploy

# Vérifier les permissions du bot
# Le bot doit avoir la permission "applications.commands"
```

### Erreurs de mémoire

```bash
# Augmenter la limite mémoire PM2
pm2 delete k-ring
pm2 start src/index.js --name k-ring --max-memory-restart 1G
```

## Performance

### Optimisations recommandées

- Utiliser PM2 en mode cluster (si nécessaire)
- Configurer la rotation des logs
- Monitorer l'utilisation mémoire
- Nettoyer régulièrement les anciennes données

### Métriques à surveiller

- Uptime du bot
- Temps de réponse des commandes
- Utilisation CPU/RAM
- Taille des fichiers de logs
- Nombre de serveurs

## Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Discord.js
- Vérifier les logs d'erreur
