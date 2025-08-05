# 📱 Projeto MLabs - Sistema de Gestão de Redes Sociais

Sistema completo de gestão de conteúdo para redes sociais com design inspirado no Instagram/MLabs, desenvolvido com React, Node.js e MongoDB.

## 🚀 Tecnologias

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Animações fluidas
- **React Query** - Gerenciamento de estado e cache
- **React Router** - Roteamento
- **Radix UI** - Componentes acessíveis

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos

### DevOps
- **Docker** - Containerização
- **MongoDB Compass** - Interface gráfica do MongoDB

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Docker Desktop
- Git

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd projeto-para-design
```

### 2. Instalar dependências
```bash
# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd server
npm install
cd ..
```

### 3. Iniciar MongoDB
```bash
# Iniciar MongoDB e Mongo Express com Docker
docker-compose up -d

# Verificar se estão rodando
docker ps
```

### 4. Popular banco de dados
```bash
cd server
npm run db:seed
```

### 5. Iniciar servidores
```bash
# Terminal 1 - Backend (pasta server)
cd server
npm run dev

# Terminal 2 - Frontend (pasta raiz)
npm run dev
```

## 🔗 URLs e Acessos

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001
- **MongoDB**: mongodb://localhost:27017
- **Mongo Express**: http://localhost:8081 (admin/admin123)

## 👤 Credenciais de Teste

### Usuários Padrão
```
Admin:
- Email: admin@exemplo.com
- Senha: admin123

Editor:
- Email: editor@exemplo.com
- Senha: editor123

Leitor:
- Email: leitor@exemplo.com
- Senha: reader123
```

## 📊 Estrutura do Projeto

```
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── lib/               # Utilitários e configurações
│   └── styles/            # Estilos globais
├── server/                # Backend Node.js
│   ├── models/            # Modelos do MongoDB
│   ├── routes/            # Rotas da API
│   ├── middleware/        # Middlewares
│   └── config/            # Configurações
├── public/                # Arquivos estáticos
└── docker-compose.yml     # Configuração Docker
```

## 🎨 Funcionalidades

### Dashboard
- Interface inspirada no Instagram/MLabs
- Métricas de engagement em tempo real
- Preview de posts em grid
- Navegação lateral intuitiva

### Gerenciamento de Posts
- Criação e edição de posts
- Upload de mídia (imagens/vídeos)
- Agendamento de publicações
- Visualização em grid e feed
- Filtros por plataforma e status

### Sistema de Usuários
- Autenticação JWT
- Roles: Admin, Editor, Leitor
- Controle de acesso por permissões

### Upload de Mídia
- Drag & drop
- Preview de imagens/vídeos
- Validação de formatos
- Barra de progresso

## 🔧 Scripts Disponíveis

### Frontend
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
```

### Backend
```bash
npm run dev          # Servidor com nodemon
npm run start        # Servidor de produção
npm run db:seed      # Popular banco de dados
```

### Docker
```bash
docker-compose up -d         # Iniciar MongoDB
docker-compose down          # Parar MongoDB
docker-compose logs mongodb  # Ver logs do MongoDB
```

## 🌟 Características do Design

### MLabs Style
- Layout limpo e moderno
- Gradientes sutis
- Iconografia consistente
- Tipografia hierárquica
- Cards com sombras suaves

### Responsividade
- Mobile-first approach
- Breakpoints otimizados
- Componentes adaptáveis
- Touch-friendly

### UX/UI
- Micro-animações
- Estados de loading
- Feedback visual
- Navegação intuitiva

## 🔒 Segurança

- Autenticação JWT
- Hash bcrypt para senhas
- Rate limiting
- Validação de entrada
- Headers de segurança (Helmet)
- CORS configurado

## 📈 Performance

- Lazy loading de componentes
- React Query para cache
- Otimização de imagens
- Bundle splitting
- Compressão gzip

## 🐛 Troubleshooting

### Problemas Comuns

**Porta ocupada**
```bash
# Verificar processos na porta
netstat -ano | findstr :3001

# Matar processo
taskkill /F /PID <pid>
```

**MongoDB não conecta**
```bash
# Verificar status do container
docker ps

# Reiniciar MongoDB
docker-compose restart mongodb
```

**Dependências**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📝 Roadmap

- [ ] Sistema de comentários
- [ ] Notificações em tempo real
- [ ] Analytics avançados
- [ ] Integração com APIs sociais
- [ ] Tema escuro
- [ ] PWA (Progressive Web App)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🎯 Status do Projeto

✅ **Completo e Funcional**
- Frontend React responsivo
- Backend Node.js + MongoDB
- Sistema de autenticação
- Upload de mídia
- Interface MLabs-style
- Docker configurado

---

Desenvolvido com ❤️ para gestão profissional de redes sociais
