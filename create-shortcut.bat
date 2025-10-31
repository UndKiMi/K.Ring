@echo off
title Création du raccourci K.Ring Manager
color 0B
cls

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║                                                    ║
echo ║         Création du raccourci K.Ring Manager       ║
echo ║                                                    ║
echo ╚════════════════════════════════════════════════════╝
echo.

echo 🔧 Création du raccourci sur le bureau...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0create-shortcut.ps1"

echo.
echo ✅ Terminé !
echo.
pause
