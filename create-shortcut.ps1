# Script PowerShell pour créer un raccourci K.Ring Manager sur le bureau
# Exécutez ce script pour créer automatiquement le raccourci

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                    ║" -ForegroundColor Cyan
Write-Host "║         Création du raccourci K.Ring Manager       ║" -ForegroundColor Cyan
Write-Host "║                                                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Chemin du bureau
$desktopPath = [Environment]::GetFolderPath("Desktop")

# Chemin du fichier batch
$batchPath = Join-Path $PSScriptRoot "manager.bat"

# Chemin du raccourci
$shortcutPath = Join-Path $desktopPath "K.Ring Manager.lnk"

Write-Host "📁 Bureau détecté : $desktopPath" -ForegroundColor Gray
Write-Host "📄 Fichier source : $batchPath" -ForegroundColor Gray
Write-Host ""

# Vérifier que le fichier batch existe
if (-not (Test-Path $batchPath)) {
    Write-Host "❌ Erreur : manager.bat introuvable !" -ForegroundColor Red
    Write-Host "   Assurez-vous d'exécuter ce script depuis le dossier K.Ring" -ForegroundColor Yellow
    pause
    exit 1
}

# Créer le raccourci
try {
    $WScriptShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $batchPath
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = "Gestionnaire du bot Discord K.Ring"
    $Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,13" # Icône d'engrenage
    $Shortcut.Save()
    
    Write-Host "✅ Raccourci créé avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Emplacement : $shortcutPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎮 Vous pouvez maintenant double-cliquer sur le raccourci" -ForegroundColor Yellow
    Write-Host "   'K.Ring Manager' sur votre bureau pour lancer le gestionnaire !" -ForegroundColor Yellow
    
} catch {
    Write-Host "Erreur lors de la creation du raccourci !" -ForegroundColor Red
    Write-Host "Details : $_" -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
