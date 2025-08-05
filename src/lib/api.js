import axios from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ========== AUTH ENDPOINTS ==========

export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Atualizar perfil
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Alterar senha
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

// ========== POSTS ENDPOINTS ==========

export const postsAPI = {
  // Listar posts
  getPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // Buscar post por ID
  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Criar post
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Atualizar post
  updatePost: async (id, postData) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // Deletar post
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Curtir/descurtir post
  toggleLike: async (id) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  // Comentar no post
  addComment: async (id, content) => {
    const response = await api.post(`/posts/${id}/comments`, { content });
    return response.data;
  },

  // Estatísticas do dashboard
  getStats: async () => {
    const response = await api.get('/posts/stats/dashboard');
    return response.data;
  }
};

// ========== MEDIA ENDPOINTS ==========

export const mediaAPI = {
  // Upload de arquivo único
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Upload de múltiplos arquivos
  uploadMultipleFiles: async (files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post('/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Listar arquivos
  getFiles: async (params = {}) => {
    const response = await api.get('/media/files', { params });
    return response.data;
  },

  // Deletar arquivo
  deleteFile: async (id) => {
    const response = await api.delete(`/media/files/${id}`);
    return response.data;
  },

  // Estatísticas de mídia
  getStats: async () => {
    const response = await api.get('/media/stats');
    return response.data;
  }
};

// ========== USERS ENDPOINTS ==========

export const usersAPI = {
  // Listar usuários (apenas admin)
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Buscar usuário por ID
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Atualizar usuário (apenas admin)
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Deletar usuário (apenas admin)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Estatísticas de usuários (apenas admin)
  getStats: async () => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  }
};

// ========== HELPER FUNCTIONS ==========

export const handleApiError = (error) => {
  if (error.response) {
    // Erro da API com resposta
    return {
      message: error.response.data.error || 'Erro desconhecido',
      status: error.response.status,
      details: error.response.data.details
    };
  } else if (error.request) {
    // Erro de rede
    return {
      message: 'Erro de conexão com o servidor',
      status: 0
    };
  } else {
    // Outro tipo de erro
    return {
      message: error.message || 'Erro desconhecido',
      status: 0
    };
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default api;
