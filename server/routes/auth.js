import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import validator from 'validator';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Schemas de validação
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['ADMIN', 'EDITOR', 'READER']).optional().default('READER')
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// Gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Registro
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Verificar se email já existe
    const existingUser = await req.prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Este email já está em uso'
      });
    }

    // Sanitizar email
    const sanitizedEmail = validator.normalizeEmail(validatedData.email);
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Criar usuário
    const user = await req.prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        name: validatedData.name.trim(),
        role: validatedData.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${validatedData.name}`
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    // Gerar token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Conta criada com sucesso',
      user,
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    
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

// Login
router.post('/login', async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    // Buscar usuário
    const user = await req.prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(validatedData.password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    // Dados do usuário (sem senha)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    // Gerar token
    const token = generateToken(userData);

    res.json({
      message: 'Login realizado com sucesso',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    
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

// Verificar token
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
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

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Usuário não encontrado ou desativado'
      });
    }

    res.json({
      message: 'Token válido',
      user
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar perfil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      avatar: z.string().url().optional()
    });

    const validatedData = updateSchema.parse(req.body);

    const updatedUser = await req.prisma.user.update({
      where: { id: req.user.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro na atualização:', error);
    
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

// Alterar senha
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const passwordSchema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6)
    });

    const { currentPassword, newPassword } = passwordSchema.parse(req.body);

    // Buscar usuário com senha
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verificar senha atual
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!validPassword) {
      return res.status(400).json({
        error: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await req.prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro na alteração de senha:', error);
    
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

export default router;
