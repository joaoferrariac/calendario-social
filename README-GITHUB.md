# 📱 Calendário Social - Sistema de Gerenciamento de Postagens

<div align="center">

![React](https://img.shields.io/badge/React-18.2-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**Sistema moderno e completo para gerenciar calendário de postagens para redes sociais**

[🚀 Demo Live](#) • [📖 Documentação](./SETUP.md) • [🐛 Reportar Bug](#) • [💡 Solicitar Feature](#)

</div>

---

## ✨ Principais Funcionalidades

### 🎯 **Gerenciamento Completo**
- 📅 **Calendário Visual** - Visualize posts agendados
- 📝 **Editor de Posts** - CRUD completo com rich text
- 🖼️ **Upload de Mídia** - Imagens e vídeos no Cloudinary
- 📊 **Dashboard Analytics** - Estatísticas em tempo real
- 👥 **Sistema de Usuários** - 3 níveis de acesso

### 🔐 **Segurança & Autenticação**
- 🔑 **JWT Authentication** - Tokens seguros
- 👨‍💼 **Role-based Access** - Admin, Editor, Reader
- 🛡️ **Middleware de Segurança** - Helmet, CORS, Rate limiting
- ✅ **Validação Robusta** - Zod schemas

### 🎨 **Interface Moderna**
- 📱 **Responsivo** - Mobile-first design
- 🌟 **Animações Fluidas** - Framer Motion
- 🎭 **UI Consistente** - Radix UI + TailwindCSS
- ⚡ **Performance** - React Query cache

---

## 🖼️ Screenshots

<div align="center">

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Editor de Posts
![Editor](https://via.placeholder.com/800x400?text=Post+Editor+Screenshot)

### Calendário
![Calendar](https://via.placeholder.com/800x400?text=Calendar+Screenshot)

</div>

---

## 🏗️ Arquitetura

```
📦 Calendário Social
├── 🎨 Frontend (React + Vite)
│   ├── ⚛️ React 18 + Hooks
│   ├── 🎨 TailwindCSS + Radix UI
│   ├── 🔄 React Query (cache)
│   ├── 🗂️ Zustand (estado)
│   └── 📱 PWA Ready
│
├── 🔧 Backend (Node.js + Express)
│   ├── 🗄️ PostgreSQL + Prisma
│   ├── 🔐 JWT + bcrypt
│   ├── ☁️ Cloudinary Upload
│   ├── ✅ Zod Validation
│   └── 🛡️ Security Middleware
│
└── 🚀 Deploy
    ├── 🌐 Netlify (Frontend)
    ├── 🚂 Railway (Backend)
    ├── 🐘 Neon (Database)
    └── ☁️ Cloudinary (Media)
```

---

## 🚀 Quick Start

### 📋 Pré-requisitos
- Node.js 18+
- Conta [Neon Database](https://neon.tech)
- Conta [Cloudinary](https://cloudinary.com)

### ⚡ Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/joaoferrariac/calendario-social.git
cd calendario-social

# 2. Execute o setup automático
# Windows:
setup.bat
# Mac/Linux:
chmod +x setup.sh && ./setup.sh

# 3. Configure .env files (veja SETUP.md)

# 4. Inicie o desenvolvimento
npm run start:dev
```

### 🌐 URLs
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Docs:** [SETUP.md](./SETUP.md)

---

## 🔐 Usuários Demo

| Perfil | Email | Senha | Acesso |
|--------|-------|-------|--------|
| 👑 **Admin** | admin@exemplo.com | admin123 | Total |
| ✏️ **Editor** | editor@exemplo.com | editor123 | Posts + Mídia |
| 👁️ **Reader** | leitor@exemplo.com | reader123 | Visualização |

---

## 🛠️ Stack Tecnológica

### Frontend
- ⚛️ **React 18** - UI Library
- ⚡ **Vite** - Build tool
- 🎨 **TailwindCSS** - Styling
- 🧩 **Radix UI** - Components
- 🔄 **React Query** - Server state
- 🗂️ **Zustand** - Client state
- 📋 **React Hook Form** - Forms
- 🎭 **Framer Motion** - Animations

### Backend
- 🟢 **Node.js** - Runtime
- 🚀 **Express** - Web framework
- 🗄️ **PostgreSQL** - Database
- 🔧 **Prisma** - ORM
- 🔐 **JWT** - Authentication
- ☁️ **Cloudinary** - Media storage
- ✅ **Zod** - Validation
- 🛡️ **Helmet** - Security

### DevOps
- 🌐 **Netlify** - Frontend hosting
- 🚂 **Railway** - Backend hosting
- 🐘 **Neon** - PostgreSQL hosting
- ☁️ **Cloudinary** - Media CDN

---

## 📚 Documentação

- 📖 **[Setup Completo](./SETUP.md)** - Guia de instalação
- 🚀 **[Primeiros Passos](./PRIMEIROS-PASSOS.md)** - Como começar
- 🏗️ **[Arquitetura](./docs/architecture.md)** - Estrutura do projeto
- 🔐 **[API Reference](./docs/api.md)** - Endpoints
- 🎨 **[UI Guidelines](./docs/ui.md)** - Design system

---

## 🤝 Contribuição

Contribuições são bem-vindas! Veja como:

1. 🍴 **Fork** o projeto
2. 🌿 Crie sua **feature branch** (`git checkout -b feature/nova-feature`)
3. ✅ **Commit** suas mudanças (`git commit -m 'feat: nova feature'`)
4. 📤 **Push** para a branch (`git push origin feature/nova-feature`)
5. 🔀 Abra um **Pull Request**

### 📋 Guidelines
- Use [Conventional Commits](https://conventionalcommits.org/)
- Teste antes de fazer PR
- Mantenha código limpo e documentado

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 🆘 Suporte

- 📧 **Email:** joaoferraridev@gmail.com
- 🐛 **Issues:** [GitHub Issues](../../issues)
- 💬 **Discussões:** [GitHub Discussions](../../discussions)

---

## 🎯 Roadmap

- [ ] 📱 App mobile (React Native)
- [ ] 🤖 Integração com APIs das redes sociais
- [ ] 📈 Analytics avançados
- [ ] 🎨 Temas personalizáveis
- [ ] 🌍 Internacionalização (i18n)
- [ ] 📊 Relatórios em PDF
- [ ] 🔔 Notificações push
- [ ] 👥 Colaboração em equipe

---

<div align="center">

**⭐ Se este projeto foi útil, deixe uma estrela no GitHub!**

Feito com ❤️ por [João Ferrari](https://github.com/joaoferrariac)

</div>
