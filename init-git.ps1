# ═══════════════════════════════════════════════════════════════
# Script d'Initialisation Git - K.Ring Bot
# ═══════════════════════════════════════════════════════════════

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Initialisation Git - K.Ring Bot Sécurisé          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git détecté: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé!" -ForegroundColor Red
    Write-Host "   Téléchargez Git depuis: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔍 Vérifications de sécurité..." -ForegroundColor Yellow
Write-Host ""

# Vérifier qu'aucun .env n'existe
if (Test-Path ".env") {
    Write-Host "⚠️  ATTENTION: Fichier .env détecté!" -ForegroundColor Red
    Write-Host "   Ce fichier ne doit PAS être commité." -ForegroundColor Red
    Write-Host "   Il est dans .gitignore, mais vérifiez qu'il ne contient pas de secrets." -ForegroundColor Yellow
    Write-Host ""
}

# Vérifier le .gitignore
if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore présent" -ForegroundColor Green
} else {
    Write-Host "❌ .gitignore manquant!" -ForegroundColor Red
    exit 1
}

# Vérifier .env.example
if (Test-Path ".env.example") {
    Write-Host "✅ .env.example présent" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.example manquant" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Initialisation du dépôt Git..." -ForegroundColor Cyan
Write-Host ""

# Initialiser Git
if (Test-Path ".git") {
    Write-Host "ℹ️  Dépôt Git déjà initialisé" -ForegroundColor Blue
} else {
    git init
    Write-Host "✅ Dépôt Git initialisé" -ForegroundColor Green
}

# Configurer Git (si pas déjà fait)
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName) {
    Write-Host ""
    Write-Host "⚙️  Configuration Git requise:" -ForegroundColor Yellow
    $name = Read-Host "Votre nom"
    git config user.name "$name"
    Write-Host "✅ Nom configuré: $name" -ForegroundColor Green
}

if (-not $userEmail) {
    $email = Read-Host "Votre email"
    git config user.email "$email"
    Write-Host "✅ Email configuré: $email" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Ajout des fichiers..." -ForegroundColor Cyan

# Ajouter tous les fichiers
git add .

Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green

Write-Host ""
Write-Host "💾 Création du commit initial..." -ForegroundColor Cyan

# Commit initial
git commit -m "Initial commit: K.Ring Bot sécurisé v1.0.0

- Bot Discord professionnel et modulaire
- 4 commandes slash (/info, /calc, /setwelcome, /status)
- Système de bienvenue automatique
- Publications quotidiennes
- SÉCURITÉ: Protection anti-raid, rate limiting, validation des entrées
- SÉCURITÉ: Logging complet, filtrage de contenu
- Documentation complète (README, SECURITY_REPORT, QUICKSTART)
- Tests de validation automatiques
- Prêt pour production"

Write-Host "✅ Commit créé" -ForegroundColor Green

Write-Host ""
Write-Host "🔍 Vérification finale..." -ForegroundColor Yellow
Write-Host ""

# Vérifier qu'aucun fichier sensible n'est tracké
$trackedFiles = git ls-files

$sensibleFiles = @(".env", "*.log", "guild-config.json")
$foundSensible = $false

foreach ($pattern in $sensibleFiles) {
    $matches = $trackedFiles | Where-Object { $_ -like $pattern }
    if ($matches) {
        Write-Host "⚠️  ATTENTION: Fichiers sensibles trackés: $matches" -ForegroundColor Red
        $foundSensible = $true
    }
}

if (-not $foundSensible) {
    Write-Host "✅ Aucun fichier sensible tracké" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Statistiques du dépôt:" -ForegroundColor Cyan
Write-Host ""

$fileCount = (git ls-files).Count
Write-Host "   Fichiers trackés: $fileCount" -ForegroundColor White

$commitCount = (git rev-list --count HEAD)
Write-Host "   Commits: $commitCount" -ForegroundColor White

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              Dépôt Git Prêt !                          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Créer le dépôt sur GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Blue
Write-Host "   Nom: K.Ring" -ForegroundColor Yellow
Write-Host "   Visibilité: Private ⚠️" -ForegroundColor Red
Write-Host ""

Write-Host "2. Connecter le remote:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/anthonyljn/K.Ring.git" -ForegroundColor Blue
Write-Host ""

Write-Host "3. Pousser le code:" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor Blue
Write-Host "   git push -u origin main" -ForegroundColor Blue
Write-Host ""

Write-Host "📖 Voir DEPLOY_GITHUB.md pour plus de détails" -ForegroundColor Yellow
Write-Host ""
