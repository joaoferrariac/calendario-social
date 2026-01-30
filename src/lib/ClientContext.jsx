/**
 * ClientContext - Gerenciamento do Cliente/Tenant Ativo
 * 
 * Este contexto controla qual cliente está ativo no momento.
 * Todas as queries devem usar o client_id deste contexto.
 * 
 * Uso:
 * const { currentClient, switchClient, clients } = useClient();
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import useAuthStore from './authStore';

// ID do cliente padrão (fallback)
export const DEFAULT_CLIENT_ID = '00000000-0000-0000-0000-000000000001';

// Contexto
const ClientContext = createContext(null);

/**
 * Provider do Cliente
 * Deve envolver toda a aplicação (ou a parte autenticada)
 */
export function ClientProvider({ children }) {
  const user = useAuthStore((state) => state.user);
  
  // Estado
  const [currentClient, setCurrentClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Carrega os clientes que o usuário tem acesso
   */
  const loadUserClients = useCallback(async () => {
    if (!user?.id) {
      setClients([]);
      setCurrentClient(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Buscar clientes vinculados ao usuário
      const { data, error: fetchError } = await supabase
        .from('user_clients')
        .select(`
          client_id,
          role,
          is_default,
          client:clients (
            id,
            name,
            slug,
            logo_url,
            primary_color,
            secondary_color,
            tone_of_voice,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('client.is_active', true);

      if (fetchError) throw fetchError;

      // Formatar dados
      const formattedClients = (data || [])
        .filter(item => item.client) // Filtrar clientes que existem
        .map(item => ({
          ...item.client,
          userRole: item.role,
          isDefault: item.is_default,
        }));

      setClients(formattedClients);

      // Definir cliente atual
      const savedClientId = localStorage.getItem('current_client_id');
      let clientToSet = null;

      // 1. Tentar usar o cliente salvo no localStorage
      if (savedClientId) {
        clientToSet = formattedClients.find(c => c.id === savedClientId);
      }

      // 2. Se não encontrou, usar o cliente padrão do usuário
      if (!clientToSet) {
        clientToSet = formattedClients.find(c => c.isDefault);
      }

      // 3. Se ainda não encontrou, usar o primeiro da lista
      if (!clientToSet && formattedClients.length > 0) {
        clientToSet = formattedClients[0];
      }

      // 4. Fallback para cliente padrão do sistema
      if (!clientToSet) {
        clientToSet = {
          id: DEFAULT_CLIENT_ID,
          name: 'Cliente Padrão',
          slug: 'default',
          primary_color: '#6366f1',
          secondary_color: '#8b5cf6',
          userRole: 'EDITOR',
          isDefault: true,
        };
      }

      setCurrentClient(clientToSet);
      localStorage.setItem('current_client_id', clientToSet.id);

    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError(err.message);
      
      // Em caso de erro, usar cliente padrão
      setCurrentClient({
        id: DEFAULT_CLIENT_ID,
        name: 'Cliente Padrão',
        slug: 'default',
        primary_color: '#6366f1',
        secondary_color: '#8b5cf6',
        userRole: 'EDITOR',
        isDefault: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Trocar de cliente ativo
   */
  const switchClient = useCallback((clientId) => {
    const client = clients.find(c => c.id === clientId);
    
    if (client) {
      setCurrentClient(client);
      localStorage.setItem('current_client_id', clientId);
      
      // Disparar evento customizado para que outros componentes possam reagir
      window.dispatchEvent(new CustomEvent('clientChanged', { 
        detail: { client } 
      }));
      
      return true;
    }
    
    return false;
  }, [clients]);

  /**
   * Adicionar novo cliente à lista (após criar)
   */
  const addClient = useCallback((newClient) => {
    setClients(prev => [...prev, {
      ...newClient,
      userRole: 'OWNER',
      isDefault: false,
    }]);
  }, []);

  /**
   * Atualizar dados de um cliente
   */
  const updateClient = useCallback((clientId, updates) => {
    setClients(prev => prev.map(c => 
      c.id === clientId ? { ...c, ...updates } : c
    ));
    
    // Atualizar cliente atual se for o mesmo
    if (currentClient?.id === clientId) {
      setCurrentClient(prev => ({ ...prev, ...updates }));
    }
  }, [currentClient?.id]);

  /**
   * Recarregar lista de clientes
   */
  const refreshClients = useCallback(() => {
    loadUserClients();
  }, [loadUserClients]);

  // Carregar clientes quando o usuário mudar
  useEffect(() => {
    loadUserClients();
  }, [loadUserClients]);

  // Valor do contexto
  const value = {
    // Estado
    currentClient,
    clients,
    isLoading,
    error,
    
    // Ações
    switchClient,
    addClient,
    updateClient,
    refreshClients,
    
    // Helpers
    clientId: currentClient?.id || DEFAULT_CLIENT_ID,
    clientName: currentClient?.name || 'Cliente Padrão',
    clientColors: {
      primary: currentClient?.primary_color || '#6366f1',
      secondary: currentClient?.secondary_color || '#8b5cf6',
    },
    hasMultipleClients: clients.length > 1,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}

/**
 * Hook para usar o contexto de cliente
 */
export function useClient() {
  const context = useContext(ClientContext);
  
  if (!context) {
    throw new Error('useClient deve ser usado dentro de um ClientProvider');
  }
  
  return context;
}

/**
 * Hook simplificado para obter apenas o client_id atual
 * Útil para queries
 */
export function useClientId() {
  const { clientId } = useClient();
  return clientId;
}

export default ClientContext;
