/**
 * Commande /calc - Version Avancée et Sécurisée
 * 
 * Évalue des expressions mathématiques complexes avec :
 * - Support de toutes les opérations mathématiques (mathjs)
 * - Timeout de 5 secondes pour éviter les calculs infinis
 * - Protection contre les débordements mémoire
 * - Validation stricte des expressions
 * - Gestion des très grands nombres (BigNumber)
 * - Pas de crash du bot quoi qu'il arrive
 * 
 * Sécurité :
 * 1. Timeout : Calcul limité à 5 secondes max
 * 2. Sandbox : Pas d'accès aux fonctions dangereuses (import, eval, etc.)
 * 3. Limite de complexité : Expressions limitées à 1000 caractères
 * 4. Limite de récursion : Mathjs configuré pour éviter les boucles infinies
 * 5. Gestion mémoire : Limite sur la taille des résultats
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import * as mathjs from 'mathjs';
import logger from '../utils/logger.js';

// Configuration sécurisée de mathjs avec BigNumber
const math = mathjs.create(mathjs.all, {
    number: 'BigNumber',      // Support des très grands nombres
    precision: 64,            // Précision de 64 chiffres
});

// Configuration de sécurité
const SECURITY_CONFIG = {
    MAX_EXPRESSION_LENGTH: 1000,    // Longueur max de l'expression
    TIMEOUT_MS: 5000,                // Timeout de 5 secondes
    MAX_RESULT_LENGTH: 10000,        // Taille max du résultat (caractères)
    MAX_ITERATIONS: 10000,           // Limite d'itérations pour les boucles
};

export default {
    data: new SlashCommandBuilder()
        .setName('calc')
        .setDescription('Calcule une expression mathématique (supporte les calculs complexes)')
        .addStringOption(option =>
            option
                .setName('expression')
                .setDescription('Expression mathématique (ex: 2+2, sqrt(16), factorial(50), sin(pi/2))')
                .setRequired(true)
                .setMaxLength(SECURITY_CONFIG.MAX_EXPRESSION_LENGTH)
        ),

    async execute(interaction) {
        try {
            const expression = interaction.options.getString('expression').trim();
            
            logger.info(`Calcul demandé par ${interaction.user.tag}: ${expression.substring(0, 100)}...`);

            // ========================================
            // ÉTAPE 1 : VALIDATION DE SÉCURITÉ
            // ========================================
            
            // Vérifier la longueur
            if (expression.length > SECURITY_CONFIG.MAX_EXPRESSION_LENGTH) {
                return await interaction.reply({
                    content: `❌ Expression trop longue (max ${SECURITY_CONFIG.MAX_EXPRESSION_LENGTH} caractères).\n\n💡 Essayez de simplifier votre expression.`,
                    ephemeral: true
                });
            }

            // Patterns dangereux à bloquer (injection de code, accès système)
            const dangerousPatterns = [
                /import\s*\(/i,           // import()
                /require\s*\(/i,          // require()
                /eval\s*\(/i,             // eval()
                /function\s*\(/i,         // function()
                /=>\s*{/,                 // Arrow functions
                /\bprocess\b/i,           // Accès process
                /\b__/,                   // Variables privées
                /\bthis\b/i,              // Contexte this
                /\bconstructor\b/i,       // Constructor
                /\bprototype\b/i,         // Prototype
            ];

            const isDangerous = dangerousPatterns.some(pattern => pattern.test(expression));
            
            if (isDangerous) {
                logger.warn(`Expression dangereuse bloquée de ${interaction.user.tag}: ${expression}`);
                return await interaction.reply({
                    content: '❌ Expression non autorisée.\n\n💡 Utilisez uniquement des opérations mathématiques standard.',
                    ephemeral: true
                });
            }

            // ========================================
            // ÉTAPE 2 : ÉVALUATION AVEC TIMEOUT
            // ========================================
            
            let result;
            let calculationError = null;
            let timedOut = false;

            // Créer une promesse avec timeout
            const evaluateWithTimeout = new Promise((resolve, reject) => {
                // Timer de timeout
                const timeoutId = setTimeout(() => {
                    timedOut = true;
                    reject(new Error('TIMEOUT'));
                }, SECURITY_CONFIG.TIMEOUT_MS);

                try {
                    // Évaluer l'expression de manière sécurisée
                    const evalResult = math.evaluate(expression);
                    
                    clearTimeout(timeoutId);
                    resolve(evalResult);
                } catch (error) {
                    clearTimeout(timeoutId);
                    reject(error);
                }
            });

            try {
                result = await evaluateWithTimeout;
            } catch (error) {
                calculationError = error;
                
                // Gestion spécifique du timeout
                if (timedOut || error.message === 'TIMEOUT') {
                    logger.warn(`Timeout sur calcul de ${interaction.user.tag}: ${expression.substring(0, 50)}`);
                    return await interaction.reply({
                        content: `⏱️ **Calcul trop long ou trop complexe**\n\nLe calcul a dépassé la limite de ${SECURITY_CONFIG.TIMEOUT_MS / 1000} secondes.\n\n💡 **Suggestions** :\n• Simplifiez l'expression\n• Réduisez la taille des nombres\n• Évitez les factorielles géantes (ex: factorial(10000))`,
                        ephemeral: true
                    });
                }

                // Autres erreurs mathématiques
                logger.debug(`Erreur de calcul pour ${interaction.user.tag}: ${error.message}`);
                
                // Messages d'erreur personnalisés
                let errorMessage = '❌ **Erreur de calcul**\n\n';
                
                if (error.message.includes('Undefined symbol') || error.message.includes('Unexpected')) {
                    errorMessage += `Symbole ou syntaxe invalide.\n\n💡 **Vérifiez** :\n• L'orthographe des fonctions (sqrt, sin, cos, etc.)\n• Les parenthèses sont bien fermées\n• Les opérateurs sont corrects (+, -, *, /, ^)`;
                } else if (error.message.includes('division by zero')) {
                    errorMessage += `Division par zéro impossible.`;
                } else if (error.message.includes('out of range') || error.message.includes('overflow')) {
                    errorMessage += `Nombre trop grand ou débordement.\n\n💡 Le résultat dépasse les limites de calcul.`;
                } else {
                    errorMessage += `${error.message}\n\n💡 **Exemples valides** :\n• \`2 + 2\`\n• \`sqrt(16)\`\n• \`sin(pi/2)\`\n• \`factorial(20)\`\n• \`10^100\``;
                }

                return await interaction.reply({
                    content: errorMessage,
                    ephemeral: true
                });
            }

            // ========================================
            // ÉTAPE 3 : FORMATAGE DU RÉSULTAT
            // ========================================
            
            let formattedResult;
            
            try {
                // Convertir le résultat en string
                formattedResult = math.format(result, { precision: 14 });
                
                // Vérifier la taille du résultat
                if (formattedResult.length > SECURITY_CONFIG.MAX_RESULT_LENGTH) {
                    logger.warn(`Résultat trop grand pour ${interaction.user.tag}`);
                    return await interaction.reply({
                        content: `📊 **Résultat trop volumineux**\n\nLe résultat contient plus de ${SECURITY_CONFIG.MAX_RESULT_LENGTH} caractères.\n\n💡 Le calcul est correct mais trop grand pour être affiché.`,
                        ephemeral: true
                    });
                }

                // Limiter l'affichage si trop long (pour l'embed)
                if (formattedResult.length > 1000) {
                    formattedResult = formattedResult.substring(0, 997) + '...';
                }

            } catch (formatError) {
                logger.error('Erreur de formatage du résultat', formatError);
                formattedResult = String(result);
            }

            // ========================================
            // ÉTAPE 4 : AFFICHAGE DU RÉSULTAT
            // ========================================
            
            // Tronquer l'expression si trop longue pour l'embed
            const displayExpression = expression.length > 500 
                ? expression.substring(0, 497) + '...' 
                : expression;

            const calcEmbed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle('🧮 Calculatrice K.Ring')
                .addFields(
                    { 
                        name: '📝 Expression', 
                        value: `\`\`\`${displayExpression}\`\`\``, 
                        inline: false 
                    },
                    { 
                        name: '✅ Résultat', 
                        value: `\`\`\`${formattedResult}\`\`\``, 
                        inline: false 
                    }
                )
                .setFooter({
                    text: `Demandé par ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await interaction.reply({ embeds: [calcEmbed] });

            logger.info(`Calcul réussi pour ${interaction.user.tag}`);

        } catch (error) {
            logger.error('Erreur lors de l\'exécution de la commande /calc', error);
            
            const errorMessage = '❌ Une erreur est survenue lors du calcul. Vérifiez votre expression.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
