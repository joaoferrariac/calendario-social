-- ============================================
-- MIGRATION 003: Criar tabela user_clients (relação N:N)
-- ============================================
-- Data: 2026-01-30
-- Branch: feature/multi-tenant
-- Commit: 3 de 10
--
-- IMPACTO: ZERO
-- Apenas adiciona estrutura nova.
-- Vincula usuários existentes ao cliente padrão.
-- ============================================

-- Tabela de relacionamento: quais usuários têm acesso a quais clientes
CREATE TABLE IF NOT EXISTS user_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamentos
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Papel do usuário NESTE cliente específico
    -- Um usuário pode ser ADMIN em um cliente e EDITOR em outro
    role VARCHAR(20) DEFAULT 'EDITOR' 
        CHECK (role IN ('OWNER', 'ADMIN', 'DESIGNER', 'EDITOR', 'READER')),
    
    -- Qual cliente é o padrão para este usuário
    is_default BOOLEAN DEFAULT false,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que um usuário só pode estar uma vez em cada cliente
    UNIQUE(user_id, client_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_clients_user_id ON user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_clients_client_id ON user_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_user_clients_is_default ON user_clients(user_id, is_default) WHERE is_default = true;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_user_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_clients_updated_at ON user_clients;
CREATE TRIGGER trigger_user_clients_updated_at
    BEFORE UPDATE ON user_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_user_clients_updated_at();

-- ============================================
-- VINCULAR USUÁRIOS EXISTENTES AO CLIENTE PADRÃO
-- ============================================
-- Todos os usuários existentes ganham acesso ao cliente padrão
-- com o mesmo role que já possuem na tabela users

INSERT INTO user_clients (user_id, client_id, role, is_default)
SELECT 
    u.id,
    '00000000-0000-0000-0000-000000000001'::UUID,  -- Cliente padrão
    COALESCE(u.role, 'READER'),                    -- Mesmo role do usuário
    true                                            -- É o cliente padrão
FROM users u
WHERE NOT EXISTS (
    -- Não duplicar se já existe
    SELECT 1 FROM user_clients uc 
    WHERE uc.user_id = u.id 
    AND uc.client_id = '00000000-0000-0000-0000-000000000001'
);

-- ============================================
-- FUNÇÃO HELPER: Garantir apenas um is_default por usuário
-- ============================================
CREATE OR REPLACE FUNCTION ensure_single_default_client()
RETURNS TRIGGER AS $$
BEGIN
    -- Se estamos definindo is_default = true
    IF NEW.is_default = true THEN
        -- Remover is_default de outros clientes do mesmo usuário
        UPDATE user_clients 
        SET is_default = false 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id
        AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_default ON user_clients;
CREATE TRIGGER trigger_ensure_single_default
    BEFORE INSERT OR UPDATE ON user_clients
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION ensure_single_default_client();

-- ============================================
-- COMENTÁRIOS (Documentação)
-- ============================================
COMMENT ON TABLE user_clients IS 'Relacionamento N:N entre usuários e clientes (multi-tenant)';
COMMENT ON COLUMN user_clients.role IS 'Papel do usuário NESTE cliente: OWNER, ADMIN, DESIGNER, EDITOR, READER';
COMMENT ON COLUMN user_clients.is_default IS 'Se true, este é o cliente padrão ao fazer login';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute estas queries para confirmar:
--
-- 1. Ver todos os vínculos:
-- SELECT u.name, u.email, c.name as client_name, uc.role, uc.is_default
-- FROM user_clients uc
-- JOIN users u ON u.id = uc.user_id
-- JOIN clients c ON c.id = uc.client_id;
--
-- 2. Contar vínculos por usuário:
-- SELECT user_id, COUNT(*) as total_clients 
-- FROM user_clients 
-- GROUP BY user_id;
--
-- Resultado esperado: Todos os usuários com pelo menos 1 cliente
-- ============================================
