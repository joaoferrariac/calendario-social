# 🚀 Calendário Social

Sistema completo de gerenciamento de calendário de postagens para redes sociais.

![Status](https://img.shields.io/badge/Status-100%25%20Funcional-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%2018-green)
![Database](https://img.shields.io/badge/Database-MongoDB-green)

## ⚡ Início Rápido

### 🪟 Windows
```bash
# Clique duplo no arquivo ou execute:
start.bat
```

### 🐧 Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

### 🔍 Verificar Status
```bash
chmod +x verificar.sh
./verificar.sh
```

## 🌐 Acessos

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **🖥️ Frontend** | [localhost:5173](http://localhost:5173) | admin@exemplo.com / admin123 |
| **🔌 API Backend** | [localhost:5000](http://localhost:5000) | - |
| **🗄️ Mongo Express** | [localhost:8081](http://localhost:8081) | - |

## 🎯 Funcionalidades

### ✅ Implementadas
- **🔐 Autenticação:** Login/logout com JWT e controle de acesso
- **📝 Posts:** CRUD completo com diferentes tipos (Feed, Story, Reels, Carousel)
- **📊 Dashboard:** Estatísticas em tempo real e métricas de engajamento
- **📅 Calendário:** Visualização e agendamento de posts
- **🖼️ Media:** Upload e gerenciamento de imagens via Cloudinary
- **👥 Usuários:** Gestão de perfis com diferentes permissões (Admin, Editor, Reader)
- **📱 Responsivo:** Interface adaptativa para desktop, tablet e mobile
- **🔄 Tempo Real:** Atualizações automáticas via WebSocket

### 🎨 Interface
- Design moderno estilo Instagram/Twitter
- Componentes reutilizáveis com Tailwind CSS
- Animações suaves com Framer Motion
- Sistema de notificações toast
- Tema claro/escuro (em desenvolvimento)

## 🛠️ Tecnologias

### Frontend
- **React 18** com Hooks e Context API
- **Vite** para build e hot reload
- **Tailwind CSS** para styling
- **Framer Motion** para animações
- **React Router** para navegação
- **Zustand** para gerenciamento de estado
- **React Hook Form** para formulários

### Backend
- **Node.js 18** com ES Modules
- **Express.js** para API REST
- **MongoDB** com Mongoose ODM
- **JWT** para autenticação
- **Zod** para validação de dados
- **Cloudinary** para upload de mídia
- **Docker** para containerização

### DevOps & Ferramentas
- **Docker Compose** para orquestração
- **MongoDB** containerizado
- **Mongo Express** para admin do banco
- **Nodemon** para desenvolvimento
- **ESLint** para qualidade de código

## 📁 Estrutura do Projeto

```
calendario-social/
├── 🗂️ server/                # Backend Node.js + Express
│   ├── config/              # Configurações (banco, auth, etc.)
│   ├── middleware/          # Middlewares (auth, cors, etc.)
│   ├── models/             # Modelos do MongoDB (User, Post, Media)
│   ├── routes/             # Rotas da API (auth, posts, media, users)
│   ├── index.js            # Servidor principal
│   └── seed.js             # Script de dados iniciais
├── 🗂️ src/                  # Frontend React + Vite
│   ├── components/         # Componentes reutilizáveis
│   │   ├── Layout/         # Layout principal e sidebar
│   │   └── ui/             # Componentes base (button, input, etc.)
│   ├── pages/              # Páginas da aplicação
│   ├── lib/                # Utilitários (API, auth, stores)
│   └── App.jsx             # Componente raiz
├── 🗂️ public/              # Arquivos estáticos
├── 🐳 docker-compose.yml    # Configuração Docker
├── 🚀 start.bat/sh          # Scripts de inicialização
├── 🔍 verificar.sh          # Script de verificação
└── 📖 README.md            # Esta documentação
```

## 🔧 Desenvolvimento

### Requisitos
- Node.js 18+
- Docker & Docker Compose
- Git

### Instalação Manual
```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd calendario-social

# 2. Inicie o banco de dados
docker-compose up -d

# 3. Configure o backend
cd server
npm install
npm run seed
npm run dev

# 4. Configure o frontend (em outro terminal)
cd ..
npm install
npm run dev
```

### Scripts Disponíveis
```bash
# Frontend
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build

# Backend
cd server
npm run dev          # Inicia servidor com nodemon
npm run start        # Inicia servidor em produção
npm run seed         # Popula banco com dados de exemplo

# Docker
docker-compose up -d    # Inicia containers
docker-compose down     # Para containers
docker-compose logs     # Ver logs
```

## 🗄️ Banco de Dados

### Estrutura
- **users** - Usuários do sistema (Admin, Editor, Reader)
- **posts** - Posts para redes sociais
- **media** - Arquivos de mídia (imagens, vídeos)

### Dados de Exemplo
O sistema vem pré-populado com:
- 3 usuários com diferentes perfis
- 8 posts de exemplo com diferentes status
- Estatísticas de engajamento simuladas
- Imagens de exemplo via Picsum

## 🔐 Autenticação & Autorização

### Perfis de Usuário
- **👑 ADMIN** - Acesso total ao sistema
- **✏️ EDITOR** - Pode criar/editar posts e acessar mídia
- **👁️ READER** - Apenas visualização

### Segurança
- Senhas hasheadas com bcrypt
- Tokens JWT com expiração
- Middleware de autorização por rota
- Validação de dados com Zod

## 📊 APIs Disponíveis

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `PUT /api/auth/profile` - Atualizar perfil

### Posts
- `GET /api/posts` - Listar posts
- `POST /api/posts` - Criar post
- `PUT /api/posts/:id` - Atualizar post
- `DELETE /api/posts/:id` - Deletar post
- `GET /api/posts/stats/overview` - Estatísticas

### Usuários
- `GET /api/users` - Listar usuários (Admin)
- `POST /api/users` - Criar usuário (Admin)

## 🚨 Solução de Problemas

### ❌ Problemas Comuns

**Docker não inicia:**
```bash
# Verificar se Docker Desktop está rodando
docker --version
docker-compose --version
```

**Portas em uso:**
```bash
# Verificar portas ocupadas
netstat -an | grep ":5173\|:5000\|:27017"

# Parar processos (Windows)
taskkill /F /PID <numero>

# Parar processos (Linux/Mac)
kill -9 <numero>
```

**Módulos não encontrados:**
```bash
# Limpar e reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Para o backend também
cd server
rm -rf node_modules package-lock.json
npm install
```

### 🔍 Debug
```bash
# Ver logs do MongoDB
docker-compose logs mongodb-projeto

# Ver logs do backend
cd server && npm run dev

# Verificar APIs diretamente
curl http://localhost:5000/api/posts
```

## 🎉 Status do Projeto

### ✅ Totalmente Funcional
- ✅ Autenticação e autorização
- ✅ CRUD completo de posts
- ✅ Dashboard com estatísticas
- ✅ Interface responsiva
- ✅ Upload de mídia
- ✅ Gerenciamento de usuários
- ✅ Banco de dados persistente
- ✅ Scripts de automação

### 🔄 Próximas Funcionalidades
- 📊 Analytics avançados
- 🤖 Publicação automática
- 🔔 Notificações push
- 📋 Templates de posts
- 🌙 Modo escuro
- 📱 PWA (Progressive Web App)
- 🔄 Integração com APIs das redes sociais

## 📞 Suporte

1. **📖 Consulte esta documentação**
2. **🔍 Execute `./verificar.sh`** para diagnosticar problemas
3. **📋 Verifique os logs** dos containers e servidores
4. **🧪 Teste as APIs** diretamente
5. **💬 Consulte o código** para entender o fluxo

---

**🏆 Sistema 100% funcional e pronto para uso em produção!**

Desenvolvido com ❤️ para gerenciamento profissional de redes sociais.
