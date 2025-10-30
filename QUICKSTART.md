# 🚀 Guide de Démarrage Rapide

Démarrez avec K.Ring en 5 minutes !

## Prérequis

- Node.js 18+ installé
- Un bot Discord créé sur le [Developer Portal](https://discord.com/developers/applications)

### 2. Configuration Discord

1. Allez sur https://discord.com/developers/applications
2. Cliquez sur **"New Application"**
3. Donnez un nom (ex: K.Ring) et acceptez les conditions
4. Dans l'onglet **Bot** :
   - Cliquez sur **"Add Bot"**
   - Activez ces 3 intents :
     - ✅ **PRESENCE INTENT**
     - ✅ **SERVER MEMBERS INTENT**
     - ✅ **MESSAGE CONTENT INTENT**
   - Cliquez sur **"Reset Token"** et copiez le token
5. Dans l'onglet **OAuth2 > URL Generator** :
   - Cochez **bot** et **applications.commands**
   - Dans les permissions, cochez **Administrator** (ou sélectionnez les permissions spécifiques)
   - Copiez l'URL générée et ouvrez-la pour inviter le bot

### 3. Installation du Projet

```bash
# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
```

### 4. Configuration

Éditez le fichier `.env` et remplissez :

```env
DISCORD_TOKEN=votre_token_copié_étape_2
CLIENT_ID=votre_application_id
GUILD_ID=votre_server_id_optionnel
```

**Pour obtenir CLIENT_ID :**
- Dans le Developer Portal > General Information > Application ID

**Pour obtenir GUILD_ID (optionnel, pour tests) :**
- Discord > Paramètres > Avancé > Mode développeur (activer)
- Clic droit sur votre serveur > Copier l'identifiant du serveur

### 5. Déployer les Commandes

```bash
npm run deploy
```

Attendez le message de confirmation ✅

### 6. Lancer le Bot

```bash
npm start
```

Vous devriez voir :
```
╔════════════════════════════════════════╗
║      K.Ring Bot - Opérationnel !      ║
╚════════════════════════════════════════╝
```

## ✅ Vérification

Sur votre serveur Discord, tapez `/` et vous devriez voir les commandes du bot :
- `/info`
- `/calc`
- `/setwelcome`
- `/status`

## 🎯 Premiers Tests

1. **Tester la calculatrice :**
   ```
   /calc expression:2 + 2
   ```

2. **Voir le statut :**
   ```
   /status
   ```

3. **Poster une info :**
   ```
   /info sujet:Bienvenue sur le serveur !
   ```

4. **Configurer le rôle de bienvenue (Admin) :**
   ```
   /setwelcome role:@Membre
   ```

5. **Mentionner le bot :**
   ```
   @K.Ring bonjour !
   ```

## 🐛 Problèmes Courants

### Les commandes n'apparaissent pas
- Attendez quelques minutes
- Vérifiez que `npm run deploy` s'est bien exécuté
- Rechargez Discord (Ctrl+R)

### Le bot ne se connecte pas
- Vérifiez votre token dans `.env`
- Assurez-vous que les intents sont activés dans le Developer Portal

### Erreur de permissions
- Vérifiez que le bot a les permissions nécessaires sur le serveur
- Le rôle du bot doit être au-dessus des rôles qu'il gère

## 📚 Documentation Complète

Consultez le [README.md](README.md) pour la documentation complète.

## 💡 Astuces

- **Mode développement** avec rechargement automatique :
  ```bash
  npm run dev
  ```

- **Logs** : Consultez le dossier `logs/` pour le débogage

- **Configuration** : Les paramètres par serveur sont dans `config/guild-config.json`

## 🎉 C'est Tout !

Votre bot K.Ring est maintenant opérationnel ! 🤖

Pour toute question, consultez le README ou les logs d'erreur.
