// API com Supabase
import { supabase, storage, db } from './supabase';

// ========== HELPERS ==========

export const handleApiError = (error) => {
  console.error('API Error:', error);
  return {
    message: error.message || 'Ocorreu um erro inesperado',
    status: error.status || 500,
  };
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ========== AUTH API ==========

export const authAPI = {
  login: async (email, password) => {
    try {
      // Buscar usuário no banco
      const user = await db.users.getByEmail(email);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      if (user.password !== password) {
        throw new Error('Senha incorreta');
      }
      
      // Criar token simples
      const token = 'token_' + Date.now();
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.toUpperCase() || 'READER', // Garantir role em maiúsculo
        avatar: user.avatar,
      }));
      
      return { 
        user: {
          ...user,
          role: user.role?.toUpperCase() || 'READER'
        }, 
        token 
      };
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const user = await db.users.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'user'
      });
      
      const token = 'token_' + Date.now();
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      throw error;
    }
  },

  verifyToken: async () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return { user };
    }
    
    throw new Error('Token inválido');
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return { success: true };
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  updateProfile: async (profileData) => {
    const user = authAPI.getCurrentUser();
    if (!user) throw new Error('Usuário não encontrado');
    
    const updatedUser = await db.users.update(user.id, profileData);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    
    return { user: updatedUser };
  },

  changePassword: async (currentPassword, newPassword) => {
    const user = authAPI.getCurrentUser();
    if (!user) throw new Error('Usuário não encontrado');
    
    await db.users.update(user.id, { password: newPassword });
    return { success: true, message: 'Senha alterada com sucesso' };
  },
};

// ========== POSTS API ==========

export const postsAPI = {
  getPosts: async (params = {}) => {
    try {
      let posts = await db.posts.getAll();
      
      // Converter campos do banco para o formato do app
      posts = posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        status: post.status,
        scheduledDate: post.scheduled_date,
        scheduledTime: post.scheduled_time,
        mediaUrl: post.media_url,
        mediaPath: post.media_path,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
      }));
      
      // Filtrar por status
      if (params.status) {
        posts = posts.filter((p) => p.status === params.status);
      }
      
      // Filtrar por data
      if (params.startDate && params.endDate) {
        posts = posts.filter((p) => {
          if (!p.scheduledDate) return false;
          const date = new Date(p.scheduledDate);
          return date >= new Date(params.startDate) && date <= new Date(params.endDate);
        });
      }
      
      return { posts, total: posts.length };
    } catch (error) {
      throw error;
    }
  },

  getPost: async (id) => {
    try {
      const post = await db.posts.getById(id);
      
      return { 
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          status: post.status,
          scheduledDate: post.scheduled_date,
          scheduledTime: post.scheduled_time,
          mediaUrl: post.media_url,
          mediaPath: post.media_path,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
        }
      };
    } catch (error) {
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      const post = await db.posts.create({
        title: postData.title,
        content: postData.content,
        status: postData.status || 'DRAFT',
        scheduledDate: postData.scheduledDate,
        scheduledTime: postData.scheduledTime,
        mediaUrl: postData.mediaUrl,
        mediaPath: postData.mediaPath,
      });
      
      return { 
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          status: post.status,
          scheduledDate: post.scheduled_date,
          scheduledTime: post.scheduled_time,
          mediaUrl: post.media_url,
          mediaPath: post.media_path,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
        }
      };
    } catch (error) {
      throw error;
    }
  },

  updatePost: async (id, postData) => {
    try {
      const post = await db.posts.update(id, {
        title: postData.title,
        content: postData.content,
        status: postData.status,
        scheduledDate: postData.scheduledDate,
        scheduledTime: postData.scheduledTime,
        mediaUrl: postData.mediaUrl,
        mediaPath: postData.mediaPath,
      });
      
      return { 
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          status: post.status,
          scheduledDate: post.scheduled_date,
          scheduledTime: post.scheduled_time,
          mediaUrl: post.media_url,
          mediaPath: post.media_path,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
        }
      };
    } catch (error) {
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      await db.posts.delete(id);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const posts = await db.posts.getAll();
      
      return {
        total: posts.length,
        draft: posts.filter((p) => p.status === 'DRAFT').length,
        scheduled: posts.filter((p) => p.status === 'SCHEDULED').length,
        published: posts.filter((p) => p.status === 'PUBLISHED').length,
      };
    } catch (error) {
      throw error;
    }
  },
};

// ========== MEDIA API ==========

export const mediaAPI = {
  uploadFile: async (file, onProgress) => {
    try {
      // Simular progresso
      if (onProgress) {
        for (let i = 0; i <= 50; i += 10) {
          await new Promise(r => setTimeout(r, 50));
          onProgress(i);
        }
      }
      
      // Upload para o Supabase Storage
      const fileData = await storage.uploadFile(file);
      
      if (onProgress) onProgress(80);
      
      // Salvar referência no banco
      const media = await db.media.create(fileData);
      
      if (onProgress) onProgress(100);
      
      return { 
        file: {
          id: media.id,
          filename: media.filename,
          originalName: media.original_name,
          mimeType: media.mime_type,
          size: media.size,
          url: media.url,
          path: media.path,
          createdAt: media.created_at,
        }
      };
    } catch (error) {
      throw error;
    }
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
    try {
      let files = await db.media.getAll();
      
      // Converter formato
      files = files.map(f => ({
        id: f.id,
        filename: f.filename,
        originalName: f.original_name,
        mimeType: f.mime_type,
        size: f.size,
        url: f.url,
        path: f.path,
        createdAt: f.created_at,
      }));
      
      // Filtrar por tipo
      if (params.type) {
        files = files.filter((f) => f.mimeType?.startsWith(params.type));
      }
      
      return { files, total: files.length };
    } catch (error) {
      throw error;
    }
  },

  deleteFile: async (id) => {
    try {
      // Buscar arquivo para pegar o path
      const files = await db.media.getAll();
      const file = files.find(f => f.id === id);
      
      if (file) {
        await db.media.delete(id, file.path);
      }
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      const files = await db.media.getAll();
      
      const images = files.filter(f => f.mime_type?.startsWith('image/'));
      const videos = files.filter(f => f.mime_type?.startsWith('video/'));
      
      return {
        total: files.length,
        images: images.length,
        videos: videos.length,
        totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
      };
    } catch (error) {
      throw error;
    }
  },
};

// ========== USERS API ==========

export const usersAPI = {
  getUsers: async () => {
    try {
      const users = await db.users.getAll();
      return { users };
    } catch (error) {
      throw error;
    }
  },

  getUser: async (id) => {
    try {
      const user = await db.users.getById(id);
      return { user };
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const user = await db.users.create(userData);
      return { user };
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const user = await db.users.update(id, userData);
      return { user };
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await db.users.delete(id);
      return { success: true };
    } catch (error) {
      throw error;
    }
  },
};

export default {
  auth: authAPI,
  posts: postsAPI,
  media: mediaAPI,
  users: usersAPI,
};
