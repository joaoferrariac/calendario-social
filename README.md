# 📱 Projeto MLabs - Sistema de Gestão de Redes Sociais

Sistema completo de gestão de conteúdo para redes sociais com design inspirado no Instagram/MLabs, desenvolvido com React, Node.js e MongoDB.

## 🚀 Funcionalidades

### ✨ **Frontend (React + Vite)**
- **Interface Moderna**: Design responsivo com TailwindCSS e Radix UI
- **Autenticação Robusta**: Login/cadastro com JWT e validação
- **Dashboard Interativo**: Estatísticas em tempo real
- **Gerenciamento de Posts**: CRUD completo com agendamento
- **Upload de Mídia**: Suporte a imagens e vídeos
- **Calendário Visual**: Visualização de posts por data
- **Roles e Permissões**: Admin, Editor e Reader
- **PWA Ready**: Otimizado para dispositivos móveis

### 🔧 **Backend (Node.js + Express)**
- **API RESTful**: Endpoints organizados e documentados
- **Banco PostgreSQL**: Usando Neon Database (cloud)
- **Upload Cloudinary**: Armazenamento de imagens/vídeos
- **Autenticação JWT**: Tokens seguros com refresh
- **Validação Zod**: Validação robusta de dados
- **Rate Limiting**: Proteção contra spam
- **CORS Configurado**: Segurança para produção

### 🛠 **DevOps & Deploy**
- **Frontend**: Deploy automático no Netlify
- **Backend**: Railway/Render (recomendado)
- **Banco**: Neon Database (PostgreSQL)
- **Mídia**: Cloudinary para imagens/vídeos

---

## 🏗️ Arquitetura do Projeto

```
📦 Projeto
├── 📁 Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários e API
│   │   └── assets/        # Assets estáticos
│   ├── public/            # Arquivos públicos
│   └── dist/              # Build de produção
│
├── 📁 Backend (Node.js + Express)
│   ├── routes/            # Rotas da API
│   ├── middleware/        # Middlewares
│   ├── prisma/            # Schema e migrations
│   └── index.js           # Servidor principal
│
└── 📁 Deploy
    ├── netlify.toml       # Config Netlify
    └── vercel.json        # Config Vercel (alternativa)
```

---

## 🚀 Setup e Instalação

### 1. **Preparar o Banco de Dados (Neon)**

1. Crie uma conta em [Neon.tech](https://neon.tech)
2. Crie um novo projeto PostgreSQL
3. Copie a DATABASE_URL

### 2. **Setup do Backend**

```bash
# Navegar para o diretório do servidor
cd server

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env com suas configurações:
# - DATABASE_URL (Neon PostgreSQL)
# - JWT_SECRET
# - CLOUDINARY_* (para upload de imagens)

# Executar migrations do banco
npm run db:push

# Seed do banco (dados de exemplo)
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

### 3. **Setup do Frontend**

```bash
# Navegar para o diretório raiz
cd ..

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.development

# Editar .env.development:
# - VITE_API_URL=http://localhost:5000/api

# Iniciar desenvolvimento
npm run dev
```

### 4. **Cloudinary Setup (Upload de Imagens)**

1. Crie uma conta em [Cloudinary](https://cloudinary.com)
2. Obtenha suas credenciais:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Configure no `.env` do backend

---

## 🌐 Deploy em Produção

### **Frontend no Netlify**

1. **Conectar Repositório**:
   - Faça push do código para GitHub
   - Conecte o repositório no Netlify

2. **Configurações de Build**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Variáveis de Ambiente**:
   ```
   VITE_API_URL=https://sua-api.herokuapp.com/api
   VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
   ```

### **Backend no Railway/Render**

1. **Railway (Recomendado)**:
   - Conecte seu repositório
   - Configure variáveis de ambiente
   - Deploy automático

2. **Variáveis de Ambiente Necessárias**:
   ```
   DATABASE_URL=sua_url_neon_postgresql
   JWT_SECRET=seu_jwt_secret_super_seguro
   CLOUDINARY_CLOUD_NAME=seu_cloud_name
   CLOUDINARY_API_KEY=sua_api_key
   CLOUDINARY_API_SECRET=seu_api_secret
   CORS_ORIGIN=https://seu-app.netlify.app
   NODE_ENV=production
   ```

---

## 🔐 Usuários de Demonstração

Após executar o seed do banco, você terá:

| Usuário | Email | Senha | Permissões |
|---------|-------|-------|------------|
| **Admin** | admin@exemplo.com | admin123 | Todas |
| **Editor** | editor@exemplo.com | editor123 | Criar/Editar Posts + Mídia |
| **Leitor** | leitor@exemplo.com | reader123 | Visualizar apenas |

---

## 📊 Funcionalidades por Perfil

### 👑 **Admin**
- ✅ Gerenciar usuários
- ✅ Todas as funcionalidades de Editor
- ✅ Visualizar estatísticas globais
- ✅ Configurações do sistema

### ✏️ **Editor**
- ✅ Criar, editar e excluir posts
- ✅ Upload de mídia (imagens/vídeos)
- ✅ Agendar publicações
- ✅ Gerenciar próprio conteúdo

### 👁️ **Leitor**
- ✅ Visualizar posts
- ✅ Comentar e curtir
- ✅ Ver calendário
- ✅ Dashboard pessoal

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- ⚛️ **React 18** + **Vite**
- 🎨 **TailwindCSS** + **Radix UI**
- 🔄 **React Query** (cache e estado)
- 🗂️ **Zustand** (estado global)
- 📱 **React Router** (navegação)
- 🎭 **Framer Motion** (animações)
- 📝 **React Hook Form** (formulários)

### **Backend**
- 🟢 **Node.js** + **Express**
- 🗄️ **PostgreSQL** + **Prisma ORM**
- 🔐 **JWT** + **bcryptjs**
- ☁️ **Cloudinary** (upload)
- ✅ **Zod** (validação)
- 🛡️ **Helmet** + **CORS** (segurança)

### **Deploy**
- 🚀 **Netlify** (frontend)
- 🚂 **Railway** (backend)
- 🐘 **Neon** (PostgreSQL)
- ☁️ **Cloudinary** (mídia)

---

## 📝 Scripts Disponíveis

### **Frontend**
```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
```

### **Backend**
```bash
npm run dev          # Desenvolvimento com nodemon
npm start           # Produção
npm run db:push     # Aplicar schema no banco
npm run db:studio   # Interface visual do banco
npm run db:seed     # Popular banco com dados
```

---

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🆘 Suporte

- 📧 Email: seu@email.com
- 💬 Discord: [Link do servidor]
- 📚 Documentação: [Link da documentação]

---

**🎉 Feito com ❤️ para facilitar o gerenciamento de suas redes sociais!**
