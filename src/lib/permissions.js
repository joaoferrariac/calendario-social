/**
 * Helpers de Permissão para Multi-Tenant
 * 
 * Este arquivo centraliza todas as verificações de permissão,
 * facilitando manutenção e auditoria de segurança.
 * 
 * HIERARQUIA DE ROLES (do maior para o menor):
 * - MASTER: Super admin, acesso total ao sistema (não vinculado a tenant)
 * - ADMIN: Admin do tenant, pode gerenciar usuários e configurações
 * - DESIGNER: Pode criar clientes e gerenciar conteúdo visual
 * - EDITOR: Pode criar e editar posts
 * - READER: Apenas visualização
 */

// ============================================
// CONSTANTES
// ============================================

export const ROLES = {
  MASTER: 'MASTER',
  ADMIN: 'ADMIN',
  DESIGNER: 'DESIGNER',
  EDITOR: 'EDITOR',
  READER: 'READER',
};

// Hierarquia de permissões (índice maior = mais permissões)
const ROLE_HIERARCHY = {
  [ROLES.READER]: 0,
  [ROLES.EDITOR]: 1,
  [ROLES.DESIGNER]: 2,
  [ROLES.ADMIN]: 3,
  [ROLES.MASTER]: 4,
};

// Roles que podem criar clientes (UPPERCASE para comparação normalizada)
const CLIENT_CREATOR_ROLES = [ROLES.EDITOR, ROLES.DESIGNER, ROLES.ADMIN, ROLES.MASTER];

// Roles que podem editar conteúdo
const CONTENT_EDITOR_ROLES = [ROLES.EDITOR, ROLES.DESIGNER, ROLES.ADMIN, ROLES.MASTER];

// Roles que podem gerenciar usuários
const USER_MANAGER_ROLES = [ROLES.ADMIN, ROLES.MASTER];

// ============================================
// HELPERS DE VERIFICAÇÃO
// ============================================

/**
 * Obtém o role do usuário (normalizado para uppercase)
 * @param {Object} user - Objeto do usuário
 * @returns {string} Role normalizado ou 'READER' como fallback
 */
export const getUserRole = (user) => {
  if (!user?.role) return ROLES.READER;
  return user.role.toUpperCase();
};

/**
 * Verifica se o usuário tem um role específico
 * @param {Object} user - Objeto do usuário
 * @param {string} role - Role a verificar
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  const userRole = getUserRole(user);
  // MASTER tem todas as permissões
  if (userRole === ROLES.MASTER) return true;
  return userRole === role;
};

/**
 * Verifica se o usuário tem pelo menos um dos roles especificados
 * @param {Object} user - Objeto do usuário
 * @param {string[]} roles - Array de roles
 * @returns {boolean}
 */
export const hasAnyRole = (user, roles) => {
  const userRole = getUserRole(user);
  if (userRole === ROLES.MASTER) return true;
  return roles.includes(userRole);
};

/**
 * Verifica se o role do usuário é >= ao role mínimo requerido
 * @param {Object} user - Objeto do usuário
 * @param {string} minRole - Role mínimo necessário
 * @returns {boolean}
 */
export const hasMinRole = (user, minRole) => {
  const userRole = getUserRole(user);
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const minLevel = ROLE_HIERARCHY[minRole] ?? 0;
  return userLevel >= minLevel;
};

// ============================================
// PERMISSÕES ESPECÍFICAS
// ============================================

/**
 * Verifica se o usuário é MASTER (super admin)
 */
export const isMaster = (user) => getUserRole(user) === ROLES.MASTER;

/**
 * Verifica se o usuário é ADMIN ou superior
 */
export const isAdmin = (user) => hasMinRole(user, ROLES.ADMIN);

/**
 * Verifica se o usuário é DESIGNER ou superior
 */
export const isDesigner = (user) => hasMinRole(user, ROLES.DESIGNER);

/**
 * Verifica se o usuário é EDITOR ou superior
 */
export const isEditor = (user) => hasMinRole(user, ROLES.EDITOR);

// ============================================
// PERMISSÕES DE AÇÕES
// ============================================

/**
 * Verifica se pode CRIAR novos clientes (multi-tenant)
 * Apenas DESIGNER, ADMIN e MASTER
 */
export const canCreateClient = (user) => {
  return hasAnyRole(user, CLIENT_CREATOR_ROLES);
};

/**
 * Verifica se pode EDITAR dados de um cliente
 * Apenas DESIGNER (dono), ADMIN e MASTER
 */
export const canEditClient = (user, clientOwnerId = null) => {
  const userRole = getUserRole(user);
  
  // MASTER e ADMIN podem editar qualquer cliente
  if ([ROLES.MASTER, ROLES.ADMIN].includes(userRole)) return true;
  
  // DESIGNER pode editar apenas clientes que criou
  if (userRole === ROLES.DESIGNER && clientOwnerId) {
    return user.id === clientOwnerId;
  }
  
  return false;
};

/**
 * Verifica se pode CRIAR/EDITAR posts
 */
export const canEditContent = (user) => {
  return hasAnyRole(user, CONTENT_EDITOR_ROLES);
};

/**
 * Verifica se pode GERENCIAR usuários (convidar, remover, mudar roles)
 */
export const canManageUsers = (user) => {
  return hasAnyRole(user, USER_MANAGER_ROLES);
};

/**
 * Verifica se pode VER a tela de administração de clientes
 */
export const canViewClientsAdmin = (user) => {
  return hasAnyRole(user, CLIENT_CREATOR_ROLES);
};

/**
 * Verifica se pode TROCAR de cliente (todos podem, se tiverem acesso)
 */
export const canSwitchClient = (user) => {
  // Todos os usuários autenticados podem trocar
  // A restrição é feita pelos clientes vinculados
  return !!user;
};

// ============================================
// HELPER PARA COMPONENTES REACT
// ============================================

/**
 * HOC para verificação de permissão em componentes
 * Uso: { canCreateClient(user) && <BotaoNovo /> }
 */
export const checkPermission = (user, permission) => {
  const permissions = {
    'create:client': canCreateClient,
    'edit:client': canEditClient,
    'edit:content': canEditContent,
    'manage:users': canManageUsers,
    'view:clients-admin': canViewClientsAdmin,
    'switch:client': canSwitchClient,
  };
  
  const checker = permissions[permission];
  if (!checker) {
    console.warn(`Permissão desconhecida: ${permission}`);
    return false;
  }
  
  return checker(user);
};

// ============================================
// EXPORTAÇÃO PARA USO EM ROTAS
// ============================================

export const routePermissions = {
  '/clients': canViewClientsAdmin,
  '/clients/new': canCreateClient,
  '/users': canManageUsers,
  '/posts': canEditContent,
  '/posts/new': canEditContent,
  '/media': canEditContent,
};

/**
 * Verifica se o usuário pode acessar uma rota
 * @param {Object} user - Objeto do usuário
 * @param {string} path - Caminho da rota
 * @returns {boolean}
 */
export const canAccessRoute = (user, path) => {
  const checker = routePermissions[path];
  
  // Se não há verificação específica, permite acesso
  if (!checker) return true;
  
  return checker(user);
};
