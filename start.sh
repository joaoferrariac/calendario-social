#!/bin/bash

echo "🚀 Iniciando Calendário Social - Setup Completo"
echo "================================================"

# Verificar se Docker está rodando
echo "📦 Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Iniciar containers do banco de dados
echo "🗄️  Iniciando MongoDB e Mongo Express..."
docker-compose up -d

# Aguardar banco ficar disponível
echo "⏳ Aguardando MongoDB ficar disponível..."
until docker exec mongodb-projeto mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    sleep 2
done

echo "✅ MongoDB está rodando!"

# Instalar dependências do servidor se necessário
if [ ! -d "server/node_modules" ]; then
    echo "📦 Instalando dependências do servidor..."
    cd server && npm install && cd ..
fi

# Instalar dependências do frontend se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Executar seed do banco (apenas se não existir dados)
echo "🌱 Verificando dados do banco..."
cd server
npm run seed > /dev/null 2>&1
cd ..

echo ""
echo "🎉 Setup concluído! Iniciando serviços..."
echo ""
echo "📊 Serviços disponíveis:"
echo "  - Frontend:     http://localhost:5173"
echo "  - Backend API:  http://localhost:5000"
echo "  - Mongo Express: http://localhost:8081"
echo ""
echo "👤 Credenciais de login:"
echo "  - Email: admin@exemplo.com"
echo "  - Senha: admin123"
echo ""
echo "🔄 Para parar os serviços, use: Ctrl+C nos terminais ou 'docker-compose down'"
echo ""

# Iniciar backend em background
echo "🖥️  Iniciando servidor backend..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Aguardar um pouco para o backend iniciar
sleep 3

# Iniciar frontend
echo "🌐 Iniciando servidor frontend..."
npm run dev &
FRONTEND_PID=$!

# Função para cleanup quando o script for interrompido
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Serviços parados."
    exit 0
}

# Capturar Ctrl+C para fazer cleanup
trap cleanup SIGINT

echo "✅ Todos os serviços estão rodando!"
echo "📖 Consulte o README.md para mais informações."
echo ""
echo "Pressione Ctrl+C para parar todos os serviços..."

# Manter o script rodando
wait
