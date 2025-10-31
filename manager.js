/**
 * K.Ring Bot Manager
 * Interface console pour gérer le bot Discord
 * 
 * Commandes :
 * - start   : Démarre le bot
 * - stop    : Arrête le bot
 * - restart : Redémarre le bot
 * - status  : Affiche le statut du bot
 * - logs    : Affiche les logs en temps réel
 * - clear   : Efface la console
 * - help    : Affiche l'aide
 * - exit    : Quitte le manager
 */

import { spawn } from 'child_process';
import readline from 'readline';

// Couleurs ANSI (pas besoin de chalk)
const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
};

const chalk = {
    cyan: (text) => `${colors.cyan}${text}${colors.reset}`,
    yellow: (text) => `${colors.yellow}${text}${colors.reset}`,
    green: (text) => `${colors.green}${text}${colors.reset}`,
    red: (text) => `${colors.red}${text}${colors.reset}`,
    blue: (text) => `${colors.blue}${text}${colors.reset}`,
    magenta: (text) => `${colors.magenta}${text}${colors.reset}`,
    white: (text) => `${colors.white}${text}${colors.reset}`,
    gray: (text) => `${colors.gray}${text}${colors.reset}`
};

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════
let botProcess = null;
let logsEnabled = false;

// Interface readline pour les commandes
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('K.Ring > ')
});

// ═══════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Affiche le logo ASCII
 */
