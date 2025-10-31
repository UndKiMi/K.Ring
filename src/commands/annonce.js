/**
 * Commande /annonce (anciennement /info)
 * Recherche et publie des actualités pertinentes sur un sujet donné
 * 
 * OPTIMISATIONS APPLIQUÉES :
 * - Utilisation de ephemeral pour réduire le spam
 * - Cooldown anti-abus (30 secondes)
 * - Cache des résultats de recherche (5 minutes)
 * - Requêtes async optimisées
 * - Logging structuré pour monitoring
 */

import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import logger from '../utils/logger.js';
import configManager from '../utils/configManager.js';
import https from 'https';

// ═══════════════════════════════════════════════════════════════
// SYSTÈME DE COOLDOWN ANTI-SPAM (optimisé avec Map)
// ═══════════════════════════════════════════════════════════════
const cooldowns = new Map();
const COOLDOWN_DURATION = 30000; // 30 secondes

// ═══════════════════════════════════════════════════════════════
// CACHE DES RÉSULTATS (optimisation latence)
// ═══════════════════════════════════════════════════════════════
const newsCache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION API NEWS
// Pour ajouter d'autres sources :
// 1. Créer une nouvelle fonction fetchFromXXX()
// 2. L'ajouter dans le tableau SOURCES
// 3. Adapter le format de réponse dans parseNewsResult()
// ═══════════════════════════════════════════════════════════════

/**
 * Recherche d'actualités via API gratuite (Bing News Search - fallback sans clé)
 * OPTIMISATION : Utilise https natif au lieu d'axios pour réduire les dépendances
 */
