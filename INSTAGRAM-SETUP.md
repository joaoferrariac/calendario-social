# 📸 Integração com Instagram

Este sistema agora permite publicar posts diretamente no Instagram! Siga os passos abaixo para configurar.

## 🚀 Funcionalidades

- ✅ **Publicação automática** de posts com imagens
- ✅ **Suporte a carrossel** (múltiplas imagens)
- ✅ **Legendas automáticas** com título, conteúdo e hashtags
- ✅ **Verificação de status** da conexão
- ✅ **Preview de legendas** antes da publicação

## ⚙️ Configuração

### 1. Criar App no Facebook Developers

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Clique em "Meus Apps" → "Criar App"
3. Escolha "Consumidor" como tipo de app
4. Preencha nome do app e email

### 2. Configurar Instagram Basic Display API

1. No painel do app, vá em "Produtos" → "Instagram" → "Basic Display"
2. Clique em "Configurar" na Instagram Basic Display API
3. Configure os seguintes campos:
   - **URIs de redirecionamento OAuth válidos**: `https://localhost:5000/auth/instagram/callback`
   - **Desautorizar URL de callback**: `https://localhost:5000/auth/instagram/deauthorize`
   - **Excluir URL de callback de dados**: `https://localhost:5000/auth/instagram/delete`

### 3. Obter Access Token

#### Método 1: Via Graph API Explorer (Recomendado)
1. Acesse [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Selecione seu app
3. Configure as permissões: `instagram_basic`, `pages_read_engagement`
4. Gere um token de acesso

#### Método 2: Via Instagram Basic Display
1. No painel do app, vá em "Instagram Basic Display"
2. Em "User Token Generator", clique em "Add or Remove Instagram Testers"
3. Adicione sua conta do Instagram como testador
4. Gere um token de longa duração

### 4. Obter Business Account ID

Execute esta chamada na Graph API Explorer:
```
GET /me/accounts?fields=instagram_business_account
```

Ou use este endpoint para listar suas contas:
```
GET /{user-id}?fields=accounts{instagram_business_account}
```

### 5. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` no diretório `/server`:

```bash
cp server/.env.example server/.env
```

Edite o arquivo `.env` e adicione suas credenciais:

```env
# Instagram API
INSTAGRAM_ACCESS_TOKEN=seu_access_token_aqui
INSTAGRAM_BUSINESS_ACCOUNT_ID=seu_business_account_id_aqui
BASE_URL=http://localhost:5000
```

### 6. Reiniciar o Servidor

```bash
cd server
npm run dev
```

## 🎯 Como Usar

### 1. Verificar Configuração
- Acesse o sistema e vá em "Configurações" ou "Dashboard"
- Verifique se o status do Instagram aparece como "Configurado"

### 2. Publicar um Post
1. Crie um post no calendário com:
   - ✅ Título obrigatório
   - ✅ Conteúdo
   - ✅ Pelo menos uma imagem
2. Salve o post
3. Clique em "Publicar no Instagram"
4. Aguarde a confirmação

### 3. Tipos de Publicação Suportados
- **Imagem única**: Post com uma imagem
- **Carrossel**: Post com múltiplas imagens (2-10)
- **Legendas automáticas**: Combina título + conteúdo + hashtags

## 🔧 Troubleshooting

### Erro: "Credenciais não configuradas"
- Verifique se `INSTAGRAM_ACCESS_TOKEN` e `INSTAGRAM_BUSINESS_ACCOUNT_ID` estão no `.env`
- Reinicie o servidor após adicionar as variáveis

### Erro: "Token expirado"
- Tokens de acesso do Instagram expiram em 60 dias
- Gere um novo token no Facebook Developers
- Atualize o `.env` com o novo token

### Erro: "Post deve ter pelo menos uma imagem"
- O Instagram requer imagens para posts
- Adicione pelo menos uma imagem antes de publicar

### Erro: "Conta não é Business Account"
- Converta sua conta do Instagram para Business Account
- Vincule-a a uma página do Facebook
- Use o ID da Business Account, não da página

## 📊 Limitações da API

- **Rate Limits**: 200 chamadas/hora por token
- **Formatos suportados**: JPG, PNG (imagens)
- **Tamanho máximo**: 8MB por imagem
- **Carrossel**: Máximo 10 imagens
- **Tipos de conta**: Apenas Business e Creator Accounts

## 🆘 Suporte

Se precisar de ajuda:
1. Verifique os logs do servidor no terminal
2. Teste a conexão no painel de configurações
3. Consulte a [documentação oficial do Instagram](https://developers.facebook.com/docs/instagram-api/)

## 🔗 Links Úteis

- [Facebook Developers](https://developers.facebook.com/)
- [Instagram API Documentation](https://developers.facebook.com/docs/instagram-api/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