function displayLogo() {
    console.clear();
    console.log(chalk.cyan('╔════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║                                                    ║'));
    console.log(chalk.cyan('║') + chalk.yellow('              K.RING BOT MANAGER                ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + chalk.gray('         Gestionnaire de bot Discord           ') + chalk.cyan('║'));
    console.log(chalk.cyan('║                                                    ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════╝'));
    console.log('');
    console.log(chalk.gray('Tapez "help" pour voir les commandes disponibles'));
    console.log('');
}

/**
 * Affiche l'aide
 */
function displayHelp() {
    console.log('');
    console.log(chalk.yellow('═══════════════════════════════════════════════════'));
    console.log(chalk.yellow('                  COMMANDES DISPONIBLES'));
    console.log(chalk.yellow('═══════════════════════════════════════════════════'));
    console.log('');
    console.log(chalk.green('  start') + '    - Démarre le bot');
    console.log(chalk.red('  stop') + '     - Arrête le bot');
    console.log(chalk.blue('  restart') + '  - Redémarre le bot');
    console.log(chalk.magenta('  status') + '   - Affiche le statut du bot');
    console.log(chalk.cyan('  logs') + '     - Active/désactive les logs en temps réel');
    console.log(chalk.white('  clear') + '    - Efface la console');
    console.log(chalk.yellow('  help') + '     - Affiche cette aide');
    console.log(chalk.gray('  exit') + '     - Quitte le manager');
    console.log('');
    console.log(chalk.yellow('═══════════════════════════════════════════════════'));
    console.log('');
}

/**
 * Démarre le bot
 */
function startBot() {
    if (botProcess) {
        console.log(chalk.yellow('⚠️  Le bot est déjà en cours d\'exécution'));
        return;
    }

    console.log(chalk.blue('🚀 Démarrage du bot...'));
    
    botProcess = spawn('node', ['src/index.js'], {
        cwd: process.cwd(),
        stdio: logsEnabled ? 'pipe' : 'ignore',
        shell: true
    });

    if (logsEnabled) {
        botProcess.stdout.on('data', (data) => {
            process.stdout.write(chalk.gray(data.toString()));
        });

        botProcess.stderr.on('data', (data) => {
            process.stderr.write(chalk.red(data.toString()));
        });
    }

    botProcess.on('close', (code) => {
        if (code !== 0 && code !== null) {
            console.log(chalk.red(`❌ Le bot s'est arrêté avec le code ${code}`));
        } else {
            console.log(chalk.gray('🛑 Bot arrêté'));
        }
        botProcess = null;
    });

    botProcess.on('error', (error) => {
        console.log(chalk.red('❌ Erreur lors du démarrage:', error.message));
        botProcess = null;
    });

    // Attendre un peu pour vérifier que le bot démarre bien
    setTimeout(() => {
        if (botProcess) {
            console.log(chalk.green('✅ Bot démarré avec succès'));
            console.log(chalk.gray(`   PID: ${botProcess.pid}`));
        }
    }, 2000);
}

/**
 * Arrête le bot
 */
function stopBot() {
    if (!botProcess) {
        console.log(chalk.yellow('⚠️  Le bot n\'est pas en cours d\'exécution'));
        return;
    }

    console.log(chalk.blue('🛑 Arrêt du bot...'));
    
    // Sur Windows, utiliser directement SIGKILL pour un arrêt immédiat
    if (process.platform === 'win32') {
        botProcess.kill('SIGKILL');
        console.log(chalk.green('✅ Bot arrêté'));
        botProcess = null;
    } else {
        // Sur Linux/Mac, essayer SIGTERM d'abord
        botProcess.kill('SIGTERM');
        
        setTimeout(() => {
            if (botProcess) {
                console.log(chalk.yellow('⚠️  Arrêt forcé du bot...'));
                botProcess.kill('SIGKILL');
            }
        }, 2000); // Réduit à 2 secondes
    }
}

/**
 * Redémarre le bot
 */
function restartBot() {
    console.log(chalk.blue('🔄 Redémarrage du bot...'));
    
    if (botProcess) {
        stopBot();
        setTimeout(() => {
            startBot();
        }, 2000);
    } else {
        startBot();
    }
}

/**
 * Affiche le statut du bot
 */
function displayStatus() {
    console.log('');
    console.log(chalk.cyan('═══════════════════════════════════════════════════'));
    console.log(chalk.cyan('                   STATUT DU BOT'));
    console.log(chalk.cyan('═══════════════════════════════════════════════════'));
    console.log('');
    
    if (botProcess) {
        console.log(chalk.green('  État       : ') + chalk.green('✅ En ligne'));
        console.log(chalk.green('  PID        : ') + chalk.white(botProcess.pid));
        console.log(chalk.green('  Logs       : ') + (logsEnabled ? chalk.green('Activés') : chalk.gray('Désactivés')));
    } else {
        console.log(chalk.red('  État       : ') + chalk.red('🔴 Hors ligne'));
        console.log(chalk.gray('  PID        : N/A'));
        console.log(chalk.gray('  Logs       : ') + (logsEnabled ? chalk.green('Activés') : chalk.gray('Désactivés')));
    }
    
    // Infos système
    console.log('');
    console.log(chalk.cyan('  Système    :'));
    console.log(chalk.gray('    Node.js  : ') + process.version);
    console.log(chalk.gray('    Plateforme : ') + process.platform);
    console.log(chalk.gray('    Mémoire  : ') + Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB');
    
    console.log('');
    console.log(chalk.cyan('═══════════════════════════════════════════════════'));
    console.log('');
}

/**
 * Active/désactive les logs
 */
function toggleLogs() {
    logsEnabled = !logsEnabled;
    
    if (logsEnabled) {
        console.log(chalk.green('✅ Logs activés'));
        if (botProcess) {
            console.log(chalk.yellow('⚠️  Redémarrez le bot pour voir les logs'));
        }
    } else {
        console.log(chalk.gray('🔇 Logs désactivés'));
    }
}

/**
 * Traite les commandes
 */
function processCommand(input) {
    const command = input.trim().toLowerCase();

    switch (command) {
        case 'start':
            startBot();
            break;

        case 'stop':
            stopBot();
            break;

        case 'restart':
        case 'reload':
            restartBot();
            break;

        case 'status':
            displayStatus();
            break;

        case 'logs':
            toggleLogs();
            break;

        case 'clear':
        case 'cls':
            displayLogo();
            break;

        case 'help':
        case '?':
            displayHelp();
            break;

        case 'exit':
        case 'quit':
            console.log(chalk.yellow('👋 Fermeture du manager...'));
            if (botProcess) {
                console.log(chalk.yellow('⚠️  Arrêt du bot...'));
                stopBot();
            }
            setTimeout(() => {
                console.log(chalk.green('✅ Au revoir !'));
                process.exit(0);
            }, 1000);
            return;

        case '':
            break;

        default:
            console.log(chalk.red(`❌ Commande inconnue: "${command}"`));
            console.log(chalk.gray('   Tapez "help" pour voir les commandes disponibles'));
    }

    rl.prompt();
}

// ═══════════════════════════════════════════════════════════════
// GESTION DES ÉVÉNEMENTS
// ═══════════════════════════════════════════════════════════════

// Gestion de Ctrl+C
process.on('SIGINT', () => {
    console.log('');
    console.log(chalk.yellow('⚠️  Interruption détectée...'));
    if (botProcess) {
        console.log(chalk.yellow('⚠️  Arrêt du bot...'));
        stopBot();
    }
    setTimeout(() => {
        console.log(chalk.green('✅ Manager fermé'));
        process.exit(0);
    }, 1000);
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
    console.log(chalk.red('❌ Erreur non gérée:', error.message));
    rl.prompt();
});

// ═══════════════════════════════════════════════════════════════
// DÉMARRAGE DU MANAGER
// ═══════════════════════════════════════════════════════════════

displayLogo();

rl.on('line', (input) => {
    processCommand(input);
});

rl.on('close', () => {
    console.log('');
    console.log(chalk.yellow('👋 Fermeture du manager...'));
    if (botProcess) {
        stopBot();
    }
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

// Afficher le prompt initial
rl.prompt();
