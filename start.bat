@echo off
title Calendario Social - Setup Completo

echo 🚀 Iniciando Calendario Social - Setup Completo
echo ================================================

REM Verificar se Docker esta rodando
echo 📦 Verificando Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker nao esta rodando. Por favor, inicie o Docker primeiro.
    pause
    exit /b 1
)

REM Iniciar containers do banco de dados
echo 🗄️  Iniciando MongoDB e Mongo Express...
docker-compose up -d

REM Aguardar um pouco para o banco ficar disponivel
echo ⏳ Aguardando MongoDB ficar disponivel...
timeout /t 10 /nobreak >nul

echo ✅ MongoDB esta rodando!

REM Verificar se dependencias do servidor existem
if not exist "server\node_modules" (
    echo 📦 Instalando dependencias do servidor...
    cd server
    call npm install
    cd ..
)

REM Verificar se dependencias do frontend existem
if not exist "node_modules" (
    echo 📦 Instalando dependencias do frontend...
    call npm install
)

REM Executar seed do banco
echo 🌱 Executando seed do banco...
cd server
call npm run seed >nul 2>&1
cd ..

echo.
echo 🎉 Setup concluido! Iniciando servicos...
echo.
echo 📊 Servicos disponiveis:
echo   - Frontend:     http://localhost:5173
echo   - Backend API:  http://localhost:5000
echo   - Mongo Express: http://localhost:8081
echo.
echo 👤 Credenciais de login:
echo   - Email: admin@exemplo.com
echo   - Senha: admin123
echo.

REM Iniciar backend
echo 🖥️  Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && npm run dev"

REM Aguardar um pouco
timeout /t 3 /nobreak >nul

REM Iniciar frontend
echo 🌐 Iniciando servidor frontend...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Todos os servicos estao rodando!
echo 📖 Consulte o README.md para mais informacoes.
echo.
echo Para parar os servicos:
echo   - Feche as janelas dos servidores ou use Ctrl+C
echo   - Execute: docker-compose down
echo.
pause
