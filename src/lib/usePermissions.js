/**
 * Hook de Permissões para Multi-Tenant
 * 
 * Uso:
 * const { canCreateClient, isDesigner } = usePermissions();
 * 
 * if (canCreateClient) {
 *   return <BotaoCriarCliente />;
 * }
 */

import { useMemo } from 'react';
import useAuthStore from './authStore';
import {
  canCreateClient,
  canEditClient,
  canEditContent,
  canManageUsers,
  canViewClientsAdmin,
  canSwitchClient,
  canAccessRoute,
  isAdmin,
  isDesigner,
  isEditor,
  isMaster,
  getUserRole,
  ROLES,
} from './permissions';

/**
 * Hook que retorna todas as permissões do usuário atual
 * Memorizado para evitar recálculos desnecessários
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  const permissions = useMemo(() => ({
    // Info do usuário
    user,
    role: getUserRole(user),
    
    // Verificações de role
    isMaster: isMaster(user),
    isAdmin: isAdmin(user),
    isDesigner: isDesigner(user),
    isEditor: isEditor(user),
    
    // Permissões de ação
    canCreateClient: canCreateClient(user),
    canEditContent: canEditContent(user),
    canManageUsers: canManageUsers(user),
    canViewClientsAdmin: canViewClientsAdmin(user),
    canSwitchClient: canSwitchClient(user),
    
    // Funções que precisam de parâmetros
    canEditClient: (clientOwnerId) => canEditClient(user, clientOwnerId),
    canAccessRoute: (path) => canAccessRoute(user, path),
  }), [user]);

  return permissions;
};

/**
 * Hook simplificado para verificar uma permissão específica
 * 
 * Uso:
 * const canCreate = useCanCreateClient();
 */
export const useCanCreateClient = () => {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => canCreateClient(user), [user]);
};

export const useCanEditContent = () => {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => canEditContent(user), [user]);
};

export const useCanManageUsers = () => {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => canManageUsers(user), [user]);
};

export const useIsDesigner = () => {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => isDesigner(user), [user]);
};

export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => isAdmin(user), [user]);
};

// Re-exportar constantes para conveniência
export { ROLES };

export default usePermissions;
