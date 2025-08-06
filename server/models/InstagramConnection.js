import mongoose from 'mongoose';

const instagramConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accessToken: {
    type: String,
    required: true
  },
  tokenType: {
    type: String,
    default: 'bearer'
  },
  expiresIn: {
    type: Number,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  instagramUserId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['PERSONAL', 'BUSINESS', 'CREATOR'],
    required: true
  },
  mediaCount: {
    type: Number,
    default: 0
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followsCount: {
    type: Number,
    default: 0
  },
  profilePictureUrl: String,
  biography: String,
  website: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastSyncAt: {
    type: Date,
    default: Date.now
  },
  syncData: {
    posts: [{
      id: String,
      caption: String,
      mediaType: String,
      mediaUrl: String,
      permalink: String,
      timestamp: Date,
      likesCount: Number,
      commentsCount: Number
    }],
    insights: {
      impressions: Number,
      reach: Number,
      profileViews: Number,
      websiteClicks: Number,
      lastUpdated: Date
    }
  }
}, {
  timestamps: true
});

// Middleware para calcular expiresAt
instagramConnectionSchema.pre('save', function(next) {
  if (this.isModified('expiresIn')) {
    this.expiresAt = new Date(Date.now() + (this.expiresIn * 1000));
  }
  next();
});

// Método para verificar se o token está válido
instagramConnectionSchema.methods.isTokenValid = function() {
  return this.expiresAt > new Date();
};

// Método para verificar se precisa renovar
instagramConnectionSchema.methods.needsRefresh = function() {
  const sevenDaysFromNow = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
  return this.expiresAt < sevenDaysFromNow;
};

const InstagramConnection = mongoose.model('InstagramConnection', instagramConnectionSchema);

export default InstagramConnection;
