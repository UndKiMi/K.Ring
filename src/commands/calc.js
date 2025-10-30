/**
 * Commande /calc
 * Évalue des expressions mathématiques complexes
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { evaluate } from 'mathjs';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('calc')
        .setDescription('Calcule une expression mathématique')
        .addStringOption(option =>
            option
                .setName('expression')
                .setDescription('L\'expression mathématique à calculer (ex: 2 + 2, sqrt(16), sin(pi/2))')
                .setRequired(true)
                .setMaxLength(500)
        ),

    async execute(interaction) {
        try {
            const expression = interaction.options.getString('expression');
            
            // Validation basique pour éviter les injections
            const dangerousPatterns = [
                /import/i,
                /require/i,
                /eval/i,
                /function/i,
                /=>/,
                /\{/,
                /\}/
            ];

            const isDangerous = dangerousPatterns.some(pattern => pattern.test(expression));
            
            if (isDangerous) {
                return await interaction.reply({
                    content: '❌ Expression invalide. Veuillez utiliser uniquement des opérations mathématiques.',
                    ephemeral: true
                });
            }

            // Évaluer l'expression avec mathjs
            let result;
            try {
                result = evaluate(expression);
            } catch (mathError) {
                return await interaction.reply({
                    content: `❌ Erreur de calcul: ${mathError.message}\n\n💡 Exemples d'expressions valides:\n• \`2 + 2\`\n• \`sqrt(16)\`\n• \`sin(pi/2)\`\n• \`log(100)\`\n• \`5^3\`\n• \`(10 + 5) * 2\``,
                    ephemeral: true
                });
            }

            // Formater le résultat
            let formattedResult = result;
            
            // Si le résultat est un nombre, le formater
            if (typeof result === 'number') {
                // Arrondir si nécessaire (éviter les longs décimaux)
                if (!Number.isInteger(result)) {
                    formattedResult = result.toFixed(10).replace(/\.?0+$/, '');
                }
            }

            // Créer un embed pour la réponse
            const calcEmbed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle('🧮 Calculatrice K.Ring')
                .addFields(
                    { name: '📝 Expression', value: `\`\`\`${expression}\`\`\``, inline: false },
                    { name: '✅ Résultat', value: `\`\`\`${formattedResult}\`\`\``, inline: false }
                )
                .setFooter({
                    text: `Demandé par ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            await interaction.reply({ embeds: [calcEmbed] });

            logger.info(`Calcul effectué par ${interaction.user.tag}: ${expression} = ${formattedResult}`);

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
