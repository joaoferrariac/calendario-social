# Configuração do MongoDB

## Opção 1: Docker (Recomendado - Mais simples)

### Pré-requisitos
- Docker Desktop instalado

### Comandos
```bash
# Iniciar MongoDB com Docker
docker run -d -p 27017:27017 --name mongodb-projeto mongo:latest

# Verificar se está rodando
docker ps

# Parar o container
docker stop mongodb-projeto

# Iniciar novamente
docker start mongodb-projeto
```

## Opção 2: Instalação Manual

### Download do MongoDB Community Server
1. Acesse: https://www.mongodb.com/try/download/community
2. Selecione sua versão do Windows
3. Baixe e instale o MongoDB Community Server
4. Durante a instalação, marque "Install MongoDB as a Service"
5. Instale também o MongoDB Compass (GUI)

### Comandos após instalação
```bash
# Iniciar serviço (se não iniciou automaticamente)
net start MongoDB

# Verificar se está rodando
mongod --version

# Conectar com MongoDB shell
mongosh
```

## Opção 3: MongoDB Atlas (Cloud - Grátis)

### Configuração
1. Acesse: https://cloud.mongodb.com
2. Crie uma conta gratuita
3. Crie um cluster gratuito
4. Configure acesso de IP (0.0.0.0/0 para desenvolvimento)
5. Crie um usuário de banco de dados
6. Copie a connection string

### Configuração no projeto
Edite o arquivo `.env` no servidor:
```
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/projeto-design
```

## Testando a conexão

Após escolher uma opção, execute:
```bash
cd server
npm run db:seed
```
