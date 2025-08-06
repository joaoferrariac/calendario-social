# Sistema de Agendamento de Posts 📅

## Visão Geral

O sistema de agendamento de posts foi implementado com recursos avançados de automação e visual indicators para facilitar o gerenciamento de conteúdo nas redes sociais.

## 🚀 Funcionalidades Implementadas

### 1. Modos de Publicação

- **MANUAL** 🤚: Posts que requerem publicação manual
- **SCHEDULED** ⏰: Posts agendados para publicação automática em data/hora específica
- **RECURRING** 🔄: Posts que se repetem automaticamente com base em configurações de recorrência

### 2. Sistema de Recorrência

#### Tipos de Recorrência:
- **DAILY**: Diariamente
- **WEEKLY**: Semanalmente
- **MONTHLY**: Mensalmente
- **CUSTOM**: Configuração personalizada

#### Configurações:
- **Intervalo**: Frequência da repetição
- **Data de Fim**: Quando parar a recorrência
- **Dias da Semana**: Para recorrência semanal específica

### 3. Indicadores Visuais no Calendário

#### Ícones dos Modos:
- 🤚 **Manual**: Ícone de mão (Hand)
- ⏰ **Agendado**: Ícone de relógio (Clock)
- 🔄 **Recorrente**: Ícone de rotação (RotateCcw)

#### Cores dos Modos:
- **Manual**: Cinza (`text-gray-500`)
- **Agendado**: Azul (`text-blue-500`)
- **Recorrente**: Verde (`text-green-500`)

### 4. Interface de Usuário

#### Editor de Posts com Abas:
1. **Conteúdo**: Criação do post (título, texto, imagens)
2. **Agendamento**: Configuração de data/hora e recorrência
3. **Publicar**: Publicação direta no Instagram (quando aplicável)

#### Componente PostScheduler:
- Seleção do modo de publicação
- Configuração de data e hora
- Configuração de recorrência
- Sistema de lembretes
- Ícones visuais para plataformas

## 🔧 Implementação Técnica

### Backend

#### Modelo de Dados (Post.js):
```javascript
{
  publishMode: {
    type: String,
    enum: ['MANUAL', 'SCHEDULED', 'RECURRING'],
    default: 'MANUAL'
  },
  recurrence: {
    type: {
      type: String,
      enum: ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']
    },
    interval: Number,
    endDate: Date,
    daysOfWeek: [Number]
  },
  autoPublish: {
    type: Boolean,
    default: false
  },
  reminder: {
    enabled: Boolean,
    beforeMinutes: Number
  }
}
```

#### SchedulerService:
- **Cron Job**: Verifica posts agendados a cada minuto
- **Publicação Automática**: Integração com Instagram API
- **Recorrência**: Cria automaticamente próximas ocorrências
- **Gerenciamento de Falhas**: Log de erros e tentativas

### Frontend

#### Componentes Principais:
- **PostScheduler**: Interface de configuração de agendamento
- **PostEditorSimple**: Editor principal com sistema de abas
- **CalendarGrid**: Visualização com indicadores visuais

## 📋 Como Usar

### 1. Criar um Post Agendado:
1. Acesse o calendário
2. Clique em "Novo Post" em uma data
3. Preencha o conteúdo na aba "Conteúdo"
4. Vá para a aba "Agendamento"
5. Selecione o modo "SCHEDULED"
6. Configure data, hora e opções de recorrência
7. Salve o post

### 2. Configurar Post Recorrente:
1. Na aba "Agendamento", selecione "RECURRING"
2. Escolha o tipo de recorrência (DAILY, WEEKLY, MONTHLY)
3. Configure o intervalo (ex: a cada 2 dias)
4. Defina data de fim (opcional)
5. Para recorrência semanal, selecione os dias da semana

### 3. Visualizar no Calendário:
- Os posts aparecem como pontos coloridos
- Cada ponto tem um ícone indicando o modo de publicação
- Hover no ponto mostra detalhes do post
- Cores diferentes para cada plataforma

## 🔄 Automação

### Publicação Automática:
- Sistema verifica posts agendados a cada minuto
- Posts com `autoPublish: true` são publicados automaticamente
- Integração com Instagram Graph API
- Log detalhado de sucessos e falhas

### Recorrência Automática:
- Após publicação de post recorrente, nova ocorrência é criada
- Mantém todas as configurações originais
- Respeita intervalos e datas de fim configuradas

## 🛠️ Configuração

### Variáveis de Ambiente:
```bash
# Instagram API
INSTAGRAM_ACCESS_TOKEN=your_token
INSTAGRAM_USER_ID=your_user_id

# MongoDB
MONGODB_URI=mongodb://localhost:27017/projeto-design
```

### Inicialização:
O SchedulerService é inicializado automaticamente quando o servidor inicia:
```javascript
schedulerService.initialize();
```

## 📊 Monitoramento

### Logs do Sistema:
- `📅 SchedulerService inicializado`
- `⏰ Verificando posts agendados`
- `🚀 Post publicado com sucesso`
- `❌ Erro ao publicar post`

### Endpoint de Monitoramento:
- `GET /api/posts/scheduled`: Lista posts agendados
- Inclui informações de autor e timestamps

## 🎯 Benefícios

1. **Automação Completa**: Posts publicados automaticamente
2. **Flexibilidade**: Múltiplos modos de publicação
3. **Recorrência Inteligente**: Posts que se repetem sozinhos
4. **Visual Feedback**: Indicadores claros no calendário
5. **Facilidade de Uso**: Interface intuitiva com abas
6. **Controle Total**: Configurações granulares de timing

Este sistema permite que você organize completamente sua estratégia de conteúdo, com posts manuais para conteúdo especial, agendados para campanhas específicas, e recorrentes para manter engajamento constante.
