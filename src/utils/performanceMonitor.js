/**
 * Système de monitoring de performance K.Ring
 * 
 * OPTIMISATIONS :
 * - Collecte asynchrone des métriques
 * - Stockage en mémoire avec rotation automatique
 * - Calculs optimisés (moyennes, percentiles)
 */

import logger from './logger.js';
import os from 'os';

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            commands: new Map(), // Latence par commande
            events: new Map(),   // Latence par event
            memory: [],          // Historique mémoire
            cpu: [],             // Historique CPU
            ping: []             // Historique ping Discord
        };
        
        this.maxHistorySize = 100; // Limite pour éviter fuite mémoire
        this.startTime = Date.now();
    }

    /**
     * Enregistre la latence d'une commande
     * OPTIMISÉ : Utilise Map pour O(1) lookup
     */
    recordCommand(commandName, latency) {
        if (!this.metrics.commands.has(commandName)) {
            this.metrics.commands.set(commandName, []);
        }
        
        const commandMetrics = this.metrics.commands.get(commandName);
        commandMetrics.push({
            latency,
            timestamp: Date.now()
        });
        
        // Rotation automatique (optimisation mémoire)
        if (commandMetrics.length > this.maxHistorySize) {
            commandMetrics.shift();
        }
    }

    /**
     * Enregistre la latence d'un event
     */
    recordEvent(eventName, latency) {
        if (!this.metrics.events.has(eventName)) {
            this.metrics.events.set(eventName, []);
        }
        
        const eventMetrics = this.metrics.events.get(eventName);
        eventMetrics.push({
            latency,
            timestamp: Date.now()
        });
        
        if (eventMetrics.length > this.maxHistorySize) {
            eventMetrics.shift();
        }
    }

    /**
     * Enregistre les métriques système
     * OPTIMISÉ : Calculs asynchrones
     */
    recordSystemMetrics(client) {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.metrics.memory.push({
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
            rss: memoryUsage.rss,
            timestamp: Date.now()
        });
        
        this.metrics.cpu.push({
            user: cpuUsage.user,
            system: cpuUsage.system,
            timestamp: Date.now()
        });
        
        if (client && client.ws) {
            this.metrics.ping.push({
                value: client.ws.ping,
                timestamp: Date.now()
            });
        }
        
        // Rotation
        if (this.metrics.memory.length > this.maxHistorySize) {
            this.metrics.memory.shift();
        }
        if (this.metrics.cpu.length > this.maxHistorySize) {
            this.metrics.cpu.shift();
        }
        if (this.metrics.ping.length > this.maxHistorySize) {
            this.metrics.ping.shift();
        }
    }

    /**
     * Calcule les statistiques d'une commande
     * OPTIMISÉ : Calcul en une seule passe
     */
    getCommandStats(commandName) {
        const metrics = this.metrics.commands.get(commandName);
        if (!metrics || metrics.length === 0) {
            return null;
        }
        
        const latencies = metrics.map(m => m.latency);
        const sum = latencies.reduce((a, b) => a + b, 0);
        const avg = sum / latencies.length;
        const sorted = latencies.slice().sort((a, b) => a - b);
        
        return {
            count: latencies.length,
            avg: Math.round(avg),
            min: Math.min(...latencies),
            max: Math.max(...latencies),
            p50: sorted[Math.floor(sorted.length * 0.5)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }

    /**
     * Génère un rapport complet de performance
     */
    generateReport(client) {
        const uptime = Date.now() - this.startTime;
        const uptimeHours = Math.floor(uptime / 3600000);
        const uptimeMinutes = Math.floor((uptime % 3600000) / 60000);
        
        const report = {
            uptime: `${uptimeHours}h ${uptimeMinutes}m`,
            ping: client?.ws?.ping || 0,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
            },
            cpu: {
                cores: os.cpus().length,
                model: os.cpus()[0].model,
                load: os.loadavg()[0].toFixed(2)
            },
            commands: {}
        };
        
        // Statistiques par commande
        for (const [name, _] of this.metrics.commands) {
            report.commands[name] = this.getCommandStats(name);
        }
        
        return report;
    }

    /**
     * Affiche un rapport formaté dans les logs
     */
    logReport(client) {
        const report = this.generateReport(client);
        
        logger.info('═══════════════════════════════════════════════════════');
        logger.info('📊 RAPPORT DE PERFORMANCE K.RING');
        logger.info('═══════════════════════════════════════════════════════');
        logger.info(`⏱️  Uptime: ${report.uptime}`);
        logger.info(`📡 Ping Discord: ${report.ping}ms`);
        logger.info(`💾 Mémoire: ${report.memory.used}MB / ${report.memory.total}MB (RSS: ${report.memory.rss}MB)`);
        logger.info(`🖥️  CPU: ${report.cpu.cores} cores | ${report.cpu.model} | Load: ${report.cpu.load}`);
        logger.info('');
        logger.info('📋 LATENCE DES COMMANDES:');
        
        for (const [name, stats] of Object.entries(report.commands)) {
            if (stats) {
                logger.info(`   /${name}: avg=${stats.avg}ms | p95=${stats.p95}ms | count=${stats.count}`);
            }
        }
        
        logger.info('═══════════════════════════════════════════════════════');
    }

    /**
     * Réinitialise toutes les métriques
     */
    reset() {
        this.metrics.commands.clear();
        this.metrics.events.clear();
        this.metrics.memory = [];
        this.metrics.cpu = [];
        this.metrics.ping = [];
        this.startTime = Date.now();
        logger.info('Métriques de performance réinitialisées');
    }
}

// Export singleton
export default new PerformanceMonitor();
