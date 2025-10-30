# Guide de Contribution

Merci de votre intérêt pour contribuer à K.Ring Bot ! Ce document vous guidera à travers le processus de contribution.

## Code de conduite

- Soyez respectueux et professionnel
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est meilleur pour la communauté
- Faites preuve d'empathie envers les autres contributeurs

## Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/yourusername/k-ring-bot/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Version de Node.js et discord.js
   - Logs d'erreur (sans informations sensibles)

### Proposer une fonctionnalité

1. Ouvrez une issue avec le template "Feature Request"
2. Décrivez clairement la fonctionnalité
3. Expliquez pourquoi elle serait utile
4. Proposez une implémentation si possible

### Soumettre une Pull Request

#### 1. Fork et Clone

```bash
# Fork le repository sur GitHub
# Puis clonez votre fork
git clone https://github.com/votre-username/k-ring-bot.git
cd k-ring-bot

# Ajoutez le repository original comme remote
git remote add upstream https://github.com/original-username/k-ring-bot.git
```

#### 2. Créer une branche

```bash
# Synchronisez avec upstream
git fetch upstream
git checkout main
git merge upstream/main

# Créez une branche pour votre feature/fix
git checkout -b feature/ma-nouvelle-fonctionnalite
# ou
git checkout -b fix/correction-bug
```

#### 3. Développer

```bash
# Installez les dépendances
npm install

# Lancez le bot en mode développement
npm run dev
```

#### 4. Respecter les standards de code

```bash
# Formater le code
npm run format

# Vérifier le linting
npm run lint

# Corriger automatiquement les problèmes
npm run lint:fix

# Valider tout
npm run validate
```

#### 5. Commiter

Utilisez des messages de commit clairs et descriptifs :

```bash
# Format recommandé
git commit -m "feat: ajoute commande /poll pour les sondages"
git commit -m "fix: corrige le rate limiting sur /calc"
git commit -m "docs: met à jour le README avec les nouvelles commandes"
git commit -m "refactor: simplifie le système de logging"
```

Préfixes conventionnels :
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, point-virgules manquants, etc.
- `refactor:` Refactorisation du code
- `perf:` Amélioration des performances
- `test:` Ajout ou modification de tests
- `chore:` Tâches de maintenance

#### 6. Pousser et créer la PR

```bash
# Pousser vers votre fork
git push origin feature/ma-nouvelle-fonctionnalite
```

Puis sur GitHub :
1. Créez une Pull Request vers `main`
2. Remplissez le template de PR
3. Liez les issues concernées
4. Attendez la review

## Standards de code

### Style JavaScript

- **Indentation** : 4 espaces
- **Quotes** : Single quotes `'`
- **Semicolons** : Toujours
- **Naming** :
  - `camelCase` pour les variables et fonctions
  - `PascalCase` pour les classes
  - `UPPER_SNAKE_CASE` pour les constantes

### Structure des fichiers

#### Commande

```javascript
/**
 * Description de la commande
 */

import { SlashCommandBuilder } from 'discord.js';
import logger from '../utils/logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('nom')
        .setDescription('Description'),

    async execute(interaction) {
        try {
            // Logique de la commande
            
            await interaction.reply({
                content: 'Réponse',
                ephemeral: true,
            });

            logger.info('Action effectuée');
        } catch (error) {
            logger.error('Erreur dans /nom', error);
            
            const errorMsg = 'Message d\'erreur';
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMsg, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMsg, ephemeral: true });
            }
        }
    },
};
```

#### Événement

```javascript
/**
 * Description de l'événement
 */

import logger from '../utils/logger.js';

export default {
    name: 'eventName',
    once: false, // true si l'événement ne doit se déclencher qu'une fois

    async execute(...args) {
        try {
            // Logique de l'événement
            
            logger.info('Événement traité');
        } catch (error) {
            logger.error('Erreur dans l\'événement', error);
        }
    },
};
```

### Documentation

- Documentez toutes les fonctions publiques avec JSDoc
- Ajoutez des commentaires pour la logique complexe
- Mettez à jour le README si nécessaire

Exemple JSDoc :

```javascript
/**
 * Calcule la somme de deux nombres
 * @param {number} a - Premier nombre
 * @param {number} b - Deuxième nombre
 * @returns {number} La somme de a et b
 */
function add(a, b) {
    return a + b;
}
```

### Tests (à venir)

Lorsque les tests seront implémentés :
- Écrivez des tests pour les nouvelles fonctionnalités
- Assurez-vous que tous les tests passent
- Visez une couverture de code > 80%

## Ajouter une nouvelle commande

1. Créez `src/commands/macommande.js`
2. Suivez le template ci-dessus
3. Testez localement avec `npm run dev`
4. Déployez les commandes avec `npm run deploy`
5. Documentez dans le README

## Ajouter un nouvel événement

1. Créez `src/events/monevent.js`
2. Suivez le template ci-dessus
3. Testez le déclenchement de l'événement
4. Documentez le comportement

## Ajouter une dépendance

```bash
# Pour une dépendance de production
npm install --save nom-package

# Pour une dépendance de développement
npm install --save-dev nom-package
```

Justifiez l'ajout de la dépendance dans votre PR :
- Pourquoi est-elle nécessaire ?
- Existe-t-il des alternatives ?
- Quelle est sa taille et son impact ?

## Processus de review

1. Un mainteneur reviewera votre PR
2. Des changements peuvent être demandés
3. Effectuez les modifications demandées
4. Une fois approuvée, la PR sera mergée

## Checklist avant de soumettre

- [ ] Le code suit les standards du projet
- [ ] `npm run validate` passe sans erreur
- [ ] Les commits sont clairs et descriptifs
- [ ] La documentation est à jour
- [ ] Aucune information sensible n'est commitée
- [ ] Le code a été testé localement
- [ ] Les nouvelles fonctionnalités sont documentées

## Questions ?

N'hésitez pas à :
- Ouvrir une issue pour poser des questions
- Rejoindre notre serveur Discord (si disponible)
- Contacter les mainteneurs

## Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.

---

Merci de contribuer à K.Ring Bot ! 🤖
