-- ============================================
-- MIGRATION 002: Adicionar client_id nas tabelas existentes
-- ============================================
-- Data: 2026-01-30
-- Branch: feature/multi-tenant
-- Commit: 2 de 10
--
-- IMPACTO: ZERO
-- - Colunas são NULLABLE inicialmente
-- - Dados existentes continuam funcionando
-- - Nenhuma query existente quebra
-- ============================================

-- ID do cliente padrão (criado na migration 001)
-- Usado para migrar dados existentes
DO $$
DECLARE
    default_client_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

    -- ============================================
    -- TABELA: posts
    -- ============================================
    
    -- Adicionar coluna client_id (se não existir)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE posts ADD COLUMN client_id UUID REFERENCES clients(id);
        RAISE NOTICE 'Coluna client_id adicionada em posts';
    END IF;
    
    -- Preencher dados existentes com cliente padrão
    UPDATE posts 
    SET client_id = default_client_id 
    WHERE client_id IS NULL;
    
    RAISE NOTICE 'Posts existentes vinculados ao cliente padrão';

    -- ============================================
    -- TABELA: media
    -- ============================================
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE media ADD COLUMN client_id UUID REFERENCES clients(id);
        RAISE NOTICE 'Coluna client_id adicionada em media';
    END IF;
    
    UPDATE media 
    SET client_id = default_client_id 
    WHERE client_id IS NULL;
    
    RAISE NOTICE 'Media existente vinculada ao cliente padrão';

    -- ============================================
    -- TABELA: users
    -- ============================================
    
    -- Adicionar coluna role se não existir (para controle de permissão)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'viewer';
        RAISE NOTICE 'Coluna role adicionada em users';
    END IF;
    
    -- Atualizar role para valores válidos
    UPDATE users 
    SET role = LOWER(role)
    WHERE role IS NOT NULL;

END $$;

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para filtrar posts por cliente
CREATE INDEX IF NOT EXISTS idx_posts_client_id ON posts(client_id);

-- Índice para filtrar media por cliente  
CREATE INDEX IF NOT EXISTS idx_media_client_id ON media(client_id);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_posts_client_status ON posts(client_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_client_date ON posts(client_id, scheduled_date);

-- ============================================
-- COMENTÁRIOS (Documentação)
-- ============================================

COMMENT ON COLUMN posts.client_id IS 'ID do cliente/tenant dono deste post';
COMMENT ON COLUMN media.client_id IS 'ID do cliente/tenant dono desta mídia';
COMMENT ON COLUMN users.role IS 'Papel do usuário: owner, admin, designer, editor, viewer';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para confirmar:
--
-- 1. Verificar colunas adicionadas:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name IN ('posts', 'media', 'users') 
-- AND column_name IN ('client_id', 'role');
--
-- 2. Verificar dados migrados:
-- SELECT COUNT(*) as total, 
--        COUNT(client_id) as com_client,
--        COUNT(*) - COUNT(client_id) as sem_client
-- FROM posts;
--
-- Resultado esperado: sem_client = 0
-- ============================================
