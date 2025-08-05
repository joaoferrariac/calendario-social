import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import InstagramService from '../services/instagramService.js';
import Post from '../models/Post.js';

const router = express.Router();
const instagramService = new InstagramService();

// Publicar post no Instagram
router.post('/publish/:postId', authMiddleware, requireRole(['ADMIN', 'EDITOR']), async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Buscar o post no banco
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post não encontrado'
      });
    }

    // Verificar se as credenciais do Instagram estão configuradas
    if (!instagramService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Credenciais do Instagram não configuradas. Configure INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_BUSINESS_ACCOUNT_ID no .env'
      });
    }

    // Verificar se o post tem mídia
    if (!post.mediaUrls || post.mediaUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post deve ter pelo menos uma imagem para ser publicado no Instagram'
      });
    }

    // Preparar legenda
    const caption = `${post.title}\n\n${post.content}${post.hashtags?.length ? '\n\n' + post.hashtags.map(tag => `#${tag}`).join(' ') : ''}`;

    let result;

    // Publicar uma imagem ou carrossel
    if (post.mediaUrls.length === 1) {
      result = await instagramService.publishImage(post.mediaUrls[0], caption);
    } else {
      result = await instagramService.publishCarousel(post.mediaUrls, caption);
    }

    if (result.success) {
      // Atualizar o post no banco com o ID do Instagram
      await Post.findByIdAndUpdate(postId, {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        instagramPostId: result.postId,
        publishedData: {
          platform: 'INSTAGRAM',
          publishedAt: new Date(),
          externalId: result.postId
        }
      });

      res.json({
        success: true,
        message: result.message,
        instagramPostId: result.postId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }

  } catch (error) {
    console.error('Erro ao publicar no Instagram:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Verificar status da configuração do Instagram
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const configured = instagramService.isConfigured();
    
    if (configured) {
      const accountInfo = await instagramService.getAccountInfo();
      res.json({
        configured: true,
        accountInfo: accountInfo.success ? accountInfo.data : null
      });
    } else {
      res.json({
        configured: false,
        message: 'Configure INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_BUSINESS_ACCOUNT_ID no arquivo .env'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do Instagram',
      error: error.message
    });
  }
});

// Testar conexão com Instagram
router.post('/test', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const accountInfo = await instagramService.getAccountInfo();
    
    if (accountInfo.success) {
      res.json({
        success: true,
        message: 'Conexão com Instagram funcionando',
        accountInfo: accountInfo.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erro na conexão com Instagram',
        error: accountInfo.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao testar conexão',
      error: error.message
    });
  }
});

export default router;
