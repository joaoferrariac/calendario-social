@echo off
title Calendario Social - Setup Automatico

echo.
echo ==============================================
echo    🚀 Calendario Social - Setup Automatico
echo ==============================================
echo.

REM Verificar se Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado. Instale Node.js 18+ primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version

REM Verificar se npm esta instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm nao encontrado.
    pause
    exit /b 1
)

echo ✅ npm encontrado
npm --version

echo.
echo 📦 Instalando dependencias...
echo.

REM Instalar dependencias do frontend
echo Frontend:
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias do frontend
    pause
    exit /b 1
)
echo ✅ Dependencias do frontend instaladas

REM Instalar dependencias do backend
echo.
echo Backend:
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias do backend
    pause
    exit /b 1
)
echo ✅ Dependencias do backend instaladas

REM Voltar para o diretorio raiz
cd ..

echo.
echo ⚙️ Configurando arquivos de ambiente...

REM Copiar arquivos de exemplo se nao existirem
if not exist ".env.development" (
    copy ".env.example" ".env.development" >nul
    echo ✅ Arquivo .env.development criado
)

if not exist "server\.env" (
    copy "server\.env.example" "server\.env" >nul
    echo ✅ Arquivo server\.env criado
)

echo.
echo 🔧 Proximos passos:
echo.
echo 1. Configure suas variaveis de ambiente:
echo    • Frontend: .env.development
echo    • Backend: server\.env
echo.
echo 2. Configure o banco de dados Neon:
echo    • Crie uma conta em https://neon.tech
echo    • Configure DATABASE_URL no server\.env
echo.
echo 3. Configure o Cloudinary:
echo    • Crie uma conta em https://cloudinary.com
echo    • Configure as credenciais no server\.env
echo.
echo 4. Executar migrations do banco:
echo    cd server ^&^& npm run db:push ^&^& npm run db:seed
echo.
echo 5. Iniciar os servicos:
echo    • Backend: cd server ^&^& npm run dev
echo    • Frontend: npm run dev
echo.
echo 🎉 Setup concluido! Leia o arquivo SETUP.md para instrucoes detalhadas.
echo.
pause
