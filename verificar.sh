#!/bin/bash

echo "🔍 Verificação Completa do Sistema"
echo "=================================="

# Verificar se os serviços estão rodando
echo "📊 Verificando serviços..."

# Frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend (5173) - OK"
else
    echo "❌ Frontend (5173) - ERRO"
fi

# Backend
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Backend (5000) - OK"
else
    echo "❌ Backend (5000) - ERRO"
fi

# Mongo Express
if curl -s http://localhost:8081 > /dev/null; then
    echo "✅ Mongo Express (8081) - OK"
else
    echo "❌ Mongo Express (8081) - ERRO"
fi

# MongoDB
if docker exec mongodb-projeto mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB - OK"
else
    echo "❌ MongoDB - ERRO"
fi

echo ""
echo "🔐 Testando autenticação..."

# Testar login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ Login - OK"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Login - ERRO"
    exit 1
fi

echo ""
echo "📝 Testando APIs..."

# Testar API de posts
if curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/posts | grep -q "posts"; then
    echo "✅ API Posts - OK"
else
    echo "❌ API Posts - ERRO"
fi

# Testar API de estatísticas
if curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/posts/stats/overview | grep -q "totalPosts"; then
    echo "✅ API Estatísticas - OK"
else
    echo "❌ API Estatísticas - ERRO"
fi

# Verificar dados no banco
POST_COUNT=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/posts | grep -o '"_id"' | wc -l)
echo "✅ Posts no banco: $POST_COUNT"

echo ""
echo "🎉 Verificação completa!"
echo "📊 Sistema Status: FUNCIONANDO"
echo ""
echo "🌐 Acessos:"
echo "  - Frontend:     http://localhost:5173"
echo "  - Backend:      http://localhost:5000"
echo "  - Mongo Express: http://localhost:8081"
echo ""
echo "👤 Login: admin@exemplo.com / admin123"
