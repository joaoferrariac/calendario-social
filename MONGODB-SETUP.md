# MongoDB Local Setup - Guia Completo 🍃

## 📋 Visão Geral

Este projeto usa MongoDB como banco de dados local para armazenar todos os dados de posts, usuários, conexões do Instagram e agendamentos.

## 🚀 Instalação MongoDB

### Windows:

1. **Download MongoDB Community Server**
   - Acesse: https://www.mongodb.com/try/download/community
   - Baixe a versão para Windows
   - Execute o instalador (.msi)

2. **Instalação**
   - Escolha "Complete" installation
   - Marque "Install MongoDB as a Service"
   - Marque "Run service as Network Service user"
   - Instale MongoDB Compass (interface gráfica)

3. **Verificar Instalação**
   ```bash
   mongod --version
   mongo --version
   ```

### Usando Docker (Alternativa):

```bash
# Baixar e executar MongoDB
docker run -d \
  --name mongodb-local \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# Verificar se está rodando
docker ps
```

## ⚙️ Configuração do Projeto

### 1. Dependências Node.js

```bash
cd server
npm install mongoose bcryptjs jsonwebtoken
```

### 2. Variáveis de Ambiente

Arquivo `server/.env`:
```bash
# Database - MongoDB Local
MONGODB_URI=mongodb://localhost:27017/calendario-social
MONGODB_DB_NAME=calendario-social

# Remover configurações Neon PostgreSQL
# DATABASE_URL=... (comentar ou remover)
```

### 3. Configuração de Conexão

```javascript
// server/config/database.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('Erro ao conectar com MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
```

## 🗄️ Estrutura do Banco

### Collections Principais:

1. **users** - Usuários do sistema
2. **posts** - Posts e agendamentos
3. **media** - Arquivos de mídia
4. **instagramconnections** - Conexões OAuth Instagram

### Schemas Mongoose:

```javascript
// Exemplo de schema Post
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  platform: {
    type: String,
    enum: ['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN']
  },
  scheduledAt: Date,
  publishMode: {
    type: String,
    enum: ['MANUAL', 'SCHEDULED', 'RECURRING']
  }
}, { timestamps: true });
```

## 🔧 Scripts Úteis

### Iniciar MongoDB (Windows):
```bash
# Como serviço (automático)
net start MongoDB

# Manual
mongod --dbpath "C:\data\db"
```

### Acessar MongoDB Shell:
```bash
mongosh
use calendario-social
show collections
db.posts.find().limit(5)
```

### MongoDB Compass:
- URL: `mongodb://localhost:27017`
- Database: `calendario-social`

## 📊 Comandos de Administração

### Backup:
```bash
mongodump --db calendario-social --out ./backup
```

### Restore:
```bash
mongorestore --db calendario-social ./backup/calendario-social
```

### Ver Logs:
```bash
# Windows
tail -f "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"
```

## 🛠️ Seed Data (Dados Iniciais)

```javascript
// server/seed.js
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await User.create({
    name: 'Administrador',
    email: 'admin@exemplo.com',
    password: hashedPassword,
    role: 'ADMIN'
  });
  
  console.log('Dados iniciais criados!');
};

seedDatabase();
```

## 🔍 Monitoramento

### Verificar Status:
```javascript
// No Node.js
mongoose.connection.readyState
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
```

### Logs da Aplicação:
```javascript
// Middleware de log
mongoose.set('debug', true); // Desenvolvimento
```

## 🚨 Troubleshooting

### Erro "MongoDB not running":
```bash
# Windows
net start MongoDB

# Verificar portas
netstat -an | findstr 27017
```

### Erro de Conexão:
1. Verificar se MongoDB está rodando
2. Confirmar URL de conexão
3. Verificar firewall/antivírus
4. Testar com MongoDB Compass

### Performance:
```javascript
// Índices importantes
db.posts.createIndex({ scheduledAt: 1 })
db.posts.createIndex({ author: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

## 📈 Vantagens MongoDB Local

1. **Performance**: Sem latência de rede
2. **Controle Total**: Configurações personalizadas
3. **Desenvolvimento**: Facilidade para testes
4. **Custos**: Sem custos de hosting
5. **Flexibilidade**: Schema dinâmico
6. **Escalabilidade**: Fácil de escalar localmente

## 🔄 Migração de Dados

Se você tiver dados no Neon para migrar:

```javascript
// Script de migração
const migrateFromNeon = async () => {
  // 1. Exportar dados do Neon (SQL)
  // 2. Transformar para formato MongoDB
  // 3. Importar no MongoDB local
  
  console.log('Migração concluída!');
};
```

MongoDB é a escolha perfeita para este projeto pois oferece flexibilidade para os dados dinâmicos das redes sociais e excelente performance local!
