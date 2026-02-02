import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// Substitua pelos valores do seu projeto em Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========== STORAGE HELPERS ==========

export const storage = {
  /**
   * Upload de arquivo
   * @param {File} file - Arquivo para upload
   * @param {string} folder - Pasta base (default: 'uploads')
   * @param {string} clientId - ID do cliente para organização (opcional)
   */
  uploadFile: async (file, folder = 'uploads', clientId = null) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Organizar por cliente se informado: uploads/client-id/arquivo.jpg
    const basePath = clientId ? `${folder}/${clientId}` : folder;
    const filePath = `${basePath}/${fileName}`;

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

  /**
   * Listar arquivos de uma pasta
   * @param {string} folder - Pasta base
   * @param {string} clientId - ID do cliente (opcional)
   */
  listFiles: async (folder = 'uploads', clientId = null) => {
    const targetFolder = clientId ? `${folder}/${clientId}` : folder;
    
    const { data, error } = await supabase.storage
      .from('media')
      .list(targetFolder, {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;
    return data;
  }
};

// ========== DATABASE HELPERS ==========

// ID do cliente padrão (fallback para compatibilidade)
const DEFAULT_CLIENT_ID = '00000000-0000-0000-0000-000000000001';

export const db = {
  // === POSTS ===
  posts: {
    /**
     * Buscar todos os posts de um cliente
     * @param {string} clientId - ID do cliente (opcional, usa default se não informado)
     */
    getAll: async (clientId = null) => {
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filtrar por client_id se informado
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query;
      
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

    /**
     * Criar um novo post
     * @param {Object} post - Dados do post
     * @param {string} clientId - ID do cliente (obrigatório para novos posts)
     */
    create: async (post, clientId = DEFAULT_CLIENT_ID) => {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title: post.title,
          content: post.content,
          status: post.status || 'DRAFT',
          scheduled_date: post.scheduledDate,
          scheduled_time: post.scheduledTime,
          media_url: post.mediaUrl,
          media_path: post.mediaPath,
          client_id: clientId  // ← Novo campo
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
          // Nota: client_id NÃO é alterado no update (post não muda de cliente)
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
    /**
     * Buscar todos os arquivos de mídia de um cliente
     * @param {string} clientId - ID do cliente (opcional)
     */
    getAll: async (clientId = null) => {
      let query = supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filtrar por client_id se informado
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },

    /**
     * Criar registro de mídia
     * @param {Object} fileData - Dados do arquivo
     * @param {string} clientId - ID do cliente
     */
    create: async (fileData, clientId = null) => {
      const { data, error } = await supabase
        .from('media')
        .insert([{
          filename: fileData.fileName,
          original_name: fileData.fileName,
          mime_type: fileData.mimeType,
          size: fileData.size,
          url: fileData.url,
          path: fileData.path,
          client_id: clientId  // ← Novo campo
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
    /**
     * Listar todos os usuários
     */
    list: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      return { data, error };
    },

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

    /**
     * Criar novo usuário via Supabase Auth
     * IMPORTANTE: Só pode ser chamado por DESIGNER/ADMIN/MASTER
     * @param {Object} userData - { name, email, password, role }
     */
    create: async (userData) => {
      try {
        // 1. Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: userData.role || 'READER'
            },
            // Não fazer login automático (admin criando usuário)
            emailRedirectTo: undefined
          }
        });
        
        if (authError) {
          if (authError.message?.includes('already registered')) {
            return { data: null, error: 'Este email já está cadastrado' };
          }
          return { data: null, error: authError.message };
        }

        if (!authData.user) {
          return { data: null, error: 'Erro ao criar usuário' };
        }

        // 2. A trigger handle_new_user criará o registro na tabela users
        // Mas vamos garantir que existe e atualizar o role
        
        // Aguardar um pouco para a trigger executar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Buscar ou criar o registro na tabela users
        let { data: userData2, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        // Se não existir, criar manualmente
        if (userError && userError.code === 'PGRST116') {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              email: userData.email,
              name: userData.name,
              role: userData.role || 'READER'
            }])
            .select()
            .single();
          
          if (insertError) {
            console.error('Erro ao criar registro de usuário:', insertError);
          }
          userData2 = newUser;
        }

        return { 
          data: userData2 || authData.user, 
          error: null,
          message: 'Usuário criado! Um email de confirmação foi enviado.'
        };
      } catch (err) {
        console.error('Erro ao criar usuário:', err);
        return { data: null, error: err.message };
      }
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
  },

  // === USER_CLIENTS (Vínculo usuário-cliente) ===
  userClients: {
    /**
     * Criar vínculo entre usuário e cliente
     */
    create: async (data) => {
      const { data: result, error } = await supabase
        .from('user_clients')
        .insert([{
          user_id: data.user_id,
          client_id: data.client_id,
          role: data.role || 'READER',
          is_default: data.is_default || false
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },

    /**
     * Buscar clientes de um usuário
     */
    getByUser: async (userId) => {
      const { data, error } = await supabase
        .from('user_clients')
        .select(`
          *,
          clients (*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },

    /**
     * Remover vínculo
     */
    delete: async (userId, clientId) => {
      const { error } = await supabase
        .from('user_clients')
        .delete()
        .eq('user_id', userId)
        .eq('client_id', clientId);
      
      if (error) throw error;
      return true;
    }
  },

  // === CLIENTS (Multi-Tenant) ===
  clients: {
    /**
     * Buscar todos os clientes (apenas para ADMIN)
     */
    getAll: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    /**
     * Buscar cliente por ID
     */
    getById: async (id) => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    /**
     * Buscar cliente por slug
     */
    getBySlug: async (slug) => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },

    /**
     * Criar novo cliente
     * @param {Object} client - Dados do cliente
     * @param {string} userId - ID do usuário criador (será OWNER)
     */
    create: async (client, userId) => {
      // 1. Criar o cliente
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([{
          name: client.name,
          slug: client.slug,
          logo_url: client.logoUrl || null,
          primary_color: client.primaryColor || '#6366f1',
          secondary_color: client.secondaryColor || '#8b5cf6',
          tone_of_voice: client.toneOfVoice || null,
          plan: client.plan || 'free',
          is_active: true,
          created_by: userId
        }])
        .select()
        .single();
      
      if (clientError) throw clientError;

      // 2. Vincular o usuário criador como OWNER
      const { error: linkError } = await supabase
        .from('user_clients')
        .insert([{
          user_id: userId,
          client_id: newClient.id,
          role: 'OWNER',
          is_default: false  // Não alterar o default atual
        }]);
      
      if (linkError) throw linkError;

      return newClient;
    },

    /**
     * Atualizar cliente
     */
    update: async (id, client) => {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          slug: client.slug,
          logo_url: client.logoUrl,
          primary_color: client.primaryColor,
          secondary_color: client.secondaryColor,
          tone_of_voice: client.toneOfVoice,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    /**
     * Desativar cliente (soft delete)
     */
    delete: async (id) => {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
  }
};

export default supabase;
