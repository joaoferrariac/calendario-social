# 📱 Guia de Configuração do Instagram

## ⚠️ Problema Identificado

O sistema está configurado mas as **credenciais do Instagram estão com valores placeholder**. Por isso a integração não está funcionando.

## 🔧 Como Resolver

### 1. Criar App no Facebook Developers

1. **Acesse**: https://developers.facebook.com/
2. **Clique em**: "Meus Apps" → "Criar App"
3. **Selecione**: "Consumidor" 
4. **Preencha**:
   - Nome do App: `Calendário Social`
   - E-mail de contato: seu e-mail
   - Categoria: `Entretenimento`

### 2. Configurar Instagram Basic Display

1. **No painel do app**, clique em "Adicionar Produto"
2. **Encontre**: "Instagram Basic Display" → Configurar
3. **Vá para**: Instagram Basic Display → Configurações Básicas
4. **Configure**:
   - **URIs de redirecionamento OAuth válidos**:
     ```
     http://localhost:5000/api/instagram-auth/callback
     ```
   - **URIs de desautorização**:
     ```
     http://localhost:5000/api/instagram-auth/deauth
     ```
   - **URI de exclusão de dados**:
     ```
     http://localhost:5000/api/instagram-auth/delete
     ```

### 3. Obter Credenciais

1. **Vá para**: Instagram Basic Display → Configurações Básicas
2. **Copie**:
   - **Instagram App ID** (será seu CLIENT_ID)
   - **Instagram App Secret** (será seu CLIENT_SECRET)

### 4. Atualizar Arquivo .env

Edite o arquivo `server/.env` e substitua:

```env
# Instagram OAuth (substitua pelos valores reais)
INSTAGRAM_CLIENT_ID=sua_instagram_app_id_aqui
INSTAGRAM_CLIENT_SECRET=sua_instagram_app_secret_aqui
INSTAGRAM_REDIRECT_URI=http://localhost:5000/api/instagram-auth/callback
```

### 5. Adicionar Usuário de Teste (Para Desenvolvimento)

1. **No painel do Instagram Basic Display**
2. **Vá para**: "Funções" → "Usuários de teste do Instagram Basic Display"
3. **Clique**: "Adicionar usuários de teste do Instagram"
4. **Digite**: seu username do Instagram
5. **No Instagram**: aceite o convite nos DMs

### 6. Reiniciar o Servidor

```bash
cd server
npm run start
```

## ✅ Verificar Configuração

Após configurar, acesse:
- **Frontend**: http://localhost:5173
- **Teste de conexão**: Vá para a seção Instagram e clique em "Conectar Instagram"

## 🚨 Troubleshooting

### Erro: "client_id inválido"
- Verifique se copiou corretamente o Instagram App ID
- Confirme se o app está em modo "Desenvolvimento"

### Erro: "redirect_uri inválido"
- Verifique se adicionou `http://localhost:5000/api/instagram-auth/callback` nas URIs válidas
- Certifique-se de que não há espaços extras

### Erro: "Usuário não autorizado"
- Adicione seu usuário como "Usuário de teste"
- Aceite o convite no Instagram

## 📝 Próximos Passos

Depois que a conexão funcionar:

1. **Teste a sincronização** de posts do Instagram
2. **Configure publicação automática** (requer Facebook Page conectada)
3. **Teste o agendamento** de posts

## 🔒 Segurança

⚠️ **NUNCA** commite o arquivo `.env` com credenciais reais para repositórios públicos!
