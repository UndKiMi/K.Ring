# Configuration de l'API d'actualités pour /info

## 📰 Vue d'ensemble

La commande `/info` a été entièrement refonte pour rechercher automatiquement des actualités réelles sur le sujet demandé.

### Fonctionnalités

✅ Recherche d'actualités en temps réel  
✅ Sources fiables uniquement (Le Monde, AFP, Reuters, BBC, etc.)  
✅ Validation anti-fake news  
✅ Embed Discord professionnel avec image  
✅ Date, source, auteur affichés  
✅ Mode fallback si API non configurée  
✅ Gestion robuste des erreurs  

---

## 🔑 Configuration de NewsAPI (Recommandé)

### 1. Créer un compte NewsAPI

1. Allez sur https://newsapi.org/
2. Cliquez sur **"Get API Key"**
3. Créez un compte gratuit
4. Copiez votre **API Key**

### 2. Ajouter la clé dans `.env`

Éditez votre fichier `.env` et ajoutez :

```env
DISCORD_TOKEN=votre_token
CLIENT_ID=votre_client_id
GUILD_ID=votre_guild_id

# API d'actualités
NEWS_API_KEY=votre_cle_newsapi_ici
```

### 3. Limites du plan gratuit

- **100 requêtes par jour**
- Actualités jusqu'à 1 mois en arrière
- Toutes les sources mondiales
- Parfait pour un bot Discord !

---

## 🔄 APIs alternatives

### Option 1 : Google News RSS (Gratuit, sans clé)

**Avantages** :
- ✅ Gratuit, illimité
- ✅ Pas d'inscription requise
- ✅ Actualités en temps réel

**Inconvénients** :
- ❌ Moins de métadonnées (pas d'auteur, image limitée)
- ❌ Format RSS à parser

**Implémentation** : Déjà intégrée en mode fallback dans `newsApi.js`

### Option 2 : The Guardian API

**URL** : https://open-platform.theguardian.com/

**Avantages** :
- ✅ Gratuit
- ✅ Excellente qualité éditoriale
- ✅ 5000 requêtes/jour

**Inconvénients** :
- ❌ Principalement en anglais
- ❌ Focus sur UK/International

**Configuration** :
```javascript
// Dans src/utils/newsApi.js
this.guardianApiKey = process.env.GUARDIAN_API_KEY;
this.guardianUrl = 'https://content.guardianapis.com/search';
```

### Option 3 : Bing News Search API

**URL** : https://azure.microsoft.com/services/cognitive-services/bing-news-search-api/

**Avantages** :
- ✅ Très complet
- ✅ Multi-langues
- ✅ Filtres avancés

**Inconvénients** :
- ❌ Payant après 1000 requêtes/mois
- ❌ Nécessite un compte Azure

### Option 4 : Currents API

**URL** : https://currentsapi.services/

**Avantages** :
- ✅ 600 requêtes/jour gratuit
- ✅ Multi-langues
- ✅ Actualités mondiales

**Inconvénients** :
- ❌ Moins de sources que NewsAPI

---

## 🛠️ Intégration d'une nouvelle API

### Étape 1 : Ajouter la configuration

Dans `src/config/index.js` :

```javascript
export const config = {
    // ... autres configs
    
    news: {
        provider: 'newsapi', // ou 'guardian', 'bing', etc.
        apiKey: process.env.NEWS_API_KEY,
        language: 'fr',
        maxResults: 10,
    },
};
```

### Étape 2 : Créer un service

Créez `src/utils/newsProviders/votreApi.js` :

```javascript
/**
 * Service pour [Nom de l'API]
 */

import fetch from 'node-fetch';
import logger from '../logger.js';

export class VotreApiService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.exemple.com';
    }

    async search(query, language = 'fr') {
        try {
            const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}&lang=${language}&apikey=${this.apiKey}`;
            
            const response = await fetch(url, {
                timeout: 10000,
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Adapter le format de réponse
            return this.formatArticle(data.articles[0]);
            
        } catch (error) {
            logger.error('Erreur API', error);
            return null;
        }
    }

    formatArticle(rawArticle) {
        return {
            title: rawArticle.title,
            description: rawArticle.description,
            source: rawArticle.source.name,
            author: rawArticle.author || 'Non spécifié',
            publishedAt: new Date(rawArticle.publishedAt),
            url: rawArticle.url,
            imageUrl: rawArticle.image || null,
            isTrusted: true,
        };
    }
}
```

### Étape 3 : Intégrer dans newsApi.js

Dans `src/utils/newsApi.js` :

```javascript
import { VotreApiService } from './newsProviders/votreApi.js';

