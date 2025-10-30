/**
 * Service de recherche d'actualités
 * Utilise NewsAPI pour récupérer des actualités fiables et à jour
 * 
 * API alternatives possibles :
 * - NewsAPI (https://newsapi.org) - 100 requêtes/jour gratuit
 * - Google News RSS (gratuit, pas d'API key)
 * - Bing News API (Microsoft Azure)
 * - The Guardian API (gratuit)
 */

import fetch from 'node-fetch';
import logger from './logger.js';

class NewsService {
    constructor() {
        // Clé API NewsAPI (à configurer dans .env)
        this.apiKey = process.env.NEWS_API_KEY || null;
        this.baseUrl = 'https://newsapi.org/v2';
        
        // Sources fiables prioritaires (médias reconnus)
        this.trustedSources = [
            'le-monde',
            'le-figaro',
            'liberation',
            'france-24',
            'bbc-news',
            'reuters',
            'associated-press',
            'afp',
        ];
    }

    /**
     * Recherche des actualités sur un sujet donné
     * @param {string} query - Sujet de recherche
     * @param {string} language - Langue des résultats (fr, en, etc.)
     * @returns {Promise<Object|null>} Article trouvé ou null
     */
    async searchNews(query, language = 'fr') {
        try {
            // Vérifier que l'API key est configurée
            if (!this.apiKey) {
                logger.warn('NEWS_API_KEY non configurée, utilisation du mode fallback');
                return this.fallbackSearch(query);
            }

            // Construire l'URL de recherche
            const params = new URLSearchParams({
                q: query,
                language: language,
                sortBy: 'publishedAt', // Trier par date (plus récent d'abord)
                pageSize: 10, // Récupérer 10 articles max
                apiKey: this.apiKey,
            });

            const url = `${this.baseUrl}/everything?${params}`;

            logger.debug(`Recherche d'actualités pour: "${query}"`);

            // Effectuer la requête HTTP
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'K.Ring-Discord-Bot/2.0',
                },
                timeout: 10000, // Timeout de 10 secondes
            });

            // Vérifier le statut de la réponse
            if (!response.ok) {
                if (response.status === 429) {
                    logger.warn('Rate limit NewsAPI atteint');
                    return null;
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            // Vérifier qu'il y a des résultats
            if (!data.articles || data.articles.length === 0) {
                logger.info(`Aucune actualité trouvée pour: "${query}"`);
                return null;
            }

            // Filtrer et sélectionner le meilleur article
            const bestArticle = this.selectBestArticle(data.articles);

            if (!bestArticle) {
                return null;
            }

            // Formater l'article pour Discord
            return this.formatArticle(bestArticle, query);

        } catch (error) {
            logger.error('Erreur lors de la recherche d\'actualités', error);
            return null;
        }
    }

    /**
     * Sélectionne le meilleur article parmi les résultats
     * Priorité : sources fiables > date récente > contenu complet
     * @param {Array} articles - Liste d'articles
     * @returns {Object|null} Meilleur article ou null
     */
    selectBestArticle(articles) {
        // Filtrer les articles valides (avec titre, description, source)
        const validArticles = articles.filter(article => 
            article.title &&
            article.description &&
            article.source &&
            article.source.name &&
            article.publishedAt &&
            !article.title.includes('[Removed]') // Exclure les articles supprimés
        );

        if (validArticles.length === 0) {
            return null;
        }

        // Trier par priorité :
        // 1. Sources fiables d'abord
        // 2. Date de publication (plus récent)
        const sortedArticles = validArticles.sort((a, b) => {
            const aIsTrusted = this.isTrustedSource(a.source.id);
            const bIsTrusted = this.isTrustedSource(b.source.id);

            // Priorité aux sources fiables
            if (aIsTrusted && !bIsTrusted) return -1;
            if (!aIsTrusted && bIsTrusted) return 1;

            // Sinon, trier par date (plus récent d'abord)
            return new Date(b.publishedAt) - new Date(a.publishedAt);
        });

        return sortedArticles[0];
    }

    /**
     * Vérifie si une source est dans la liste des sources fiables
     * @param {string} sourceId - ID de la source
     * @returns {boolean}
     */
    isTrustedSource(sourceId) {
        return this.trustedSources.includes(sourceId);
    }

    /**
     * Formate un article pour l'affichage Discord
     * @param {Object} article - Article brut de l'API
     * @param {string} query - Requête de recherche
     * @returns {Object} Article formaté
     */
    formatArticle(article, query) {
        return {
            title: article.title,
            description: this.truncateText(article.description, 300),
            source: article.source.name,
            author: article.author || 'Non spécifié',
            publishedAt: new Date(article.publishedAt),
            url: article.url,
            imageUrl: article.urlToImage || null,
            query: query,
            isTrusted: this.isTrustedSource(article.source.id),
        };
    }

    /**
     * Tronque un texte à une longueur maximale
     * @param {string} text - Texte à tronquer
     * @param {number} maxLength - Longueur maximale
     * @returns {string}
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * Mode fallback : recherche via Google News RSS (gratuit, sans API key)
     * Alternative si NewsAPI n'est pas configurée
     * @param {string} query - Sujet de recherche
     * @returns {Promise<Object|null>}
     */
    async fallbackSearch(query) {
        try {
            // Google News RSS (gratuit, pas d'authentification)
            const encodedQuery = encodeURIComponent(query);
            const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=fr&gl=FR&ceid=FR:fr`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                },
                timeout: 10000,
            });

            if (!response.ok) {
                return null;
            }

            const xml = await response.text();

            // Parser simple du XML RSS
            const titleMatch = xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
            const linkMatch = xml.match(/<link>(.*?)<\/link>/);
            const pubDateMatch = xml.match(/<pubDate>(.*?)<\/pubDate>/);
            const sourceMatch = xml.match(/<source url=".*?">(.*?)<\/source>/);

            if (!titleMatch || !linkMatch) {
                return null;
            }

            return {
                title: titleMatch[1],
                description: 'Actualité récente sur ce sujet',
                source: sourceMatch ? sourceMatch[1] : 'Google News',
                author: 'Non spécifié',
                publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
                url: linkMatch[1],
                imageUrl: null,
                query: query,
                isTrusted: false,
            };

        } catch (error) {
            logger.error('Erreur dans le fallback search', error);
            return null;
        }
    }
}

// Instance singleton
const newsService = new NewsService();

export default newsService;
