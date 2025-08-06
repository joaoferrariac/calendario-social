# Integração OAuth Instagram - Guia Completo 📸

## 📋 Visão Geral

Este sistema implementa uma integração completa com a API do Instagram usando OAuth2, permitindo que usuários conectem suas contas e sincronizem dados automaticamente.

## 🔧 Configuração Inicial

### 1. Criar App no Facebook Developers

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Clique em "My Apps" → "Create App"
3. Selecione "Consumer" como tipo de app
4. Preencha os dados básicos do app

### 2. Configurar Instagram Basic Display

1. No painel do app, clique em "Add Product"
2. Encontre "Instagram Basic Display" e clique "Set Up"
3. Em "Basic Display", clique "Create New App"
4. Aceite os termos e configure

### 3. URLs de Redirecionamento

Adicione estas URLs válidas de redirecionamento:
```
http://localhost:5000/api/instagram-auth/callback
https://seudominio.com/api/instagram-auth/callback
```

### 4. Obter Credenciais

Copie as seguintes informações:
- **Instagram App ID** (Client ID)
- **Instagram App Secret** (Client Secret)

## ⚙️ Configuração do Servidor

### Variáveis de Ambiente

Adicione no arquivo `.env`:

```bash
# Instagram OAuth
INSTAGRAM_CLIENT_ID=seu_instagram_app_id
INSTAGRAM_CLIENT_SECRET=seu_instagram_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:5000/api/instagram-auth/callback
```

### Permissões Necessárias

O app solicita as seguintes permissões:
- `user_profile`: Informações básicas do perfil
- `user_media`: Acesso aos posts do usuário

## 🚀 Funcionalidades Implementadas

### 1. Autenticação OAuth2
- Login seguro via popup
- Tokens de longa duração (60 dias)
- Renovação automática de tokens

### 2. Sincronização de Dados
```javascript
// Dados sincronizados automaticamente:
{
  profile: {
    username: "string",
    accountType: "PERSONAL|BUSINESS|CREATOR",
    followersCount: number,
    followsCount: number,
    mediaCount: number
  },
  posts: [
    {
      id: "string",
      caption: "string",
      mediaType: "IMAGE|VIDEO|CAROUSEL_ALBUM",
      mediaUrl: "string",
      permalink: "string",
      timestamp: "Date",
      likesCount: number,
      commentsCount: number
    }
  ],
  insights: {
    impressions: number,
    reach: number,
    profileViews: number,
    websiteClicks: number
  }
}
```

### 3. Agendamento Automático
- Sincronização a cada 6 horas
- Detecção de tokens expirados
- Renovação automática

## 📡 Endpoints da API

### Autenticação
```http
GET /api/instagram-auth/auth
# Retorna URL de autorização

GET /api/instagram-auth/callback?code=...
# Callback após autorização

GET /api/instagram-auth/status
# Status da conexão atual

POST /api/instagram-auth/sync
# Forçar sincronização

DELETE /api/instagram-auth/disconnect
# Desconectar conta
```

## 🎨 Componentes Frontend

### InstagramConnect
```jsx
import InstagramConnect from '@/components/InstagramConnect';

<InstagramConnect />
```

Funcionalidades:
- Status da conexão em tempo real
- Botão para conectar/desconectar
- Exibição de estatísticas do perfil
- Lista de posts recentes
- Insights da conta (se disponível)

### InstagramConfig
```jsx
import InstagramConfig from '@/components/InstagramConfig';

<InstagramConfig />
```

Funcionalidades:
- Configuração de credenciais OAuth
- Documentação e links úteis
- Status de configuração
- Integração com InstagramConnect

## 🔄 Fluxo de Autenticação

1. **Usuário clica "Conectar Instagram"**
2. **Sistema gera URL de autorização**
3. **Popup abre com Instagram OAuth**
4. **Usuário autoriza o app**
5. **Instagram redireciona com código**
6. **Sistema troca código por token**
7. **Token de longa duração é obtido**
8. **Dados iniciais são sincronizados**
9. **Conexão é salva no banco**
10. **Usuário é redirecionado para sucesso**

