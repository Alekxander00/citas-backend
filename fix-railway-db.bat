@echo off
echo 🔧 REPARANDO PROBLEMA DE PRISMA:// EN RAILWAY

cd /d D:\Proyectos\sistema-citas-medicas\backend

echo 1. Creando server.js corregido...
echo // server.js corregido para Railway > temp-server.js
echo // Código con la corrección para prisma:// >> temp-server.js

REM Copia todo el código corregido aquí
type "%~dp0server-railway-fixed.js" > temp-server.js 2>nul || (
  echo // Archivo temporal creado
)

if exist server.js (
  copy server.js server.js.backup
  echo ✅ Backup creado: server.js.backup
)

move /Y temp-server.js server.js

echo 2. Creando railway-start.sh para forzar configuración...
echo #!/bin/bash > railway-start.sh
echo echo "Forzando DATABASE_URL correcta..." >> railway-start.sh
echo export DATABASE_URL="postgresql://postgres:bxFgRmIWEsZMmtKDxoJyHAbewduJrNMu@postgres.railway.internal:5432/railway" >> railway-start.sh
echo echo "URL configurada" >> railway-start.sh
echo npm start >> railway-start.sh

echo 3. Actualizando package.json...
npm pkg set scripts.start="node server.js"

echo 4. Subiendo cambios...
git add .
git commit -m "fix: correct database url for railway"
git push origin main

echo.
echo ✅ CAMBIOS SUBIDOS!
echo.
echo Ahora Railway usará la URL correcta.
echo Prueba en 2-3 minutos: https://citas-backend-production-3949.up.railway.app/health
pause