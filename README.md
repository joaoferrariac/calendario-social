# 📅 Calendário Social

Sistema de gerenciamento de calendário de postagens para redes sociais.

## ⚡ Início Rápido

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev
```

O aplicativo estará disponível em [http://localhost:5173](http://localhost:5173)

## 🎯 Funcionalidades

- **📊 Dashboard:** Visão geral das postagens e estatísticas
- **📝 Posts:** Criar, editar e excluir postagens
- **📅 Calendário:** Visualização de postagens por data
- **🖼️ Mídia:** Upload e gerenciamento de imagens e vídeos
- **🔐 Autenticação:** Sistema de login com controle de acesso
- **📱 Responsivo:** Interface adaptativa para todos dispositivos

## 🛠️ Tecnologias

- **React 18** - Biblioteca de interface
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **React Router** - Navegação
- **Zustand** - Gerenciamento de estado
- **Radix UI** - Componentes acessíveis

## 📁 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── Layout/         # Layout principal
│   └── ui/             # Componentes de interface
├── pages/              # Páginas da aplicação
│   ├── DashboardPage   # Página inicial
│   ├── PostsPage       # Gerenciamento de posts
│   ├── CalendarPage    # Calendário visual
│   ├── MediaPage       # Biblioteca de mídia
│   └── ...
└── lib/                # Utilitários
    ├── api.js          # Funções de API (mock)
    ├── authStore.js    # Estado de autenticação
    └── utils.js        # Funções auxiliares
```

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |

## 🔐 Login de Demonstração

Para testar o sistema, use qualquer email e senha (ex: `demo@email.com` / `123456`)

> **Nota:** Este projeto usa dados armazenados localmente (localStorage) para demonstração. As funcionalidades de backend serão adicionadas posteriormente.

## 📄 Licença

MIT License
