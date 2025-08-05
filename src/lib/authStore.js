import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, handleApiError } from './api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // ========== ACTIONS ==========

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.login(email, password);
          
          // Salvar no localStorage
          localStorage.setItem('auth_token', response.token);
          
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null
          });

          return { success: true, user: response.user };
        } catch (error) {
          const errorData = handleApiError(error);
          set({ isLoading: false, error: errorData.message });
          return { success: false, error: errorData.message };
        }
      },

      // Registro
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.register(userData);
          
          // Salvar no localStorage
          localStorage.setItem('auth_token', response.token);
          
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null
          });

          return { success: true, user: response.user };
        } catch (error) {
          const errorData = handleApiError(error);
          set({ isLoading: false, error: errorData.message });
          return { success: false, error: errorData.message };
        }
      },

      // Verificar token
      verifyToken: async () => {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          set({ user: null, token: null });
          return false;
        }

        set({ isLoading: true });
        
        try {
          const response = await authAPI.verifyToken();
          
          set({
            user: response.user,
            token,
            isLoading: false,
            error: null
          });

          return true;
        } catch (error) {
          // Token inválido
          localStorage.removeItem('auth_token');
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null
          });
          return false;
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isLoading: false,
          error: null
        });
      },

      // Atualizar perfil
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.updateProfile(profileData);
          
          set({
            user: response.user,
            isLoading: false,
            error: null
          });

          return { success: true, user: response.user };
        } catch (error) {
          const errorData = handleApiError(error);
          set({ isLoading: false, error: errorData.message });
          return { success: false, error: errorData.message };
        }
      },

      // Alterar senha
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          await authAPI.changePassword(currentPassword, newPassword);
          
          set({ isLoading: false, error: null });
          return { success: true };
        } catch (error) {
          const errorData = handleApiError(error);
          set({ isLoading: false, error: errorData.message });
          return { success: false, error: errorData.message };
        }
      },

      // Limpar erro
      clearError: () => set({ error: null }),

      // ========== GETTERS ==========

      // Verificar se usuário está autenticado
      isAuthenticated: () => {
        const state = get();
        return !!(state.user && state.token);
      },

      // Verificar permissões
      hasRole: (role) => {
        const state = get();
        return state.user?.role === role;
      },

      hasAnyRole: (roles) => {
        const state = get();
        return roles.includes(state.user?.role);
      },

      // Verificar se é admin
      isAdmin: () => {
        const state = get();
        return state.user?.role === 'ADMIN';
      },

      // Verificar se pode editar
      canEdit: () => {
        const state = get();
        return ['ADMIN', 'EDITOR'].includes(state.user?.role);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
);

export default useAuthStore;
