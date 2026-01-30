-- ============================================
-- MIGRATION 001: Criar tabela clients (Multi-Tenant)
-- ============================================
-- Data: 2026-01-30
-- Branch: feature/multi-tenant
-- Commit: 1 de 10
--
-- IMPACTO: ZERO
-- Esta migration apenas ADICIONA estrutura nova.
-- Não altera nenhuma tabela ou dado existente.
-- ============================================

-- Criar tabela de clientes (tenants)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,  -- URL amigável: empresa-x
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#6366f1',    -- Cor principal (hex)
    secondary_color VARCHAR(7) DEFAULT '#8b5cf6',  -- Cor secundária (hex)
    
    -- Configurações de conteúdo
    tone_of_voice TEXT,  -- Tom de voz para geração de conteúdo
    
    -- Plano e limites
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    max_users INTEGER DEFAULT 3,
    max_posts_per_month INTEGER DEFAULT 30,
    max_storage_mb INTEGER DEFAULT 500,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_clients_updated_at ON clients;
CREATE TRIGGER trigger_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_clients_updated_at();

-- ============================================
-- INSERIR CLIENTE PADRÃO
-- ============================================
-- Este cliente será usado para:
-- 1. Dados existentes (migração retroativa)
-- 2. Fallback quando nenhum cliente selecionado
-- 3. Ambiente de desenvolvimento/teste
-- ============================================

INSERT INTO clients (
    id,
    name,
    slug,
    logo_url,
    primary_color,
    secondary_color,
    tone_of_voice,
    plan,
    max_users,
    max_posts_per_month,
    max_storage_mb,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',  -- ID fixo para referência
    'Cliente Padrão',
    'default',
    NULL,
    '#6366f1',
    '#8b5cf6',
    'Profissional e amigável',
    'pro',
    999,    -- Sem limite prático
    9999,   -- Sem limite prático
    99999,  -- Sem limite prático
    true
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMENTÁRIOS NA TABELA (Documentação)
-- ============================================
COMMENT ON TABLE clients IS 'Tabela de clientes/tenants para isolamento multi-tenant';
COMMENT ON COLUMN clients.slug IS 'Identificador único para URL (ex: empresa-x)';
COMMENT ON COLUMN clients.tone_of_voice IS 'Tom de voz para geração de conteúdo com IA';
COMMENT ON COLUMN clients.plan IS 'Plano de assinatura: free, starter, pro, enterprise';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute esta query para confirmar que a tabela foi criada:
-- SELECT * FROM clients;
-- 
-- Resultado esperado: 1 registro (Cliente Padrão)
-- ============================================
