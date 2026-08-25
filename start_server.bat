@echo off
title MS-PHARM - Serveur Web Local
echo ========================================================
echo  MS-PHARM - Moussaoui Services Informatique
echo  Demarrage du serveur web local...
echo ========================================================
echo.
echo Le site est accessible a l'adresse : http://localhost:8080
echo.
echo (Pour arreter le serveur, fermez simplement cette fenetre)
echo.

start http://localhost:8080/tutoriels.html
python -m http.server 8080
pause
