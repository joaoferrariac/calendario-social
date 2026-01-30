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
| 4 | `004_rls_policies.sql` | Row Level Security | CRÍTICO |

## Rollback

Cada migration tem um arquivo de rollback correspondente:

```bash
# Reverter migration específica
supabase db reset
```

## Cliente Padrão

ID fixo: `00000000-0000-0000-0000-000000000001`

Este cliente é usado para:
- Dados existentes antes do multi-tenant
- Fallback quando nenhum cliente selecionado
- Ambiente de desenvolvimento
