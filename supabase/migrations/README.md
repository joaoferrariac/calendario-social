# Migrations Multi-Tenant

Este diretório contém as migrations SQL para implementação do multi-tenant.

## Como Executar

### Opção 1: Supabase Dashboard (Recomendado para desenvolvimento)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole o conteúdo do arquivo `.sql`
5. Clique em **Run**

### Opção 2: Supabase CLI

```bash
supabase db push
```

## Ordem de Execução

| # | Arquivo | Descrição | Impacto |
|---|---------|-----------|---------|
| 1 | `001_create_clients_table.sql` | Cria tabela `clients` | ZERO |
| 2 | `002_add_client_id_columns.sql` | Adiciona `client_id` nas tabelas | ZERO |
| 3 | `003_create_user_clients_table.sql` | Cria relação usuário-cliente | ZERO |
| 4 | `004_row_level_security.sql` | Row Level Security | ⚠️ CRÍTICO |

## ⚠️ Atenção: Migration 004 (RLS)

A migration de RLS é **crítica** e deve ser executada por último, após validar que:

1. ✅ Todos os usuários existentes estão vinculados ao cliente padrão
2. ✅ Todos os posts/media existentes têm `client_id` preenchido
3. ✅ O frontend está usando as queries com filtro de cliente

### Rollback de Emergência

Se algo der errado após ativar RLS:

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE media DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_clients DISABLE ROW LEVEL SECURITY;
```

## Cliente Padrão

ID fixo: `00000000-0000-0000-0000-000000000001`

Este cliente é usado para:
- Dados existentes antes do multi-tenant
- Fallback quando nenhum cliente selecionado
- Ambiente de desenvolvimento
