import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Listar todos os usuários (apenas admin)
router.get('/', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const [users, total] = await Promise.all([
      req.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNumber
      }),
      req.prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar usuário por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar permissões: admin pode ver qualquer usuário, outros só a si mesmos
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const user = await req.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar usuário (apenas admin)
router.put('/:id', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, isActive } = req.body;

    // Verificar se usuário existe
    const existingUser = await req.prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Impedir que admin desative a si mesmo
    if (req.user.id === id && isActive === false) {
      return res.status(400).json({ 
        error: 'Você não pode desativar sua própria conta' 
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await req.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar usuário (apenas admin)
router.delete('/:id', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Impedir que admin delete a si mesmo
    if (req.user.id === id) {
      return res.status(400).json({ 
        error: 'Você não pode deletar sua própria conta' 
      });
    }

    // Verificar se usuário existe
    const existingUser = await req.prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Deletar usuário (cascade vai deletar posts, comentários, etc.)
    await req.prisma.user.delete({
      where: { id }
    });

    res.json({
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de usuários (apenas admin)
router.get('/stats/overview', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      editorUsers,
      readerUsers
    ] = await Promise.all([
      req.prisma.user.count(),
      req.prisma.user.count({ where: { isActive: true } }),
      req.prisma.user.count({ where: { isActive: false } }),
      req.prisma.user.count({ where: { role: 'ADMIN' } }),
      req.prisma.user.count({ where: { role: 'EDITOR' } }),
      req.prisma.user.count({ where: { role: 'READER' } })
    ]);

    res.json({
      total: totalUsers,
      byStatus: {
        active: activeUsers,
        inactive: inactiveUsers
      },
      byRole: {
        admin: adminUsers,
        editor: editorUsers,
        reader: readerUsers
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
