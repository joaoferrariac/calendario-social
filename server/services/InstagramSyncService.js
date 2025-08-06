import InstagramConnection from '../models/InstagramConnection.js';

class InstagramSyncService {
  constructor() {
    this.baseUrl = 'https://graph.instagram.com';
  }

  // Obter informações do perfil
  async fetchProfileInfo(accessToken) {
    try {
      const response = await fetch(`${this.baseUrl}/me?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${accessToken}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar informações do perfil:', error);
      throw error;
    }
  }

  // Obter posts recentes
  async fetchRecentPosts(accessToken, limit = 25) {
    try {
      const response = await fetch(`${this.baseUrl}/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar posts recentes:', error);
      throw error;
    }
  }

  // Obter insights da conta
  async fetchAccountInsights(accessToken) {
    try {
      const metrics = 'impressions,reach,profile_views,website_clicks';
      const period = 'day';
      const since = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const until = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`${this.baseUrl}/me/insights?metric=${metrics}&period=${period}&since=${since}&until=${until}&access_token=${accessToken}`);
      
      if (!response.ok) {
        // Insights podem não estar disponíveis para contas pessoais
        console.warn('Insights não disponíveis para esta conta');
        return null;
      }
      
      const data = await response.json();
      return this.processInsights(data.data);
    } catch (error) {
      console.warn('Erro ao buscar insights (normal para contas pessoais):', error.message);
      return null;
    }
  }

  // Processar dados de insights
  processInsights(insightsData) {
    const insights = {
      impressions: 0,
      reach: 0,
      profileViews: 0,
      websiteClicks: 0,
      lastUpdated: new Date()
    };

    if (!insightsData || !Array.isArray(insightsData)) {
      return insights;
    }

    insightsData.forEach(metric => {
      if (metric.values && metric.values.length > 0) {
        const total = metric.values.reduce((sum, value) => sum + (value.value || 0), 0);
        insights[metric.name] = total;
      }
    });

    return insights;
  }

  // Sincronizar todos os dados
  async syncUserData(userId, accessToken) {
    try {
      console.log(`Iniciando sincronização para usuário ${userId}`);

      // Buscar dados do perfil
      const profileInfo = await this.fetchProfileInfo(accessToken);
      
      // Buscar posts recentes
      const recentPosts = await this.fetchRecentPosts(accessToken);
      
      // Buscar insights (se disponível)
      const insights = await this.fetchAccountInsights(accessToken);

      // Atualizar conexão no banco
      const connection = await InstagramConnection.findOne({ userId });
      if (connection) {
        connection.instagramUserId = profileInfo.id;
        connection.username = profileInfo.username;
        connection.accountType = profileInfo.account_type;
        connection.mediaCount = profileInfo.media_count || 0;
        connection.followersCount = profileInfo.followers_count || 0;
        connection.followsCount = profileInfo.follows_count || 0;
        connection.lastSyncAt = new Date();
        
        // Atualizar posts
        connection.syncData.posts = recentPosts.map(post => ({
          id: post.id,
          caption: post.caption || '',
          mediaType: post.media_type,
          mediaUrl: post.media_url,
          permalink: post.permalink,
          timestamp: new Date(post.timestamp),
          likesCount: post.like_count || 0,
          commentsCount: post.comments_count || 0
        }));

        // Atualizar insights se disponível
        if (insights) {
          connection.syncData.insights = insights;
        }

        await connection.save();
        
        console.log(`Sincronização concluída para usuário ${userId}: ${recentPosts.length} posts sincronizados`);
        
        return {
          success: true,
          profile: profileInfo,
          postsCount: recentPosts.length,
          hasInsights: !!insights
        };
      }

      throw new Error('Conexão não encontrada');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  }

  // Agendar sincronização automática
  async scheduleAutoSync() {
    const cron = await import('node-cron');
    
    // Sincronizar a cada 6 horas
    cron.schedule('0 */6 * * *', async () => {
      console.log('Iniciando sincronização automática...');
      
      try {
        const connections = await InstagramConnection.find({ 
          isActive: true,
          expiresAt: { $gt: new Date() }
        });

        for (const connection of connections) {
          try {
            await this.syncUserData(connection.userId, connection.accessToken);
          } catch (error) {
            console.error(`Erro na sincronização do usuário ${connection.userId}:`, error);
            
            // Se o token expirou, desativar a conexão
            if (error.message.includes('token') || error.message.includes('authorization')) {
              connection.isActive = false;
              await connection.save();
            }
          }
        }
        
        console.log(`Sincronização automática concluída para ${connections.length} conexões`);
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      }
    });
  }
}

export default new InstagramSyncService();
