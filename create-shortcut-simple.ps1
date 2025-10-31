# Creation du raccourci K.Ring Manager sur le bureau

$desktopPath = [Environment]::GetFolderPath("Desktop")
$batchPath = Join-Path $PSScriptRoot "manager.bat"
$shortcutPath = Join-Path $desktopPath "K.Ring Manager.lnk"

Write-Host "Creation du raccourci..." -ForegroundColor Cyan

if (-not (Test-Path $batchPath)) {
    Write-Host "Erreur: manager.bat introuvable!" -ForegroundColor Red
    exit 1
}

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $batchPath
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Gestionnaire du bot Discord K.Ring"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,13"
$Shortcut.Save()

Write-Host "Raccourci cree avec succes!" -ForegroundColor Green
Write-Host "Emplacement: $shortcutPath" -ForegroundColor Cyan