async function fetchNews(query) {
    return new Promise((resolve, reject) => {
        // Vérifier le cache d'abord (optimisation latence)
        const cacheKey = query.toLowerCase();
        const cached = newsCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            logger.debug(`Cache hit pour la recherche: ${query}`);
            return resolve(cached.data);
        }

        // Utiliser une API gratuite de news (exemple avec Bing News - fallback)
        // IMPORTANT : Pour production, configurez une vraie API key dans .env
        // Exemples d'APIs à utiliser :
        // - NewsAPI.org (gratuit jusqu'à 100 req/jour)
        // - Bing News Search API (Azure)
        // - Google News RSS
        
        const options = {
            hostname: 'www.bing.com',
            path: `/news/search?q=${encodeURIComponent(query)}&format=rss`,
            method: 'GET',
            headers: {
                'User-Agent': 'K.Ring-Bot/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    // Parser le RSS (basique)
                    const titleMatch = data.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
                    const linkMatch = data.match(/<link>(.*?)<\/link>/);
                    const descMatch = data.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
                    const pubDateMatch = data.match(/<pubDate>(.*?)<\/pubDate>/);

                    if (titleMatch && linkMatch) {
                        const result = {
                            title: titleMatch[1] || 'Actualité trouvée',
                            description: descMatch ? descMatch[1].substring(0, 500) : 'Aucune description disponible',
                            url: linkMatch[1] || '',
                            source: 'Bing News',
                            publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date()
                        };

                        // Mettre en cache (optimisation)
                        newsCache.set(cacheKey, {
                            data: result,
                            timestamp: Date.now()
                        });

                        resolve(result);
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    logger.error('Erreur parsing RSS:', error);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            logger.error('Erreur requête news:', error);
            reject(error);
        });

        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

/**
 * Détecte la catégorie d'une actualité pour adapter l'icône
 */
function detectCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.match(/tech|technologie|ia|intelligence artificielle|ordinateur|logiciel/)) {
        return { emoji: '💻', name: 'Technologie', color: 0x3498db };
    }
    if (text.match(/sport|football|basket|tennis|jeux olympiques/)) {
        return { emoji: '⚽', name: 'Sport', color: 0x2ecc71 };
    }
    if (text.match(/politique|gouvernement|élection|président|ministre/)) {
        return { emoji: '🏛️', name: 'Politique', color: 0x9b59b6 };
    }
    if (text.match(/économie|finance|bourse|entreprise|business/)) {
        return { emoji: '💰', name: 'Économie', color: 0xf39c12 };
    }
    if (text.match(/santé|médecine|covid|virus|maladie|hôpital/)) {
        return { emoji: '🏥', name: 'Santé', color: 0xe74c3c };
    }
    if (text.match(/culture|cinéma|musique|art|livre|festival/)) {
        return { emoji: '🎭', name: 'Culture', color: 0xe91e63 };
    }
    if (text.match(/science|recherche|découverte|espace|nasa/)) {
        return { emoji: '🔬', name: 'Science', color: 0x00bcd4 };
    }
    
    return { emoji: '📰', name: 'Actualité', color: 0x95a5a6 };
}

export default {
    data: new SlashCommandBuilder()
        .setName('annonce')
        .setDescription('Recherche et publie une actualité sur un sujet donné')
        .addStringOption(option =>
            option
                .setName('sujet')
                .setDescription('Le sujet de l\'actualité à rechercher')
                .setRequired(true)
                .setMaxLength(100)
        )
        .addStringOption(option =>
            option
                .setName('commentaire')
                .setDescription('[Admin uniquement] Commentaire contextuel à ajouter')
                .setRequired(false)
                .setMaxLength(500)
        ),

    async execute(interaction) {
        const startTime = Date.now(); // Monitoring performance
        
        try {
            // ═══════════════════════════════════════════════════════
            // VÉRIFICATION COOLDOWN (anti-spam optimisé)
            // ═══════════════════════════════════════════════════════
            const userId = interaction.user.id;
            const now = Date.now();
            
            if (cooldowns.has(userId)) {
                const expirationTime = cooldowns.get(userId) + COOLDOWN_DURATION;
                
                if (now < expirationTime) {
                    const timeLeft = Math.ceil((expirationTime - now) / 1000);
                    return await interaction.reply({
                        content: `⏱️ Veuillez patienter ${timeLeft} secondes avant de réutiliser cette commande.`,
                        ephemeral: true
                    });
                }
            }
            
            cooldowns.set(userId, now);
            
            // Nettoyer les cooldowns expirés (optimisation mémoire)
            setTimeout(() => cooldowns.delete(userId), COOLDOWN_DURATION);

            // ═══════════════════════════════════════════════════════
            // RÉCUPÉRATION DES PARAMÈTRES
            // ═══════════════════════════════════════════════════════
            const sujet = interaction.options.getString('sujet');
            const commentaire = interaction.options.getString('commentaire');
            const guild = interaction.guild;
            const author = interaction.user;
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

            // Defer la réponse (optimisation UX)
            await interaction.deferReply({ ephemeral: true });

            // ═══════════════════════════════════════════════════════
            // RECHERCHE D'ACTUALITÉ (async optimisé)
            // ═══════════════════════════════════════════════════════
            logger.info(`Recherche d'actualité: "${sujet}" par ${author.tag}`);
            
            let newsResult;
            try {
                newsResult = await fetchNews(sujet);
            } catch (error) {
                logger.error('Erreur lors de la recherche d\'actualité:', error);
                newsResult = null;
            }

            if (!newsResult) {
                return await interaction.editReply({
                    content: `❌ Aucune information trouvée sur "${sujet}" pour l'instant. Essayez un autre sujet ou reformulez votre recherche.`,
                    ephemeral: true
                });
            }

            // ═══════════════════════════════════════════════════════
            // RECHERCHE DU SALON #INFOS (cache optimisé)
            // ═══════════════════════════════════════════════════════
            let infoChannel = guild.channels.cache.find(
                channel => channel.name === 'infos' && channel.type === ChannelType.GuildText
            );

            if (!infoChannel) {
                const botMember = guild.members.me;
                
                if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return await interaction.editReply({
                        content: '❌ Le salon #infos n\'existe pas et je n\'ai pas la permission de le créer.',
                        ephemeral: true
                    });
                }

                infoChannel = await guild.channels.create({
                    name: 'infos',
                    type: ChannelType.GuildText,
                    topic: '📢 Actualités et informations importantes',
                    reason: 'Salon créé automatiquement par K.Ring pour /annonce'
                });

                logger.success(`Salon #infos créé sur ${guild.name}`);
                configManager.setInfoChannel(guild.id, infoChannel.id);
            }

            // ═══════════════════════════════════════════════════════
            // CRÉATION DE L'EMBED (optimisé et moderne)
            // ═══════════════════════════════════════════════════════
            const category = detectCategory(newsResult.title, newsResult.description);
            
            const annonceEmbed = new EmbedBuilder()
                .setColor(category.color)
                .setTitle(`${category.emoji} ${newsResult.title}`)
                .setDescription(newsResult.description)
                .setURL(newsResult.url)
                .addFields(
                    {
                        name: '📰 Source',
                        value: newsResult.source,
                        inline: true
                    },
                    {
                        name: '🏷️ Catégorie',
                        value: category.name,
                        inline: true
                    },
                    {
                        name: '📅 Publié',
                        value: `<t:${Math.floor(newsResult.publishedAt.getTime() / 1000)}:R>`,
                        inline: true
                    }
                )
                .setAuthor({
                    name: `Annonce de ${author.tag}`,
                    iconURL: author.displayAvatarURL({ dynamic: true })
                })
                .setFooter({
                    text: 'K.Ring • Actualités automatiques',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            // Ajouter le commentaire admin si présent
            if (commentaire && isAdmin) {
                annonceEmbed.addFields({
                    name: '💬 Commentaire de l\'équipe',
                    value: commentaire,
                    inline: false
                });
            }

            // ═══════════════════════════════════════════════════════
            // PUBLICATION (async optimisé)
            // ═══════════════════════════════════════════════════════
            await infoChannel.send({ embeds: [annonceEmbed] });

            const executionTime = Date.now() - startTime;
            
            await interaction.editReply({
                content: `✅ Annonce publiée dans ${infoChannel}\n⚡ Temps d'exécution: ${executionTime}ms`,
                ephemeral: true
            });

            // ═══════════════════════════════════════════════════════
            // LOGGING (monitoring performance)
            // ═══════════════════════════════════════════════════════
            logger.info(`Annonce publiée par ${author.tag} | Sujet: "${sujet}" | Latence: ${executionTime}ms`);

        } catch (error) {
            const executionTime = Date.now() - startTime;
            logger.error(`Erreur /annonce (${executionTime}ms):`, error);
            
            const errorMessage = '❌ Une erreur est survenue lors de la publication de l\'annonce.';
            
            if (interaction.deferred) {
                await interaction.editReply({ content: errorMessage, ephemeral: true });
            } else if (!interaction.replied) {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