class NewsService {
    constructor() {
        // Sélectionner le provider selon la config
        const provider = process.env.NEWS_PROVIDER || 'newsapi';
        
        if (provider === 'votreapi') {
            this.service = new VotreApiService(process.env.VOTRE_API_KEY);
        } else {
            // NewsAPI par défaut
            this.apiKey = process.env.NEWS_API_KEY;
        }
    }

    async searchNews(query, language = 'fr') {
        if (this.service) {
            return await this.service.search(query, language);
        }
        
        // Sinon, utiliser NewsAPI (code existant)
        // ...
    }
}
```

---

## 📊 Comparaison des APIs

| API | Gratuit | Requêtes/jour | Multi-langue | Qualité | Difficulté |
|-----|---------|---------------|--------------|---------|------------|
| **NewsAPI** | ✅ | 100 | ✅ | ⭐⭐⭐⭐⭐ | Facile |
| **Google News RSS** | ✅ | Illimité | ✅ | ⭐⭐⭐ | Facile |
| **The Guardian** | ✅ | 5000 | ❌ (EN) | ⭐⭐⭐⭐⭐ | Facile |
| **Bing News** | ⚠️ | 1000 | ✅ | ⭐⭐⭐⭐ | Moyenne |
| **Currents API** | ✅ | 600 | ✅ | ⭐⭐⭐⭐ | Facile |

---

## 🧪 Test de la commande

### Sans API configurée (mode fallback)

```
/info sujet:intelligence artificielle
```

Utilise Google News RSS automatiquement.

### Avec NewsAPI configurée

```
/info sujet:climat
/info sujet:économie française
/info sujet:technologie
```

Recherche dans NewsAPI avec sources vérifiées.

---

## 🔒 Sécurité et confidentialité

### Bonnes pratiques implémentées

✅ **Pas de log du texte utilisateur** - Seul le sujet est loggé  
✅ **Timeout de 10 secondes** - Évite les blocages  
✅ **Validation des sources** - Liste blanche de médias fiables  
✅ **Gestion d'erreurs robuste** - Pas de crash si API down  
✅ **Rate limiting** - Protection contre les abus  
✅ **Clé API dans .env** - Jamais dans le code  

### Protection anti-fake news

- ✅ Sources vérifiées uniquement (Le Monde, AFP, Reuters, BBC, etc.)
- ✅ Indicateur visuel "Source vérifiée ✅"
- ✅ Date de publication affichée
- ✅ Lien vers l'article original
- ✅ Pas d'invention de données

---

## 📝 Exemple d'utilisation

### Commande

```
/info sujet:ChatGPT
```

### Résultat dans #infos

```
📢 Nouvelle actualité sur ChatGPT

┌─────────────────────────────────────────┐
│ 📰 OpenAI lance GPT-4 Turbo avec        │
│    de nouvelles fonctionnalités         │
├─────────────────────────────────────────┤
│ OpenAI a annoncé GPT-4 Turbo, une       │
│ version améliorée de son modèle...      │
├─────────────────────────────────────────┤
│ 📌 Source: Le Monde ✅ (Source vérifiée)│
│ 📅 Date: 6 novembre 2023, 14:30         │
│ ✍️ Auteur: Marie Dupont                 │
│ 🔍 Recherche demandée par: User#1234    │
└─────────────────────────────────────────┘

K.Ring News • Actualité vérifiée
```

---

## 🆘 Dépannage

### Erreur : "Aucune actualité trouvée"

**Causes possibles** :
- Sujet trop spécifique
- Faute d'orthographe
- Pas d'actualité récente sur ce sujet

**Solutions** :
- Essayez un sujet plus général
- Vérifiez l'orthographe
- Utilisez des mots-clés en français ou anglais

### Erreur : "Rate limit atteint"

**Cause** : Limite de 100 requêtes/jour dépassée (NewsAPI gratuit)

**Solutions** :
- Attendez demain (reset à minuit UTC)
- Passez au plan payant NewsAPI
- Utilisez une autre API
- Le mode fallback (Google News RSS) s'active automatiquement

### Erreur : "API Error"

**Causes possibles** :
- Clé API invalide
- API temporairement indisponible
- Problème réseau

**Solutions** :
- Vérifiez votre clé API dans `.env`
- Testez l'API sur https://newsapi.org/
- Le mode fallback s'active automatiquement

---

## 📚 Ressources

- [NewsAPI Documentation](https://newsapi.org/docs)
- [The Guardian API](https://open-platform.theguardian.com/documentation/)
- [Google News RSS](https://news.google.com/rss)
- [Discord.js Embeds](https://discordjs.guide/popular-topics/embeds.html)

---

**Créé pour K.Ring Bot v2.0** 🤖  
*En hommage à Alan Turing*
