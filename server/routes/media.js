import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar Multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens e vídeos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens e vídeos são permitidos'), false);
    }
  },
});

// Upload de arquivo único
router.post('/upload', authMiddleware, requireRole(['ADMIN', 'EDITOR']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { buffer, originalname, mimetype, size } = req.file;

    // Determinar tipo de resource para Cloudinary
    const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';

    // Upload para Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `calendario-postagens/${req.user.id}`,
          public_id: `${Date.now()}_${originalname.split('.')[0]}`,
          transformation: resourceType === 'image' ? [
            { width: 1080, height: 1080, crop: 'limit', quality: 'auto' }
          ] : []
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const result = await uploadPromise;

    // Salvar informações no banco
    const mediaFile = await req.prisma.mediaFile.create({
      data: {
        filename: result.public_id,
        originalName: originalname,
        cloudinaryUrl: result.secure_url,
        publicId: result.public_id,
        mimetype,
        size,
        width: result.width,
        height: result.height
      }
    });

    res.json({
      message: 'Arquivo enviado com sucesso',
      file: {
        id: mediaFile.id,
        url: mediaFile.cloudinaryUrl,
        originalName: mediaFile.originalName,
        size: mediaFile.size,
        width: mediaFile.width,
        height: mediaFile.height,
        mimetype: mediaFile.mimetype
      }
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    
    if (error.message === 'Apenas imagens e vídeos são permitidos') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload de múltiplos arquivos
router.post('/upload-multiple', authMiddleware, requireRole(['ADMIN', 'EDITOR']), upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const { buffer, originalname, mimetype, size } = file;
      const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';

      // Upload para Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            folder: `calendario-postagens/${req.user.id}`,
            public_id: `${Date.now()}_${originalname.split('.')[0]}`,
            transformation: resourceType === 'image' ? [
              { width: 1080, height: 1080, crop: 'limit', quality: 'auto' }
            ] : []
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      const result = await uploadPromise;

      // Salvar no banco
      const mediaFile = await req.prisma.mediaFile.create({
        data: {
          filename: result.public_id,
          originalName: originalname,
          cloudinaryUrl: result.secure_url,
          publicId: result.public_id,
          mimetype,
          size,
          width: result.width,
          height: result.height
        }
      });

      return {
        id: mediaFile.id,
        url: mediaFile.cloudinaryUrl,
        originalName: mediaFile.originalName,
        size: mediaFile.size,
        width: mediaFile.width,
        height: mediaFile.height,
        mimetype: mediaFile.mimetype
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Erro no upload múltiplo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar arquivos do usuário
router.get('/files', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const where = {};
    
    if (type === 'image') {
      where.mimetype = { startsWith: 'image/' };
    } else if (type === 'video') {
      where.mimetype = { startsWith: 'video/' };
    }

    const [files, total] = await Promise.all([
      req.prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limitNumber,
        select: {
          id: true,
          originalName: true,
          cloudinaryUrl: true,
          mimetype: true,
          size: true,
          width: true,
          height: true,
          createdAt: true
        }
      }),
      req.prisma.mediaFile.count({ where })
    ]);

    res.json({
      files,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar arquivo
router.delete('/files/:id', authMiddleware, requireRole(['ADMIN', 'EDITOR']), async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar arquivo
    const file = await req.prisma.mediaFile.findUnique({
      where: { id }
    });

    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    // Deletar do Cloudinary
    try {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image'
      });
    } catch (cloudinaryError) {
      console.error('Erro ao deletar do Cloudinary:', cloudinaryError);
      // Continua com a deleção do banco mesmo se falhar no Cloudinary
    }

    // Deletar do banco
    await req.prisma.mediaFile.delete({
      where: { id }
    });

    res.json({
      message: 'Arquivo deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter estatísticas de mídia
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [
      totalFiles,
      totalImages,
      totalVideos,
      totalSize
    ] = await Promise.all([
      req.prisma.mediaFile.count(),
      req.prisma.mediaFile.count({
        where: { mimetype: { startsWith: 'image/' } }
      }),
      req.prisma.mediaFile.count({
        where: { mimetype: { startsWith: 'video/' } }
      }),
      req.prisma.mediaFile.aggregate({
        _sum: { size: true }
      })
    ]);

    res.json({
      totalFiles,
      totalImages,
      totalVideos,
      totalSize: totalSize._sum.size || 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
