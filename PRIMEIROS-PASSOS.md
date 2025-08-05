# 🎉 Primeiros Passos - Calendário Social

Parabéns! Você acabou de receber um **sistema completo de gerenciamento de calendário de postagens**! 

## 🚀 Como Começar

### 📋 Opção 1: Setup Rápido (Recomendado)

Execute o script automático:

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### 📋 Opção 2: Setup Manual

```bash
# 1. Instalar dependências
npm run setup

# 2. Configurar .env files (veja SETUP.md)

# 3. Configurar banco Neon + Cloudinary

# 4. Executar migrations
cd server
npm run db:push
npm run db:seed

# 5. Iniciar aplicação
npm run start:dev
```

---

## 🌐 URLs Importantes

- **Aplicação:** http://localhost:5173
- **API:** http://localhost:5000
- **Banco (Studio):** `npm run db:studio` no diretório server

---

## 🔐 Usuários de Teste

| Perfil | Email | Senha | Acesso |
|--------|-------|-------|--------|
| **Admin** | admin@exemplo.com | admin123 | Total |
| **Editor** | editor@exemplo.com | editor123 | Posts + Mídia |
| **Leitor** | leitor@exemplo.com | reader123 | Visualização |

---

## 📚 Documentação

- **[SETUP.md](SETUP.md)** - Guia completo de instalação
- **[README.md](README.md)** - Documentação técnica completa

---

## ⚙️ Configurações Necessárias

### 🐘 1. Banco de Dados (Neon)
- Crie conta em: https://neon.tech
- Configure `DATABASE_URL` em `server/.env`

### ☁️ 2. Upload de Imagens (Cloudinary)
- Crie conta em: https://cloudinary.com
- Configure credenciais em `server/.env`

### 🌐 3. Deploy (Opcional)
- **Frontend:** Netlify
- **Backend:** Railway ou Render

---

## 🎯 Funcionalidades Principais

✅ **Dashboard Interativo** - Estatísticas em tempo real  
✅ **Gerenciamento de Posts** - CRUD completo  
✅ **Upload de Mídia** - Imagens e vídeos  
✅ **Calendário Visual** - Visualização por datas  
✅ **Sistema de Usuários** - Roles e permissões  
✅ **Interface Responsiva** - Mobile-friendly  
✅ **API RESTful** - Backend completo  

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Frontend
cd server && npm run dev # Backend
npm run start:dev        # Ambos simultaneamente

# Banco de dados
cd server
npm run db:studio        # Interface visual
npm run db:push          # Aplicar mudanças
npm run db:seed          # Popular dados

# Produção
npm run build            # Build frontend
npm run build:prod       # Build completo
```

---

## 🆘 Precisa de Ajuda?

1. **Leia a documentação:** [SETUP.md](SETUP.md)
2. **Verifique os logs:** Console do terminal
3. **Teste as URLs:** Certifique-se que os serviços estão rodando

---

## 🎨 Tecnologias Usadas

**Frontend:** React, Vite, TailwindCSS, Radix UI  
**Backend:** Node.js, Express, PostgreSQL, Prisma  
**Deploy:** Netlify + Railway + Neon Database  
**Mídia:** Cloudinary para uploads  

---

**🚀 Comece agora e transforme seu gerenciamento de redes sociais!**
