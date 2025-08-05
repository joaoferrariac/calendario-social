#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Calendário Social - Setup Automático${NC}"
echo "=============================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instale Node.js 18+ primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm encontrado: $(npm --version)${NC}"

echo ""
echo -e "${YELLOW}📦 Instalando dependências...${NC}"

# Instalar dependências do frontend
echo -e "${BLUE}Frontend:${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências do frontend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependências do frontend instaladas${NC}"

# Instalar dependências do backend
echo -e "${BLUE}Backend:${NC}"
cd server
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências do backend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependências do backend instaladas${NC}"

# Voltar para o diretório raiz
cd ..

echo ""
echo -e "${YELLOW}⚙️ Configurando arquivos de ambiente...${NC}"

# Copiar arquivos de exemplo se não existirem
if [ ! -f ".env.development" ]; then
    cp .env.example .env.development
    echo -e "${GREEN}✅ Arquivo .env.development criado${NC}"
fi

if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo -e "${GREEN}✅ Arquivo server/.env criado${NC}"
fi

echo ""
echo -e "${YELLOW}🔧 Próximos passos:${NC}"
echo ""
echo "1. Configure suas variáveis de ambiente:"
echo -e "   ${BLUE}• Frontend:${NC} .env.development"
echo -e "   ${BLUE}• Backend:${NC} server/.env"
echo ""
echo "2. Configure o banco de dados Neon:"
echo -e "   ${BLUE}• Crie uma conta em https://neon.tech${NC}"
echo -e "   ${BLUE}• Configure DATABASE_URL no server/.env${NC}"
echo ""
echo "3. Configure o Cloudinary:"
echo -e "   ${BLUE}• Crie uma conta em https://cloudinary.com${NC}"
echo -e "   ${BLUE}• Configure as credenciais no server/.env${NC}"
echo ""
echo "4. Executar migrations do banco:"
echo -e "   ${BLUE}cd server && npm run db:push && npm run db:seed${NC}"
echo ""
echo "5. Iniciar os serviços:"
echo -e "   ${BLUE}• Backend: cd server && npm run dev${NC}"
echo -e "   ${BLUE}• Frontend: npm run dev${NC}"
echo ""
echo -e "${GREEN}🎉 Setup concluído! Leia o arquivo SETUP.md para instruções detalhadas.${NC}"
