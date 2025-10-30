# Multi-stage build pour optimiser la taille de l'image
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Stage final
FROM node:18-alpine

# Métadonnées
LABEL maintainer="K.Ring Team"
LABEL description="K.Ring Discord Bot - Professional Discord bot inspired by Alan Turing"
LABEL version="2.0.0"

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copier les dépendances depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copier le code source
COPY --chown=nodejs:nodejs . .

# Créer les dossiers nécessaires
RUN mkdir -p logs config && \
    chown -R nodejs:nodejs logs config

# Passer à l'utilisateur non-root
USER nodejs

# Exposer le port (si nécessaire pour des webhooks futurs)
# EXPOSE 3000

# Healthcheck (optionnel)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Démarrer le bot
CMD ["node", "src/index.js"]
