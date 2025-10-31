# 🎮 K.Ring Bot Manager

## 📋 Description

Interface console interactive pour gérer facilement le bot Discord K.Ring.

## 🚀 Démarrage Rapide

### Windows
Double-cliquez sur `manager.bat`

### Ligne de commande
```bash
node manager.js
```

## 📖 Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `start` | Démarre le bot |
| `stop` | Arrête le bot |
| `restart` | Redémarre le bot |
| `status` | Affiche le statut du bot et les infos système |
| `logs` | Active/désactive les logs en temps réel |
| `clear` | Efface la console |
| `help` | Affiche l'aide |
| `exit` | Quitte le manager |

## 💡 Exemples d'Utilisation

### Démarrer le bot
```
K.Ring > start
🚀 Démarrage du bot...
✅ Bot démarré avec succès
   PID: 12345
```

### Vérifier le statut
```
K.Ring > status
═══════════════════════════════════════════════════
                   STATUT DU BOT
═══════════════════════════════════════════════════

  État       : ✅ En ligne
  PID        : 12345
  Logs       : Activés

  Système    :
    Node.js  : v20.10.0
    Plateforme : win32
    Mémoire  : 92MB

═══════════════════════════════════════════════════
```

### Redémarrer le bot
```
K.Ring > restart
🔄 Redémarrage du bot...
🛑 Arrêt du bot...
🚀 Démarrage du bot...
✅ Bot démarré avec succès
```

### Activer les logs
```
K.Ring > logs
✅ Logs activés
⚠️  Redémarrez le bot pour voir les logs
```

## 🎨 Interface

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║              K.RING BOT MANAGER                    ║
║         Gestionnaire de bot Discord                ║
║                                                    ║
╚════════════════════════════════════════════════════╝

Tapez "help" pour voir les commandes disponibles

K.Ring > _
```

## ⚙️ Fonctionnalités

### ✅ Gestion du Bot
- Démarrage/arrêt/redémarrage en une commande
- Vérification du statut en temps réel
- Affichage du PID du processus

### 📊 Monitoring
- Affichage des infos système
- Utilisation mémoire
- Version Node.js
- Plateforme

### 📝 Logs
- Activation/désactivation des logs
- Affichage en temps réel
- Logs colorés pour meilleure lisibilité

### 🛡️ Sécurité
- Arrêt propre du bot (SIGTERM)
- Arrêt forcé si nécessaire (SIGKILL après 5s)
- Gestion des erreurs
- Nettoyage automatique à la fermeture

## 🔧 Configuration

Aucune configuration nécessaire ! Le manager fonctionne directement.

### Options Avancées

Pour modifier le comportement, éditez `manager.js` :

```javascript
// Délai avant arrêt forcé (millisecondes)
setTimeout(() => {
    if (botProcess) {
        botProcess.kill('SIGKILL');
    }
}, 5000); // 5 secondes par défaut
```

## 🎯 Raccourcis Clavier

- `Ctrl+C` : Arrête le bot et quitte le manager
- `↑` / `↓` : Historique des commandes
- `Tab` : Autocomplétion (si disponible)

## 📦 Dépendances

Aucune dépendance externe ! Utilise uniquement :
- `child_process` (Node.js natif)
- `readline` (Node.js natif)
- Couleurs ANSI natives

## 🐛 Dépannage

### Le bot ne démarre pas
1. Vérifiez que `src/index.js` existe
2. Vérifiez que le fichier `.env` est configuré
3. Vérifiez les logs avec la commande `logs`

### Le manager ne répond plus
- Appuyez sur `Ctrl+C` pour forcer la fermeture
- Relancez le manager

### Les couleurs ne s'affichent pas
- Utilisez un terminal moderne (Windows Terminal, PowerShell, etc.)
- Les couleurs ANSI sont supportées par défaut sur Windows 10+

## 📝 Notes

- Le manager garde le bot en arrière-plan
- Les logs sont désactivés par défaut pour les performances
- Le bot continue de fonctionner même si vous fermez le manager (sauf si vous l'arrêtez avant)

## 🚀 Astuces

### Démarrage Automatique
Ajoutez `manager.bat` au démarrage de Windows pour lancer automatiquement le manager.

### Logs Permanents
Activez les logs avec `logs` puis redémarrez le bot pour voir tous les événements en temps réel.

### Monitoring Continu
Utilisez `status` régulièrement pour surveiller l'utilisation mémoire et détecter les fuites.

## 📄 Licence

Même licence que K.Ring Bot (MIT)

---

**Version** : 1.0
**Date** : 31 Octobre 2025
**Auteur** : K.Ring Team
