# Documentation K.Ring Bot

Bienvenue dans la documentation technique de K.Ring Bot.

## 📚 Table des matières

### Pour démarrer
- [Guide de démarrage rapide](../QUICKSTART.md) - Démarrez en 5 minutes
- [README principal](../README.md) - Vue d'ensemble du projet

### Architecture et développement
- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - Architecture complète du projet
  - Structure des dossiers
  - Principes architecturaux
  - Patterns utilisés
  - Flux de données
  - Extensibilité
  - Performance et sécurité

### Déploiement
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Guide de déploiement complet
  - VPS / Serveur dédié avec PM2
  - Railway, Render, Heroku
  - Docker et docker-compose
  - Monitoring et logs
  - Mise à jour en production
  - Dépannage

### Contribution
- [Guide de contribution](../CONTRIBUTING.md) - Comment contribuer au projet
  - Standards de code
  - Processus de review
  - Templates
  - Checklist

### Historique
- [Changelog](../CHANGELOG.md) - Historique des versions
- [Optimisations](../OPTIMIZATIONS.md) - Rapport d'optimisations v2.0.0
- [Restructuration](../RESTRUCTURATION_COMPLETE.md) - Synthèse complète

## 🎯 Navigation rapide

### Je veux...

**Comprendre l'architecture**
→ Lisez [ARCHITECTURE.md](./ARCHITECTURE.md)

**Déployer en production**
→ Suivez [DEPLOYMENT.md](./DEPLOYMENT.md)

**Contribuer au projet**
→ Consultez [CONTRIBUTING.md](../CONTRIBUTING.md)

**Ajouter une commande**
→ Section "Extensibilité" dans [ARCHITECTURE.md](./ARCHITECTURE.md#extensibilité)

**Résoudre un problème**
→ Section "Dépannage" dans [DEPLOYMENT.md](./DEPLOYMENT.md#dépannage)

**Voir les changements**
→ Consultez [CHANGELOG.md](../CHANGELOG.md)

## 🔧 Ressources techniques

### Configuration
- Configuration centralisée : `src/config/index.js`
- Messages et constantes : `src/constants/messages.js`
- Helpers utilitaires : `src/utils/helpers.js`

### Sécurité
- Rate limiting : `src/security/rateLimiter.js`
- Anti-raid : `src/security/antiRaid.js`
- Validation : `src/security/inputValidator.js`

### Système
- Logging : `src/utils/logger.js`
- Config manager : `src/utils/configManager.js`
- Daily posts : `src/utils/dailyPost.js`

## 📖 Documentation externe

- [Discord.js Guide](https://discordjs.guide/)
- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [Node.js Documentation](https://nodejs.org/docs/)

## 💡 Conseils

- Commencez par le [QUICKSTART.md](../QUICKSTART.md) si c'est votre première fois
- Lisez [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre la structure
- Consultez [CONTRIBUTING.md](../CONTRIBUTING.md) avant de contribuer
- Utilisez [DEPLOYMENT.md](./DEPLOYMENT.md) pour le déploiement

## 🆘 Support

- Ouvrez une [issue GitHub](https://github.com/yourusername/k-ring-bot/issues)
- Consultez les logs dans `logs/error.log`
- Vérifiez le [CHANGELOG.md](../CHANGELOG.md) pour les changements récents

---

*Documentation maintenue par l'équipe K.Ring*
