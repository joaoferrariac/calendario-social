import express from 'express';
import InstagramOAuthService from '../services/InstagramOAuthService.js';
import InstagramSyncService from '../services/InstagramSyncService.js';
import InstagramConnection from '../models/InstagramConnection.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Iniciar processo de autenticação
router.get('/auth', authMiddleware, async (req, res) => {
  try {
    const authUrl = InstagramOAuthService.getAuthUrl();
    
    res.json({
      success: true,
      authUrl,
      message: 'Redirecione o usuário para esta URL'
    });
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Callback após autenticação
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      return res.redirect(`http://localhost:5173/instagram-error?error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code) {
      return res.redirect('http://localhost:5173/instagram-error?error=Código de autorização não fornecido');
    }

    // Trocar código por token
    const tokenData = await InstagramOAuthService.exchangeCodeForToken(code);
    
    // Buscar informações do perfil
    const profileInfo = await InstagramSyncService.fetchProfileInfo(tokenData.access_token);

    // Aqui você precisa identificar o usuário atual
    // Por enquanto, vou usar um usuário padrão, mas você deve implementar
    // um sistema para associar a sessão/estado ao usuário correto
    const userId = req.query.userId || '000000000000000000000001'; // ID do usuário admin

    // Salvar ou atualizar conexão
    const connectionData = {
      userId,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      instagramUserId: profileInfo.id,
      username: profileInfo.username,
      accountType: profileInfo.account_type,
      mediaCount: profileInfo.media_count || 0,
      followersCount: profileInfo.followers_count || 0,
      followsCount: profileInfo.follows_count || 0,
      isActive: true
    };

    await InstagramConnection.findOneAndUpdate(
      { userId },
      connectionData,
      { upsert: true, new: true }
    );

    // Sincronizar dados iniciais
    await InstagramSyncService.syncUserData(userId, tokenData.access_token);

    // Redirecionar para página de sucesso
    res.redirect('http://localhost:5173/instagram-success');
  } catch (error) {
    console.error('Erro no callback:', error);
    res.redirect(`http://localhost:5173/instagram-error?error=${encodeURIComponent(error.message)}`);
  }
});

// Obter status da conexão
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const connection = await InstagramConnection.findOne({ 
      userId: req.user.id,
      isActive: true 
    });

    if (!connection) {
      return res.json({
        connected: false,
        message: 'Instagram não conectado'
      });
    }

    // Verificar se o token ainda é válido
    if (!connection.isTokenValid()) {
      connection.isActive = false;
      await connection.save();
      
      return res.json({
        connected: false,
        message: 'Token expirado - reconecte sua conta'
      });
    }

    res.json({
      connected: true,
      profile: {
        username: connection.username,
        accountType: connection.accountType,
        followersCount: connection.followersCount,
        followsCount: connection.followsCount,
        mediaCount: connection.mediaCount,
        profilePictureUrl: connection.profilePictureUrl,
        lastSyncAt: connection.lastSyncAt
      },
      insights: connection.syncData.insights,
      recentPosts: connection.syncData.posts.slice(0, 5), // Últimos 5 posts
      tokenExpiresAt: connection.expiresAt,
      needsRefresh: connection.needsRefresh()
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Forçar sincronização
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const connection = await InstagramConnection.findOne({ 
      userId: req.user.id,
      isActive: true 
    });

    if (!connection || !connection.isTokenValid()) {
      return res.status(400).json({
        success: false,
        message: 'Conta do Instagram não conectada ou token expirado'
      });
    }

    const result = await InstagramSyncService.syncUserData(req.user.id, connection.accessToken);
    
    res.json({
      success: true,
      message: 'Sincronização concluída com sucesso',
      result
    });
  } catch (error) {
    console.error('Erro na sincronização forçada:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Desconectar Instagram
router.delete('/disconnect', authMiddleware, async (req, res) => {
  try {
    await InstagramConnection.findOneAndUpdate(
      { userId: req.user.id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Instagram desconectado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
