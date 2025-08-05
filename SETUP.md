# 🚀 Guia Completo de Setup - Calendário Social

Este guia irá te ajudar a configurar e executar o projeto completo passo a passo.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Neon Database (PostgreSQL)
- Conta no Cloudinary (para upload de imagens)
- Conta no Netlify (para deploy do frontend)

---

## 🔧 1. Setup do Banco de Dados (Neon)

### 1.1 Criar conta no Neon
1. Acesse https://neon.tech
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a **DATABASE_URL** que aparece

### 1.2 Exemplo de DATABASE_URL:
```
DATABASE_URL="postgresql://username:password@ep-xxxxxxxx.us-east-1.postgres.neon.tech/dbname?sslmode=require"
```

---

## ☁️ 2. Setup do Cloudinary (Upload de Imagens)

### 2.1 Criar conta no Cloudinary
1. Acesse https://cloudinary.com
2. Crie uma conta gratuita
3. No dashboard, copie:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## 🖥️ 3. Setup do Backend (Servidor)

### 3.1 Navegar para o diretório do servidor
```bash
cd server
```

### 3.2 Instalar dependências
```bash
npm install
```

### 3.3 Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env com suas configurações
```

### 3.4 Editar o arquivo `.env`:
```env
# Database - Neon PostgreSQL
DATABASE_URL="sua_url_do_neon_aqui"

# JWT Secret (gere uma chave segura)
JWT_SECRET="sua_chave_jwt_super_segura_aqui"

# Cloudinary
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"

# Configurações gerais
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3.5 Configurar banco de dados
```bash
# Aplicar schema no banco
npm run db:push

# Popular banco com dados de exemplo
npm run db:seed
```

### 3.6 Iniciar servidor
```bash
npm run dev
```

✅ **Servidor rodando em:** http://localhost:5000

---

## 💻 4. Setup do Frontend (Cliente)

### 4.1 Voltar para o diretório raiz
```bash
cd ..
```

### 4.2 Instalar dependências
```bash
npm install
```

### 4.3 Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env.development

# Editar o arquivo .env.development
```

### 4.4 Editar o arquivo `.env.development`:
```env
# API do Backend
VITE_API_URL=http://localhost:5000/api

# Informações da aplicação
VITE_APP_NAME=Calendário Social
VITE_APP_VERSION=1.0.0

# Cloudinary (para preview)
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
```

### 4.5 Iniciar aplicação
```bash
npm run dev
```

✅ **Aplicação rodando em:** http://localhost:5173

---

## 🔐 5. Testando o Sistema

### 5.1 Usuários de teste (criados pelo seed):

| Perfil | Email | Senha | Permissões |
|--------|-------|-------|------------|
| **Admin** | admin@exemplo.com | admin123 | Todas |
| **Editor** | editor@exemplo.com | editor123 | Posts + Mídia |
| **Leitor** | leitor@exemplo.com | reader123 | Visualizar |

### 5.2 Testando funcionalidades:
1. Acesse http://localhost:5173
2. Faça login com qualquer usuário acima
3. Explore o dashboard
4. Teste criação de posts (Admin/Editor)
5. Teste upload de imagens (Admin/Editor)

---

## 🌐 6. Deploy em Produção

### 6.1 Deploy do Backend (Railway - Recomendado)

1. **Criar conta no Railway**:
   - Acesse https://railway.app
   - Conecte com GitHub

2. **Fazer deploy**:
   - Faça push do código para GitHub
   - No Railway, clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha seu repositório

3. **Configurar variáveis de ambiente no Railway**:
   ```
   DATABASE_URL=sua_url_neon_postgresql
   JWT_SECRET=sua_chave_jwt_segura
   CLOUDINARY_CLOUD_NAME=seu_cloud_name
   CLOUDINARY_API_KEY=sua_api_key
   CLOUDINARY_API_SECRET=seu_api_secret
   NODE_ENV=production
   PORT=5000
   CORS_ORIGIN=https://seu-app.netlify.app
   ```

4. **URL da API**: Railway vai gerar uma URL como `https://seu-app.railway.app`

### 6.2 Deploy do Frontend (Netlify)

1. **Preparar para produção**:
   - Crie arquivo `.env.production`:
   ```env
   VITE_API_URL=https://sua-api.railway.app/api
   VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
   ```

2. **Deploy no Netlify**:
   - Acesse https://netlify.com
   - Conecte com GitHub
   - Selecione seu repositório
   - Configurações de build:
     ```
     Build command: npm run build
     Publish directory: dist
     ```

3. **Configurar variáveis de ambiente no Netlify**:
   - Vá em Site settings > Environment variables
   - Adicione as variáveis do `.env.production`

4. **Deploy automático**: A cada push no GitHub, o Netlify fará deploy automaticamente

---

## 🔧 7. Comandos Úteis

### Backend:
```bash
cd server

# Desenvolvimento
npm run dev

# Produção
npm start

# Banco de dados
npm run db:push    # Aplicar mudanças no schema
npm run db:studio  # Interface visual do banco
npm run db:seed    # Popular banco
npm run db:reset   # Resetar banco
```

### Frontend:
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## 🐛 8. Resolução de Problemas

### Erro de conexão com banco:
- Verifique se a DATABASE_URL está correta
- Certifique-se que o IP está na whitelist do Neon

### Erro de CORS:
- Verifique a variável CORS_ORIGIN no backend
- Certifique-se que as URLs estão corretas

### Erro de upload de imagem:
- Verifique as credenciais do Cloudinary
- Confirme que as variáveis estão configuradas

### Build falha no Netlify:
- Verifique se todas as dependências estão no package.json
- Confirme as variáveis de ambiente

---

## 📞 9. Suporte

Se encontrar problemas:

1. **Verifique os logs**:
   - Backend: Terminal onde rodou `npm run dev`
   - Frontend: Console do navegador (F12)

2. **Comandos de debug**:
   ```bash
   # Verificar versões
   node --version
   npm --version
   
   # Limpar cache
   npm clean cache --force
   rm -rf node_modules
   npm install
   ```

3. **Recursos úteis**:
   - [Documentação Neon](https://neon.tech/docs)
   - [Documentação Cloudinary](https://cloudinary.com/documentation)
   - [Documentação Netlify](https://docs.netlify.com)

---

## ✅ 10. Checklist Final

- [ ] Banco de dados Neon configurado
- [ ] Cloudinary configurado
- [ ] Backend rodando em desenvolvimento
- [ ] Frontend rodando em desenvolvimento
- [ ] Login funcionando com usuários de teste
- [ ] Upload de imagens funcionando
- [ ] Deploy do backend concluído
- [ ] Deploy do frontend concluído
- [ ] URLs de produção configuradas
- [ ] Aplicação funcionando em produção

🎉 **Parabéns! Seu sistema está funcionando!**
