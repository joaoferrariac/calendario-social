-- ============================================
-- MIGRATION 004: Row Level Security (RLS)
-- ============================================
-- Data: 2026-01-30
-- Branch: feature/multi-tenant
-- Commit: 10 de 10 (FINAL)
--
-- ⚠️  IMPACTO: CRÍTICO
-- Esta migration ativa segurança a nível de linha.
-- Após ativar, queries sem contexto de usuário falharão.
--
-- ESTRATÉGIA DE ROLLBACK:
-- Se algo der errado, execute:
-- ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE media DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_clients DISABLE ROW LEVEL SECURITY;
-- ============================================

-- ID do cliente padrão (sempre permitido como fallback)
-- Este cliente é usado para dados existentes e desenvolvimento
DO $$
DECLARE
    default_client_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    RAISE NOTICE 'Cliente padrão: %', default_client_id;
END $$;

-- ============================================
-- FUNÇÃO HELPER: Verificar acesso ao cliente
-- ============================================
-- Verifica se o usuário atual tem acesso a um cliente específico

CREATE OR REPLACE FUNCTION public.has_client_access(check_client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Cliente padrão sempre permitido
    IF check_client_id = '00000000-0000-0000-0000-000000000001' THEN
        RETURN TRUE;
    END IF;
    
    -- NULL client_id = cliente padrão (dados legados)
    IF check_client_id IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar se usuário está vinculado ao cliente
    RETURN EXISTS (
        SELECT 1 FROM user_clients
        WHERE user_id = auth.uid()
        AND client_id = check_client_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÃO HELPER: Verificar role do usuário no cliente
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_role_in_client(check_client_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    -- Cliente padrão: buscar role global do usuário
    IF check_client_id IS NULL OR check_client_id = '00000000-0000-0000-0000-000000000001' THEN
        SELECT role INTO user_role FROM users WHERE id = auth.uid();
        RETURN user_role;
    END IF;

    SELECT role INTO user_role
    FROM user_clients
    WHERE user_id = auth.uid()
    AND client_id = check_client_id;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÃO HELPER: Verificar se pode criar clientes
-- ============================================
-- Apenas DESIGNER, ADMIN podem criar clientes

CREATE OR REPLACE FUNCTION public.can_create_client()
RETURNS BOOLEAN AS $$
DECLARE
    user_global_role VARCHAR;
BEGIN
    -- Buscar role global do usuário
    SELECT role INTO user_global_role
    FROM users
    WHERE id = auth.uid();
    
    -- Permitir DESIGNER, ADMIN, MASTER
    RETURN user_global_role IN ('DESIGNER', 'ADMIN', 'MASTER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS: TABELA CLIENTS
-- ============================================

-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Usuário pode ver clientes aos quais está vinculado
CREATE POLICY "clients_select_policy" ON clients
    FOR SELECT
    USING (
        -- Cliente padrão sempre visível
        id = '00000000-0000-0000-0000-000000000001'
        OR
        -- Clientes vinculados ao usuário
        id IN (
            SELECT client_id FROM user_clients
            WHERE user_id = auth.uid()
        )
    );

-- Policy: INSERT - Apenas DESIGNER/ADMIN podem criar
CREATE POLICY "clients_insert_policy" ON clients
    FOR INSERT
    WITH CHECK (
        public.can_create_client()
    );

-- Policy: UPDATE - Apenas OWNER/ADMIN do cliente podem editar
CREATE POLICY "clients_update_policy" ON clients
    FOR UPDATE
    USING (
        public.get_user_role_in_client(id) IN ('OWNER', 'ADMIN')
    );

-- Policy: DELETE - Apenas OWNER pode deletar (soft delete via is_active)
CREATE POLICY "clients_delete_policy" ON clients
    FOR DELETE
    USING (
        public.get_user_role_in_client(id) = 'OWNER'
    );

-- ============================================
-- RLS: TABELA USER_CLIENTS
-- ============================================

ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Ver vínculos dos clientes que tenho acesso
CREATE POLICY "user_clients_select_policy" ON user_clients
    FOR SELECT
    USING (
        -- Posso ver meus próprios vínculos
        user_id = auth.uid()
        OR
        -- Ou vínculos de clientes onde sou ADMIN/OWNER
        public.get_user_role_in_client(client_id) IN ('OWNER', 'ADMIN')
    );

-- Policy: INSERT - OWNER/ADMIN podem adicionar usuários ao cliente
CREATE POLICY "user_clients_insert_policy" ON user_clients
    FOR INSERT
    WITH CHECK (
        -- Criador do cliente pode se auto-vincular
        (user_id = auth.uid() AND public.can_create_client())
        OR
        -- OWNER/ADMIN podem vincular outros
        public.get_user_role_in_client(client_id) IN ('OWNER', 'ADMIN')
    );

-- Policy: UPDATE - OWNER/ADMIN podem editar roles
CREATE POLICY "user_clients_update_policy" ON user_clients
    FOR UPDATE
    USING (
        public.get_user_role_in_client(client_id) IN ('OWNER', 'ADMIN')
    );

-- Policy: DELETE - OWNER/ADMIN podem remover usuários
CREATE POLICY "user_clients_delete_policy" ON user_clients
    FOR DELETE
    USING (
        -- Posso me remover de um cliente
        user_id = auth.uid()
        OR
        -- OWNER/ADMIN podem remover outros
        public.get_user_role_in_client(client_id) IN ('OWNER', 'ADMIN')
    );

-- ============================================
-- RLS: TABELA POSTS
-- ============================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Ver posts dos clientes que tenho acesso
CREATE POLICY "posts_select_policy" ON posts
    FOR SELECT
    USING (
        public.has_client_access(client_id)
    );

-- Policy: INSERT - Criar posts nos clientes que tenho acesso (exceto READER)
CREATE POLICY "posts_insert_policy" ON posts
    FOR INSERT
    WITH CHECK (
        public.has_client_access(client_id)
        AND public.get_user_role_in_client(client_id) NOT IN ('READER')
    );

-- Policy: UPDATE - Editar posts dos clientes que tenho acesso (exceto READER)
CREATE POLICY "posts_update_policy" ON posts
    FOR UPDATE
    USING (
        public.has_client_access(client_id)
        AND public.get_user_role_in_client(client_id) NOT IN ('READER')
    );

-- Policy: DELETE - Deletar posts (EDITOR+)
CREATE POLICY "posts_delete_policy" ON posts
    FOR DELETE
    USING (
        public.has_client_access(client_id)
        AND public.get_user_role_in_client(client_id) IN ('OWNER', 'ADMIN', 'DESIGNER', 'EDITOR')
    );

-- ============================================
-- RLS: TABELA MEDIA
-- ============================================

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Ver mídia dos clientes que tenho acesso
CREATE POLICY "media_select_policy" ON media
    FOR SELECT
    USING (
        public.has_client_access(client_id)
    );

-- Policy: INSERT - Upload nos clientes que tenho acesso (exceto READER)
CREATE POLICY "media_insert_policy" ON media
    FOR INSERT
    WITH CHECK (
        public.has_client_access(client_id)
        AND public.get_user_role_in_client(client_id) NOT IN ('READER')
    );

-- Policy: DELETE - Deletar mídia (EDITOR+)
CREATE POLICY "media_delete_policy" ON media
    FOR DELETE
    USING (
        public.has_client_access(client_id)
        AND public.get_user_role_in_client(client_id) IN ('OWNER', 'ADMIN', 'DESIGNER', 'EDITOR')
    );

-- ============================================
-- RLS: TABELA USERS (apenas leitura controlada)
-- ============================================
-- NOTA: A tabela users pode já ter RLS.
-- Estas policies são adicionais para multi-tenant.

-- Verificar se RLS já está habilitado antes de habilitar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'users' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Policy: SELECT - Ver usuários dos mesmos clientes
-- DROP antigo e criar novo para evitar conflito
DROP POLICY IF EXISTS "users_select_policy" ON users;
CREATE POLICY "users_select_policy" ON users
    FOR SELECT
    USING (
        -- Posso ver meu próprio perfil
        id = auth.uid()
        OR
        -- Ou usuários dos clientes que tenho acesso
        id IN (
            SELECT uc2.user_id 
            FROM user_clients uc1
            JOIN user_clients uc2 ON uc1.client_id = uc2.client_id
            WHERE uc1.user_id = auth.uid()
        )
    );

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON FUNCTION has_client_access IS 'Verifica se o usuário atual tem acesso a um cliente';
COMMENT ON FUNCTION get_user_role_in_client IS 'Retorna o role do usuário em um cliente específico';
COMMENT ON FUNCTION can_create_client IS 'Verifica se o usuário pode criar novos clientes';

-- ============================================
-- VERIFICAÇÃO E TESTES
-- ============================================
/*
Para testar as policies, execute como usuário autenticado:

-- 1. Verificar clientes visíveis
SELECT * FROM clients;
-- Deve mostrar apenas cliente padrão + clientes vinculados

-- 2. Tentar inserir em cliente não autorizado (deve falhar)
INSERT INTO posts (title, content, client_id) 
VALUES ('Teste', 'Conteúdo', 'uuid-de-outro-cliente');
-- Erro esperado: new row violates row-level security policy

-- 3. Verificar posts visíveis
SELECT * FROM posts;
-- Deve mostrar apenas posts dos clientes vinculados

-- 4. Tentar criar cliente sem permissão (deve falhar se READER/EDITOR)
INSERT INTO clients (name, slug) VALUES ('Teste', 'teste');
-- Erro esperado se não for DESIGNER/ADMIN

-- ROLLBACK DE EMERGÊNCIA:
-- Se precisar desabilitar RLS temporariamente:
-- ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE media DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_clients DISABLE ROW LEVEL SECURITY;
*/

-- ============================================
-- RESUMO DAS POLICIES
-- ============================================
/*
┌─────────────────┬─────────┬─────────┬─────────┬─────────┐
│ Tabela          │ SELECT  │ INSERT  │ UPDATE  │ DELETE  │
├─────────────────┼─────────┼─────────┼─────────┼─────────┤
│ clients         │ Vinc.   │ DES/ADM │ OWN/ADM │ OWNER   │
│ user_clients    │ Próprio │ OWN/ADM │ OWN/ADM │ OWN/ADM │
│ posts           │ Vinc.   │ !READER │ !READER │ EDITOR+ │
│ media           │ Vinc.   │ !READER │ -       │ EDITOR+ │
│ users           │ Vinc.   │ -       │ -       │ -       │
└─────────────────┴─────────┴─────────┴─────────┴─────────┘

Legenda:
- Vinc. = Clientes vinculados ao usuário
- DES/ADM = DESIGNER ou ADMIN
- OWN/ADM = OWNER ou ADMIN do cliente
- !READER = Todos exceto READER
- EDITOR+ = EDITOR, DESIGNER, ADMIN, OWNER
*/
