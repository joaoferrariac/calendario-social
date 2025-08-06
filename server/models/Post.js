import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN'],
    default: 'INSTAGRAM'
  },
  postType: {
    type: String,
    enum: ['FEED', 'STORY', 'REELS', 'CAROUSEL', 'IGTV'],
    default: 'FEED'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED', 'FAILED'],
    default: 'DRAFT'
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },
  // Configurações de agendamento
  autoPublish: {
    type: Boolean,
    default: false
  },
  publishMode: {
    type: String,
    enum: ['MANUAL', 'SCHEDULED', 'RECURRING'],
    default: 'MANUAL'
  },
  recurrence: {
    type: {
      type: String,
      enum: ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'],
      default: 'NONE'
    },
    interval: { type: Number, default: 1 },
    endDate: { type: Date, default: null },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }] // 0 = domingo, 6 = sábado
  },
  reminder: {
    enabled: { type: Boolean, default: false },
    minutesBefore: { type: Number, default: 60 }
  },
  mediaUrls: [{
    type: String
  }],
  hashtags: [{
    type: String,
    trim: true
  }],
  mentions: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  insights: {
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  },
  // Campos específicos do Instagram
  instagramPostId: {
    type: String,
    default: null
  },
  publishedData: {
    platform: { type: String },
    publishedAt: { type: Date },
    externalId: { type: String }
  }
}, {
  timestamps: true
});

// Índices para melhor performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, scheduledAt: 1 });
postSchema.index({ platform: 1, postType: 1 });

export default mongoose.model('Post', postSchema);
