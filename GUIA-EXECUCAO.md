# 🚀 Calendário Social - Guia de Execução Local

Sistema completo de gerenciamento de calendário de postagens para redes sociais.

## 📋 Pré-requisitos

- **Node.js** 18+ instalado
- **Docker** e **Docker Compose** instalados e rodando
- **Git** instalado
- Navegador web moderno

## 🚀 Instalação Rápida

### Opção 1: Script Automático (Recomendado)

#### No Windows:
```bash
# Clique duplo no arquivo ou execute:
start.bat
```

#### No Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

### Opção 2: Instalação Manual

1. **Clone o projeto:**
```bash
git clone <url-do-repositorio>
cd calendario-social
```

2. **Inicie os bancos de dados:**
```bash
docker-compose up -d
```

3. **Instale dependências do backend:**
```bash
cd server
npm install
npm run seed  # Popula banco com dados de exemplo
cd ..
```

4. **Instale dependências do frontend:**
```bash
npm install
```

5. **Inicie os serviços:**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

## 🌐 Acessos do Sistema

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | Interface principal do usuário |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | API REST |
| **Mongo Express** | [http://localhost:8081](http://localhost:8081) | Interface do banco de dados |

## 👤 Credenciais Padrão

### Usuário Administrador
- **Email:** `admin@exemplo.com`
- **Senha:** `admin123`
- **Perfil:** ADMIN (acesso total)

### Usuário Editor
- **Email:** `editor@exemplo.com`
- **Senha:** `editor123`
- **Perfil:** EDITOR (pode criar/editar posts)

### Usuário Leitor
- **Email:** `leitor@exemplo.com`
- **Senha:** `leitor123`
- **Perfil:** READER (apenas visualizar)

## 🗄️ Banco de Dados

### MongoDB
- **Host:** `localhost:27017`
- **Database:** `projeto-design`
- **Container:** `mongodb-projeto`

### Dados de Exemplo
O sistema vem com 8 posts de exemplo:
- Posts publicados com estatísticas
- Posts agendados
- Rascunhos
- Diferentes tipos: Feed, Stories, Reels, Carousel

## 🔧 Comandos Úteis

### Gerenciamento de Containers
```bash
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs dos containers
docker-compose logs

# Resetar banco de dados
docker-compose down -v
docker-compose up -d
cd server && npm run seed
```

### Desenvolvimento
```bash
# Executar testes (se configurados)
npm test

# Build para produção
npm run build

# Verificar qualidade do código
npm run lint
```

### Banco de Dados
```bash
# Recriar dados de exemplo
cd server
npm run seed

# Conectar ao MongoDB via CLI
docker exec -it mongodb-projeto mongosh
```

## 📁 Estrutura do Projeto

```
calendario-social/
├── 📁 server/                 # Backend Node.js + Express
│   ├── 📁 config/            # Configurações do banco
│   ├── 📁 middleware/        # Middlewares de autenticação
│   ├── 📁 models/           # Modelos do MongoDB
│   ├── 📁 routes/           # Rotas da API
│   ├── index.js             # Servidor principal
│   └── seed.js              # Script de dados iniciais
├── 📁 src/                   # Frontend React + Vite
│   ├── 📁 components/       # Componentes reutilizáveis
│   ├── 📁 pages/           # Páginas da aplicação
│   ├── 📁 lib/             # Utilitários e stores
│   └── App.jsx             # Componente principal
├── 📁 public/               # Arquivos estáticos
├── docker-compose.yml       # Configuração Docker
├── start.bat               # Script Windows
├── start.sh                # Script Linux/Mac
└── README.md               # Esta documentação
```

## 🎯 Funcionalidades

### ✅ Implementadas
- **🔐 Autenticação:** Login/logout com JWT
- **📝 Posts:** CRUD completo de posts
- **📊 Dashboard:** Estatísticas e métricas
- **📅 Calendário:** Visualização de posts agendados
- **🖼️ Media:** Upload e gerenciamento de imagens
- **👥 Usuários:** Gestão de perfis e permissões
- **📱 Responsivo:** Interface adaptativa

### 🔄 Em Desenvolvimento
- **📈 Analytics:** Relatórios avançados
- **🤖 Automação:** Publicação automática
- **🔔 Notificações:** Alertas em tempo real
- **📋 Templates:** Modelos de posts
- **🎨 Editor Visual:** Criação de posts avançada

## 🚨 Solução de Problemas

### Erro: "Docker não está rodando"
```bash
# Verifique se o Docker Desktop está aberto
# Ou inicie o serviço Docker no Linux:
sudo systemctl start docker
```

### Erro: "Porta em uso"
```bash
# Verifique processos usando as portas
netstat -an | grep ":5173\|:5000\|:27017"

# Mate processos se necessário
taskkill /F /PID <numero-do-processo>  # Windows
kill -9 <numero-do-processo>          # Linux/Mac
```

### Erro: "Módulos não encontrados"
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install

# Para o servidor
cd server
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Falha na conexão com banco"
```bash
# Restart containers
docker-compose down
docker-compose up -d

# Aguarde ~30 segundos para o MongoDB inicializar
```

### Página em branco no navegador
```bash
# Limpe cache do navegador (Ctrl+Shift+R)
# Ou verifique console do navegador (F12)
# Reinicie o servidor frontend
```

## 📞 Suporte

1. **Consulte esta documentação** primeiro
2. **Verifique os logs** dos containers e servidores
3. **Teste as APIs** diretamente via curl ou Postman
4. **Consulte o código** para entender o fluxo

## 🔄 Atualizações

Para atualizar o projeto:
```bash
git pull origin main
npm install
cd server && npm install && cd ..
docker-compose down && docker-compose up -d
```

---

**🎉 Divirta-se desenvolvendo!** 

Este sistema foi projetado para ser fácil de usar e extender. Toda contribuição é bem-vinda!
