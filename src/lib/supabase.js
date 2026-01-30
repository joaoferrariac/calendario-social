import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// Substitua pelos valores do seu projeto em Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========== STORAGE HELPERS ==========

export const storage = {
  // Upload de arquivo
  uploadFile: async (file, folder = 'uploads') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: publicUrl,
      fileName: file.name,
      size: file.size,
      mimeType: file.type
    };
  },

  // Deletar arquivo
  deleteFile: async (filePath) => {
    const { error } = await supabase.storage
      .from('media')
      .remove([filePath]);

    if (error) throw error;
    return true;
  },

  // Listar arquivos
  listFiles: async (folder = 'uploads') => {
    const { data, error } = await supabase.storage
      .from('media')
      .list(folder, {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;
    return data;
  }
};

// ========== DATABASE HELPERS ==========

export const db = {
  // === POSTS ===
  posts: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    create: async (post) => {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title: post.title,
          content: post.content,
          status: post.status || 'DRAFT',
          scheduled_date: post.scheduledDate,
          scheduled_time: post.scheduledTime,
          media_url: post.mediaUrl,
          media_path: post.mediaPath
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id, post) => {
      const { data, error } = await supabase
        .from('posts')
        .update({
          title: post.title,
          content: post.content,
          status: post.status,
          scheduled_date: post.scheduledDate,
          scheduled_time: post.scheduledTime,
          media_url: post.mediaUrl,
          media_path: post.mediaPath,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
  },

  // === MEDIA ===
  media: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    create: async (fileData) => {
      const { data, error } = await supabase
        .from('media')
        .insert([{
          filename: fileData.fileName,
          original_name: fileData.fileName,
          mime_type: fileData.mimeType,
          size: fileData.size,
          url: fileData.url,
          path: fileData.path
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (id, path) => {
      // Deletar do storage primeiro
      if (path) {
        await storage.deleteFile(path);
      }
      
      // Depois deletar do banco
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
  },

  // === USERS ===
  users: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    getByEmail: async (email) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    create: async (user) => {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id, user) => {
      const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
  }
};

export default supabase;
