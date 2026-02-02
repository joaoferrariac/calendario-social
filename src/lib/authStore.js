import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

/**
 * Auth Store usando Supabase Auth
 * 
 * O Supabase Auth gerencia:
 * - Sessão do usuário
 * - Tokens JWT automaticamente
 * - Refresh token
 * - auth.uid() para RLS
 */

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      session: null,
      isLoading: true,
      error: null,

      // ========== ACTIONS ==========

      // Inicializar - verificar sessão existente
      initialize: async () => {
        set({ isLoading: true });
        
        try {
          // Buscar sessão atual
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (session) {
            // Buscar dados do usuário na tabela users
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            set({
              user: userData || {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email,
                role: session.user.user_metadata?.role || 'READER'
              },
              session,
              isLoading: false,
              error: null
            });
          } else {
            set({ user: null, session: null, isLoading: false });
          }
        } catch (error) {
          console.error('Erro ao inicializar auth:', error);
          set({ user: null, session: null, isLoading: false, error: error.message });
        }
      },

      // Login com email/senha
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) throw error;
          
          // Buscar dados completos do usuário na tabela users
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          const user = userData || {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email,
            role: data.user.user_metadata?.role || 'READER'
          };
          
          set({
            user,
            session: data.session,
            isLoading: false,
            error: null
          });

          return { success: true, user };
        } catch (error) {
          console.error('Erro no login:', error);
          let message = 'Erro ao fazer login';
          
          if (error.message?.includes('Invalid login')) {
            message = 'Email ou senha inválidos';
          } else if (error.message?.includes('Email not confirmed')) {
            message = 'Email não confirmado. Verifique sua caixa de entrada.';
          }
          
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Registro de novo usuário (apenas para admins criarem usuários)
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Criar usuário no Supabase Auth
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                name: userData.name,
                role: userData.role || 'READER'
              }
            }
          });
          
          if (error) throw error;
          
          // A trigger no banco vai criar o registro na tabela users
          
          set({ isLoading: false, error: null });
          
          return { 
            success: true, 
            user: data.user,
            message: 'Usuário criado! Verifique o email para confirmar.'
          };
        } catch (error) {
          console.error('Erro no registro:', error);
          let message = 'Erro ao criar usuário';
          
          if (error.message?.includes('already registered')) {
            message = 'Este email já está cadastrado';
          }
          
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Logout
      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Erro no logout:', error);
        }
        
        set({
          user: null,
          session: null,
          isLoading: false,
          error: null
        });
      },

      // Atualizar perfil
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user } = get();
          
          // Atualizar na tabela users
          const { data, error } = await supabase
            .from('users')
            .update({
              name: profileData.name,
              avatar_url: profileData.avatarUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();
          
          if (error) throw error;
          
          // Atualizar metadados no Auth também
          await supabase.auth.updateUser({
            data: { name: profileData.name }
          });
          
          set({
            user: { ...user, ...data },
            isLoading: false,
            error: null
          });

          return { success: true, user: data };
        } catch (error) {
          console.error('Erro ao atualizar perfil:', error);
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Alterar senha
      changePassword: async (newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword
          });
          
          if (error) throw error;
          
          set({ isLoading: false, error: null });
          return { success: true };
        } catch (error) {
          console.error('Erro ao alterar senha:', error);
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      // Limpar erro
      clearError: () => set({ error: null }),

      // ========== GETTERS ==========

      // Verificar se usuário está autenticado
      isAuthenticated: () => {
        const state = get();
        return !!(state.user && state.session);
      },

      // Verificar token (chamado no App.jsx)
      verifyToken: async () => {
        await get().initialize();
        return get().isAuthenticated();
      },

      // Verificar permissões
      hasRole: (role) => {
        const state = get();
        const userRole = state.user?.role?.toUpperCase();
        if (userRole === 'MASTER') return true;
        return userRole === role?.toUpperCase();
      },

      hasAnyRole: (roles) => {
        const state = get();
        const userRole = state.user?.role?.toUpperCase();
        if (userRole === 'MASTER') return true;
        const upperRoles = roles.map(r => r?.toUpperCase());
        return upperRoles.includes(userRole);
      },

      isAdmin: () => {
        const state = get();
        const userRole = state.user?.role?.toUpperCase();
        return ['ADMIN', 'MASTER'].includes(userRole);
      },

      isMaster: () => {
        const state = get();
        return state.user?.role?.toUpperCase() === 'MASTER';
      },

      canEdit: () => {
        const state = get();
        const userRole = state.user?.role?.toUpperCase();
        return ['ADMIN', 'EDITOR', 'DESIGNER', 'MASTER'].includes(userRole);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
);

// Listener para mudanças de auth (login/logout em outras abas)
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state change:', event);
  
  if (event === 'SIGNED_IN' && session) {
    // Buscar dados do usuário
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    useAuthStore.setState({
      user: userData || {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name,
        role: session.user.user_metadata?.role || 'READER'
      },
      session,
      isLoading: false
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false
    });
  }
});

export default useAuthStore;
