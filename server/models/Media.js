import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'],
    required: true
  },
  dimensions: {
    width: { type: Number },
    height: { type: Number }
  },
  duration: {
    type: Number // Para vídeos e áudios (em segundos)
  },
  thumbnail: {
    type: String // URL da thumbnail para vídeos
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  alt: {
    type: String,
    trim: true
  },
  folder: {
    type: String,
    default: 'general'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para melhor performance
mediaSchema.index({ uploadedBy: 1, createdAt: -1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ folder: 1 });
mediaSchema.index({ mimetype: 1 });

// Método para obter URL completa se necessário
mediaSchema.methods.getFullUrl = function() {
  if (this.url.startsWith('http')) {
    return this.url;
  }
  return `${process.env.BASE_URL || 'http://localhost:3001'}${this.url}`;
};

export default mongoose.model('Media', mediaSchema);
