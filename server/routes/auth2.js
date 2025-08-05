import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import validator from 'validator';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

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
      id: user._id, 
      email: user.email, 
      role: user.role,
      name: user.name
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = registerSchema.parse(req.body);

    // Verificar se já existe um usuário com este email
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'Já existe um usuário com este email'
      });
    }

    // Criar novo usuário
    const user = new User({
      email,
      password, // O hash será feito automaticamente pelo middleware do modelo
      name,
      role
    });

    await user.save();

    // Gerar token
    const token = generateToken(user);

    // Retornar dados do usuário (sem senha)
    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userData,
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

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Email já está em uso'
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
    const { email, password } = loginSchema.parse(req.body);

    // Buscar usuário por email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = generateToken(user);

    // Retornar dados do usuário (sem senha)
    const userData = user.toJSON();
    delete userData.password;

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
    // O middleware já decodificou o token e adicionou req.user
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      valid: true,
      user
    });

  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Logout (opcional - pode ser feito apenas no frontend)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    message: 'Logout realizado com sucesso'
  });
});

export default router;
