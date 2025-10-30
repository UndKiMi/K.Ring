/**
 * Script de validation et test du projet K.Ring
 * Vérifie la structure, les dépendances et la conformité du code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = {
    passed: [],
    failed: [],
    warnings: []
};

function pass(test) {
    results.passed.push(`✅ ${test}`);
    console.log(`\x1b[32m✅ ${test}\x1b[0m`);
}

function fail(test, reason) {
    results.failed.push(`❌ ${test}: ${reason}`);
    console.error(`\x1b[31m❌ ${test}: ${reason}\x1b[0m`);
}

function warn(test, reason) {
    results.warnings.push(`⚠️  ${test}: ${reason}`);
    console.warn(`\x1b[33m⚠️  ${test}: ${reason}\x1b[0m`);
}

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     VALIDATION DU PROJET K.RING BOT                   ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Test 1: Vérifier la structure des dossiers
console.log('📁 Test 1: Structure des dossiers\n');
const requiredDirs = [
    'src',
    'src/commands',
    'src/events',
    'src/utils',
    'config',
    'logs'
];

requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        pass(`Dossier ${dir} existe`);
    } else {
        fail(`Dossier ${dir} manquant`, 'Créer le dossier');
    }
});

// Test 2: Vérifier les fichiers essentiels
console.log('\n📄 Test 2: Fichiers essentiels\n');
const requiredFiles = [
    'package.json',
    '.env.example',
    '.gitignore',
    'src/index.js',
    'src/deploy-commands.js',
    'config/daily-content.json'
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        pass(`Fichier ${file} existe`);
    } else {
        fail(`Fichier ${file} manquant`, 'Fichier requis');
    }
});

// Test 3: Vérifier les commandes requises
console.log('\n💬 Test 3: Commandes slash requises\n');
const requiredCommands = ['info.js', 'calc.js', 'setwelcome.js', 'status.js'];
const commandsPath = path.join(__dirname, 'src', 'commands');

if (fs.existsSync(commandsPath)) {
    requiredCommands.forEach(cmd => {
        const cmdPath = path.join(commandsPath, cmd);
        if (fs.existsSync(cmdPath)) {
            pass(`Commande ${cmd} existe`);
            
            // Vérifier la structure
            try {
                const content = fs.readFileSync(cmdPath, 'utf8');
                if (content.includes('export default') && 
                    content.includes('data:') && 
                    content.includes('execute')) {
                    pass(`Commande ${cmd} a la structure correcte`);
                } else {
                    fail(`Commande ${cmd} structure invalide`, 'Manque data ou execute');
                }
            } catch (error) {
                fail(`Commande ${cmd} lecture impossible`, error.message);
            }
        } else {
            fail(`Commande ${cmd} manquante`, 'Commande requise');
        }
    });
}

// Test 4: Vérifier les événements requis
console.log('\n🎭 Test 4: Événements requis\n');
const requiredEvents = ['ready.js', 'interactionCreate.js', 'guildMemberAdd.js', 'messageCreate.js'];
const eventsPath = path.join(__dirname, 'src', 'events');

if (fs.existsSync(eventsPath)) {
    requiredEvents.forEach(evt => {
        const evtPath = path.join(eventsPath, evt);
        if (fs.existsSync(evtPath)) {
            pass(`Événement ${evt} existe`);
            
            // Vérifier la structure
            try {
                const content = fs.readFileSync(evtPath, 'utf8');
                if (content.includes('export default') && 
                    content.includes('name:') && 
                    content.includes('execute')) {
                    pass(`Événement ${evt} a la structure correcte`);
                } else {
                    fail(`Événement ${evt} structure invalide`, 'Manque name ou execute');
                }
            } catch (error) {
                fail(`Événement ${evt} lecture impossible`, error.message);
            }
        } else {
            fail(`Événement ${evt} manquant`, 'Événement requis');
        }
    });
}

// Test 5: Vérifier les utilitaires
console.log('\n🛠️  Test 5: Utilitaires\n');
const requiredUtils = ['logger.js', 'configManager.js', 'dailyPost.js'];
const utilsPath = path.join(__dirname, 'src', 'utils');

if (fs.existsSync(utilsPath)) {
    requiredUtils.forEach(util => {
        const utilPath = path.join(utilsPath, util);
        if (fs.existsSync(utilPath)) {
            pass(`Utilitaire ${util} existe`);
        } else {
            fail(`Utilitaire ${util} manquant`, 'Utilitaire requis');
        }
    });
}

// Test 6: Vérifier package.json
console.log('\n📦 Test 6: Dépendances\n');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        const requiredDeps = ['discord.js', 'dotenv', 'mathjs', 'node-cron'];
        requiredDeps.forEach(dep => {
            if (pkg.dependencies && pkg.dependencies[dep]) {
                pass(`Dépendance ${dep} présente`);
            } else {
                fail(`Dépendance ${dep} manquante`, 'Ajouter au package.json');
            }
        });
        
        // Vérifier les scripts
        if (pkg.scripts && pkg.scripts.start) {
            pass('Script start défini');
        } else {
            fail('Script start manquant', 'Ajouter npm start');
        }
        
        if (pkg.scripts && pkg.scripts.deploy) {
            pass('Script deploy défini');
        } else {
            fail('Script deploy manquant', 'Ajouter npm run deploy');
        }
        
        // Vérifier le type module
        if (pkg.type === 'module') {
            pass('Type module ES6 configuré');
        } else {
            fail('Type module manquant', 'Ajouter "type": "module"');
        }
        
    } catch (error) {
        fail('package.json invalide', error.message);
    }
}

// Test 7: Vérifier daily-content.json
console.log('\n📅 Test 7: Contenu quotidien\n');
const dailyContentPath = path.join(__dirname, 'config', 'daily-content.json');
if (fs.existsSync(dailyContentPath)) {
    try {
        const content = JSON.parse(fs.readFileSync(dailyContentPath, 'utf8'));
        
        if (content.jokes && Array.isArray(content.jokes) && content.jokes.length > 0) {
            pass(`${content.jokes.length} blagues chargées`);
        } else {
            warn('Blagues manquantes', 'Ajouter des blagues');
        }
        
        if (content.tips && Array.isArray(content.tips) && content.tips.length > 0) {
            pass(`${content.tips.length} conseils chargés`);
        } else {
            warn('Conseils manquants', 'Ajouter des conseils');
        }
        
    } catch (error) {
        fail('daily-content.json invalide', error.message);
    }
}

// Test 8: Vérifier les imports/exports
console.log('\n🔗 Test 8: Imports et exports\n');

// Vérifier que tous les fichiers utilisent import/export ES6
const filesToCheck = [
    'src/index.js',
    'src/commands/info.js',
    'src/commands/calc.js',
    'src/events/ready.js',
    'src/utils/logger.js'
];

filesToCheck.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('import ') && (content.includes('export default') || content.includes('export function'))) {
            pass(`${file} utilise ES6 modules`);
        } else {
            warn(`${file} n'utilise pas ES6 modules`, 'Vérifier les imports/exports');
        }
    }
});

// Test 9: Vérifier la documentation
console.log('\n📚 Test 9: Documentation\n');
const docFiles = ['README.md', 'QUICKSTART.md'];
docFiles.forEach(doc => {
    const docPath = path.join(__dirname, doc);
    if (fs.existsSync(docPath)) {
        pass(`Documentation ${doc} existe`);
    } else {
        warn(`Documentation ${doc} manquante`, 'Recommandé pour les utilisateurs');
    }
});

// Résumé final
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║                    RÉSUMÉ DES TESTS                    ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log(`\x1b[32m✅ Tests réussis: ${results.passed.length}\x1b[0m`);
console.log(`\x1b[31m❌ Tests échoués: ${results.failed.length}\x1b[0m`);
console.log(`\x1b[33m⚠️  Avertissements: ${results.warnings.length}\x1b[0m`);

if (results.failed.length > 0) {
    console.log('\n\x1b[31m❌ ÉCHECS:\x1b[0m');
    results.failed.forEach(f => console.log(`   ${f}`));
}

if (results.warnings.length > 0) {
    console.log('\n\x1b[33m⚠️  AVERTISSEMENTS:\x1b[0m');
    results.warnings.forEach(w => console.log(`   ${w}`));
}

const score = (results.passed.length / (results.passed.length + results.failed.length) * 100).toFixed(1);
console.log(`\n📊 Score de qualité: ${score}%\n`);

if (results.failed.length === 0) {
    console.log('\x1b[32m🎉 Tous les tests sont passés ! Le projet est conforme.\x1b[0m\n');
    process.exit(0);
} else {
    console.log('\x1b[31m⚠️  Certains tests ont échoué. Veuillez corriger les problèmes.\x1b[0m\n');
    process.exit(1);
}
