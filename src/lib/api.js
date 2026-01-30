// API Mock - Dados armazenados localmente
// TODO: Substituir por chamadas reais ao backend quando implementado

const STORAGE_KEYS = {
  POSTS: 'calendar_posts',
  MEDIA: 'calendar_media',
  USER: 'calendar_user',
};

// Dados iniciais de demonstração
const getInitialPosts = () => [
  {
    id: '1',
    title: 'Post de Exemplo',
    content: 'Este é um post de demonstração do sistema.',
    scheduledDate: new Date().toISOString(),
    status: 'DRAFT',
    mediaUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getInitialMedia = () => [];

// Helpers para localStorage
const getFromStorage = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

// ========== AUTH API (Mock) ==========

export const authAPI = {
  login: async (email, password) => {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Login simples de demonstração
    if (email && password) {
      const user = {
        id: '1',
        name: 'Usuário Demo',
        email: email,
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
      };
      
      const token = 'demo_token_' + Date.now();
      localStorage.setItem('auth_token', token);
      saveToStorage(STORAGE_KEYS.USER, user);
      
      return { user, token };
    }
    
    throw new Error('Email ou senha inválidos');
  },

  register: async (userData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = {
      id: Date.now().toString(),
      name: userData.name || 'Novo Usuário',
      email: userData.email,
      role: 'VIEWER',
      createdAt: new Date().toISOString(),
    };
    
    const token = 'demo_token_' + Date.now();
    localStorage.setItem('auth_token', token);
    saveToStorage(STORAGE_KEYS.USER, user);
    
    return { user, token };
  },

  verifyToken: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const token = localStorage.getItem('auth_token');
    const user = getFromStorage(STORAGE_KEYS.USER, null);
    
    if (token && user) {
      return { user };
    }
    
    throw new Error('Token inválido');
  },

  updateProfile: async (profileData) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user = getFromStorage(STORAGE_KEYS.USER, null);
    if (!user) throw new Error('Usuário não encontrado');
    
    const updatedUser = { ...user, ...profileData, updatedAt: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.USER, updatedUser);
    
    return { user: updatedUser };
  },

  changePassword: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true, message: 'Senha alterada com sucesso' };
  },
};

// ========== POSTS API (Mock) ==========

export const postsAPI = {
  getPosts: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let posts = getFromStorage(STORAGE_KEYS.POSTS, getInitialPosts());
    
    // Filtrar por status
    if (params.status) {
      posts = posts.filter((p) => p.status === params.status);
    }
    
    // Filtrar por data
    if (params.startDate && params.endDate) {
      posts = posts.filter((p) => {
        const date = new Date(p.scheduledDate);
        return date >= new Date(params.startDate) && date <= new Date(params.endDate);
      });
    }
    
    // Ordenar por data
    posts.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
    
    return { posts, total: posts.length };
  },

  getPost: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const posts = getFromStorage(STORAGE_KEYS.POSTS, getInitialPosts());
    const post = posts.find((p) => p.id === id);
    
    if (!post) throw new Error('Post não encontrado');
    
    return { post };
  },

  createPost: async (postData) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const posts = getFromStorage(STORAGE_KEYS.POSTS, getInitialPosts());
    
    const newPost = {
      id: Date.now().toString(),
      ...postData,
      status: postData.status || 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    posts.push(newPost);
    saveToStorage(STORAGE_KEYS.POSTS, posts);
    
    return { post: newPost };
  },

  updatePost: async (id, postData) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const posts = getFromStorage(STORAGE_KEYS.POSTS, getInitialPosts());
    const index = posts.findIndex((p) => p.id === id);
    
    if (index === -1) throw new Error('Post não encontrado');
    
    posts[index] = {
      ...posts[index],
      ...postData,
      updatedAt: new Date().toISOString(),
    };
    
    saveToStorage(STORAGE_KEYS.POSTS, posts);
    
    return { post: posts[index] };
  },

  deletePost: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const posts = getFromStorage(STORAGE_KEYS.POSTS, getInitialPosts());
    const filtered = posts.filter((p) => p.id !== id);
    
    saveToStorage(STORAGE_KEYS.POSTS, filtered);
    
    return { success: true };
  },

  getStats: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const posts = getFromStorage(STORAGE_KEYS.POSTS, getInitialPosts());
    
    return {
      total: posts.length,
      draft: posts.filter((p) => p.status === 'DRAFT').length,
      scheduled: posts.filter((p) => p.status === 'SCHEDULED').length,
      published: posts.filter((p) => p.status === 'PUBLISHED').length,
    };
  },
};

// ========== MEDIA API (Mock) ==========

export const mediaAPI = {
  uploadFile: async (file, onProgress) => {
    // Simular progresso de upload
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (onProgress) onProgress(i);
    }

    const media = getFromStorage(STORAGE_KEYS.MEDIA, getInitialMedia());
    
    // Criar URL local para o arquivo
    const url = URL.createObjectURL(file);
    
    const newMedia = {
      id: Date.now().toString(),
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: url,
      createdAt: new Date().toISOString(),
    };
    
    media.push(newMedia);
    saveToStorage(STORAGE_KEYS.MEDIA, media);
    
    return { file: newMedia };
  },

  uploadMultipleFiles: async (files, onProgress) => {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await mediaAPI.uploadFile(files[i], (progress) => {
        if (onProgress) {
          const overallProgress = ((i + progress / 100) / files.length) * 100;
          onProgress(Math.round(overallProgress));
        }
      });
      results.push(result.file);
    }
    
    return { files: results };
  },

  getFiles: async (params = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    let media = getFromStorage(STORAGE_KEYS.MEDIA, getInitialMedia());
    
    // Filtrar por tipo
    if (params.type) {
      media = media.filter((m) => m.mimeType.startsWith(params.type));
    }
    
    return { files: media, total: media.length };
  },

  deleteFile: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const media = getFromStorage(STORAGE_KEYS.MEDIA, getInitialMedia());
    const filtered = media.filter((m) => m.id !== id);
    
    saveToStorage(STORAGE_KEYS.MEDIA, filtered);
    
    return { success: true };
  },

  getStats: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const media = getFromStorage(STORAGE_KEYS.MEDIA, getInitialMedia());
    
    return {
      total: media.length,
      images: media.filter((m) => m.mimeType.startsWith('image/')).length,
      videos: media.filter((m) => m.mimeType.startsWith('video/')).length,
      totalSize: media.reduce((acc, m) => acc + m.size, 0),
    };
  },
};

// ========== USERS API (Mock) ==========

export const usersAPI = {
  getUsers: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const currentUser = getFromStorage(STORAGE_KEYS.USER, null);
    const users = currentUser ? [currentUser] : [];
    
    return { users, total: users.length };
  },

  getUser: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const user = getFromStorage(STORAGE_KEYS.USER, null);
    
    if (!user || user.id !== id) throw new Error('Usuário não encontrado');
    
    return { user };
  },

  updateUser: async (id, userData) => {
    return authAPI.updateProfile(userData);
  },

  deleteUser: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: true };
  },

  getStats: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    return {
      total: 1,
      admins: 1,
      editors: 0,
      viewers: 0,
    };
  },
};

// ========== HELPER FUNCTIONS ==========

export const handleApiError = (error) => {
  return {
    message: error.message || 'Erro desconhecido',
    status: 0,
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Export default para compatibilidade
const api = {
  auth: authAPI,
  posts: postsAPI,
  media: mediaAPI,
  users: usersAPI,
};

export default api;