## 🔐 Segurança

### Validação de Tokens
```javascript
// Verificação automática de expiração
if (!connection.isTokenValid()) {
  connection.isActive = false;
  await connection.save();
}
```

### Renovação Automática
```javascript
// Renovação 7 dias antes do vencimento
if (connection.needsRefresh()) {
  const newToken = await InstagramOAuthService.refreshToken(token);
  // Atualizar token no banco
}
```

## 📊 Modelo de Dados

### InstagramConnection Schema
```javascript
{
  userId: ObjectId,
  accessToken: String,
  expiresIn: Number,
  expiresAt: Date,
  instagramUserId: String,
  username: String,
  accountType: String,
  mediaCount: Number,
  followersCount: Number,
  followsCount: Number,
  isActive: Boolean,
  lastSyncAt: Date,
  syncData: {
    posts: [PostSchema],
    insights: InsightsSchema
  }
}
```

## 🚨 Tratamento de Erros

### Erros Comuns
1. **Token Expirado**: Conexão desativada automaticamente
2. **App Não Configurado**: URLs de erro personalizadas
3. **Permissões Negadas**: Redirecionamento para página de erro
4. **Rate Limiting**: Retry automático com backoff

### Logs do Sistema
```bash
📅 Iniciando sincronização para usuário 123
🚀 Post sincronizado com sucesso
❌ Erro na sincronização: Token inválido
✅ Sincronização automática concluída para 5 conexões
```

## 🔧 Manutenção

### Monitoramento
- Verificar logs de sincronização
- Monitorar tokens expirados
- Acompanhar rate limits da API

### Backup
- Dados sincronizados são salvos localmente
- Backup regular das conexões ativas
- Histórico de posts mantido

## 📈 Métricas Disponíveis

### Perfil
- Número de seguidores
- Número de pessoas seguidas
- Total de posts
- Tipo de conta

### Posts
- Curtidas por post
- Comentários por post
- Tipo de mídia
- Data de publicação

### Insights (Contas Business)
- Impressões (últimos 30 dias)
- Alcance (últimos 30 dias)
- Visualizações do perfil
- Cliques no website

## 🎯 Casos de Uso

1. **Agência de Marketing**
   - Conectar múltiplas contas de clientes
   - Monitorar performance de posts
   - Agendar publicações

2. **Influenciadores**
   - Análise de engagement
   - Histórico de posts
   - Insights de audiência

3. **Empresas**
   - Gestão de presença digital
   - Relatórios de performance
   - Automação de posts

## 🛠️ Desenvolvimento

### Estrutura de Arquivos
```
server/
├── services/
│   ├── InstagramOAuthService.js
│   └── InstagramSyncService.js
├── models/
│   └── InstagramConnection.js
└── routes/
    └── instagramAuth.js

src/
├── components/
│   ├── InstagramConnect.jsx
│   └── InstagramConfig.jsx
└── pages/
    ├── InstagramSuccess.jsx
    └── InstagramError.jsx
```

### Testes
```bash
# Testar conexão
curl -X GET http://localhost:5000/api/instagram-auth/status

# Testar sincronização
curl -X POST http://localhost:5000/api/instagram-auth/sync
```

## 📞 Suporte

### Problemas Comuns

**Q: "OAuth redirect URI mismatch"**
A: Verifique se a URL no Facebook Developers coincide exatamente com a configurada no .env

**Q: "Access token expired"**
A: O sistema renova automaticamente. Se persistir, reconecte a conta.

**Q: "Insights não aparecem"**
A: Insights só estão disponíveis para contas Business/Creator.

### Logs Úteis
```bash
# Ver logs do servidor
tail -f server/logs/app.log

# Verificar sincronizações
grep "sincronização" server/logs/app.log
```

Este sistema fornece uma integração robusta e completa com o Instagram, permitindo sincronização automática de dados e uma experiência de usuário fluida.
