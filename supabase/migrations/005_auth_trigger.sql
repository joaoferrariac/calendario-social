-- ============================================
-- MIGRATION 005: Trigger para Supabase Auth
-- ============================================
-- Data: 2026-01-30
-- Branch: feature/multi-tenant
--
-- Esta migration cria uma trigger que sincroniza
-- auth.users com public.users automaticamente
-- ============================================

-- ============================================
-- FUNÇÃO: Criar usuário na tabela public.users
-- quando um novo usuário é criado no auth.users
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(UPPER(NEW.raw_user_meta_data->>'role'), 'READER'),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.users.name),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Executar após inserção no auth.users
-- ============================================

-- Remover trigger se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNÇÃO: Atualizar usuário quando auth.users atualiza
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users SET
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', public.users.name),
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_update();

-- ============================================
-- ATUALIZAR TABELA USERS PARA SUPORTE AUTH
-- ============================================

-- Garantir que a coluna id aceita UUID do auth
-- (provavelmente já está correto, mas vamos garantir)

-- Adicionar coluna avatar_url se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON FUNCTION public.handle_new_user IS 'Sincroniza novos usuários do auth.users para public.users';
COMMENT ON FUNCTION public.handle_user_update IS 'Sincroniza atualizações do auth.users para public.users';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
/*
Para testar:

1. Criar usuário via Supabase Auth:
   INSERT INTO auth.users (email, encrypted_password, ...)
   ou via Dashboard do Supabase > Authentication > Users

2. Verificar se foi criado na public.users:
   SELECT * FROM users ORDER BY created_at DESC LIMIT 1;

3. O usuário deve aparecer automaticamente!
*/
