import express from 'express';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// Schema de validação
const createPostSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().optional(),
  scheduledAt: z.string().datetime('Data inválida').optional(),
  platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN']).default('INSTAGRAM'),
  postType: z.enum(['FEED', 'STORY', 'REELS', 'CAROUSEL', 'IGTV']).default('FEED'),
  hashtags: z.array(z.string()).optional().default([]),
  mentions: z.array(z.string()).optional().default([]),
  mediaUrls: z.array(z.string()).optional().default([])
});

const updatePostSchema = createPostSchema.partial().extend({
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional()
});

// Listar posts com filtros
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      platform,
      postType,
      author,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construir filtros
    const filter = {};

    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    if (postType) filter.postType = postType;
    if (author) filter.author = author;

    // Filtro de data
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Busca textual
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Se não for admin, só ver próprios posts
    if (req.user.role !== 'ADMIN') {
      filter.author = req.user.id;
    }

    // Ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(filter)
    ]);

    res.json({
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar posts:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar post por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({
        error: 'Post não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'ADMIN' && post.author._id.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    res.json(post);

  } catch (error) {
    console.error('Erro ao buscar post:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar post
router.post('/', authMiddleware, requireRole(['ADMIN', 'EDITOR']), async (req, res) => {
  try {
    const postData = createPostSchema.parse(req.body);

    const post = new Post({
      ...postData,
      author: req.user.id,
      scheduledAt: postData.scheduledAt ? new Date(postData.scheduledAt) : null
    });

    await post.save();
    await post.populate('author', 'name email');

    res.status(201).json({
      message: 'Post criado com sucesso',
      post
    });

  } catch (error) {
    console.error('Erro ao criar post:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar post
router.put('/:id', authMiddleware, requireRole(['ADMIN', 'EDITOR']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = updatePostSchema.parse(req.body);

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        error: 'Post não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'ADMIN' && post.author.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Atualizar dados
    Object.assign(post, updateData);
    
    if (updateData.scheduledAt) {
      post.scheduledAt = new Date(updateData.scheduledAt);
    }

    await post.save();
    await post.populate('author', 'name email');

    res.json({
      message: 'Post atualizado com sucesso',
      post
    });

  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors
      });
    }

    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar post
router.delete('/:id', authMiddleware, requireRole(['ADMIN', 'EDITOR']), async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        error: 'Post não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'ADMIN' && post.author.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    await Post.findByIdAndDelete(id);

    res.json({
      message: 'Post deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar post:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Duplicar post
router.post('/:id/duplicate', authMiddleware, requireRole(['ADMIN', 'EDITOR']), async (req, res) => {
  try {
    const { id } = req.params;

    const originalPost = await Post.findById(id);

    if (!originalPost) {
      return res.status(404).json({
        error: 'Post não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'ADMIN' && originalPost.author.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Criar cópia
    const duplicatedPost = new Post({
      title: `${originalPost.title} (Cópia)`,
      content: originalPost.content,
      platform: originalPost.platform,
      postType: originalPost.postType,
      mediaUrls: originalPost.mediaUrls,
      hashtags: originalPost.hashtags,
      mentions: originalPost.mentions,
      author: req.user.id,
      status: 'DRAFT'
    });

    await duplicatedPost.save();
    await duplicatedPost.populate('author', 'name email');

    res.status(201).json({
      message: 'Post duplicado com sucesso',
      post: duplicatedPost
    });

  } catch (error) {
    console.error('Erro ao duplicar post:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Estatísticas de posts
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const filter = req.user.role !== 'ADMIN' ? { author: req.user.id } : {};

    const stats = await Post.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          likes: { $sum: '$likes' },
          comments: { $sum: '$comments' },
          shares: { $sum: '$shares' }
        }
      }
    ]);

    const platformStats = await Post.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          engagement: { $sum: { $add: ['$likes', '$comments', '$shares'] } }
        }
      }
    ]);

    const totalPosts = await Post.countDocuments(filter);

    res.json({
      totalPosts,
      byStatus: stats,
      byPlatform: platformStats
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
