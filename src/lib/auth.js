const USERS_KEY = 'calendar_users';
const CURRENT_USER_KEY = 'current_user';

const DEFAULT_USERS = [
  {
    id: 'admin_demo',
    email: 'admin@demo.com',
    password: 'admin123',
    name: 'Administrador Demo',
    role: 'editor',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reader_demo',
    email: 'leitor@demo.com',
    password: 'leitor123',
    name: 'Leitor Demo',
    role: 'reader',
    createdAt: new Date().toISOString()
  }
];

const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(existingUsers);
};

export const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : initializeUsers();
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    return initializeUsers();
  }
};

export const saveUser = (userData) => {
  try {
    const users = getUsers();
    const newUser = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    throw new Error('Falha ao criar usuário');
  }
};

export const authenticateUser = (email, password) => {
  try {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const userSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        loginAt: new Date().toISOString()
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
      return userSession;
    }
    
    return null;
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
};

export const registerUser = (userData) => {
  try {
    const users = getUsers();
    
    const emailExists = users.find(u => u.email === userData.email);
    if (emailExists) {
      throw new Error('Este email já está em uso');
    }
    
    if (userData.role === 'editor') {
      const editorExists = users.find(u => u.role === 'editor');
      if (editorExists) {
        throw new Error('Apenas um usuário Editor pode existir no sistema');
      }
    }
    
    if (!userData.name || !userData.email || !userData.password) {
      throw new Error('Todos os campos são obrigatórios');
    }
    
    if (userData.password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }
    
    const newUser = saveUser(userData);
    
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
    
    return userSession;
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Erro ao carregar usuário atual:', error);
    return null;
  }
};

export const logoutUser = () => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  } catch (error) {
    console.error('Erro no logout:', error);
    return false;
  }
};

export const updateUserProfile = (userId, updateData) => {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado');
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedSession = {
        ...currentUser,
        ...updateData
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedSession));
      return updatedSession;
    }
    
    return users[userIndex];
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

export const deleteUser = (userId) => {
  try {
    const users = getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      logoutUser();
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
};

export const getUserStats = () => {
  try {
    const users = getUsers();
    return {
      total: users.length,
      editors: users.filter(u => u.role === 'editor').length,
      readers: users.filter(u => u.role === 'reader').length
    };
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    return { total: 0, editors: 0, readers: 0 };
  }
};