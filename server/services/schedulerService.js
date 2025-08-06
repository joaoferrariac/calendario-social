import cron from 'node-cron';
import Post from '../models/Post.js';
import InstagramService from './instagramService.js';

class SchedulerService {
  constructor() {
    this.instagramService = new InstagramService();
    this.scheduledTasks = new Map();
    this.isInitialized = false;
  }

  initialize() {
    if (!this.isInitialized) {
      this.init();
      this.isInitialized = true;
      console.log('📅 SchedulerService inicializado com sucesso');
    }
  }

  init() {
    // Verifica posts agendados a cada minuto
    cron.schedule('* * * * *', () => {
      this.checkScheduledPosts();
    });

    // Carrega posts agendados existentes
    this.loadScheduledPosts();
  }

  async loadScheduledPosts() {
    try {
      const scheduledPosts = await Post.find({
        status: 'SCHEDULED',
        scheduledAt: { $gte: new Date() },
        autoPublish: true
      });

      console.log(`📅 Carregados ${scheduledPosts.length} posts agendados`);
      
      for (const post of scheduledPosts) {
        this.schedulePost(post);
      }
    } catch (error) {
      console.error('Erro ao carregar posts agendados:', error);
    }
  }

  async checkScheduledPosts() {
    try {
      const now = new Date();
      const postsToPublish = await Post.find({
        status: 'SCHEDULED',
        scheduledAt: { $lte: now },
        autoPublish: true
      });

      for (const post of postsToPublish) {
        await this.publishPost(post);
      }
    } catch (error) {
      console.error('Erro ao verificar posts agendados:', error);
    }
  }

  async publishPost(post) {
    try {
      console.log(`📤 Publicando post agendado: ${post.title}`);

      // Verificar se tem mídia
      if (!post.mediaUrls || post.mediaUrls.length === 0) {
        throw new Error('Post deve ter pelo menos uma imagem');
      }

      // Preparar legenda
      const caption = this.buildCaption(post);

      let result;
      if (post.mediaUrls.length === 1) {
        result = await this.instagramService.publishImage(post.mediaUrls[0], caption);
      } else {
        result = await this.instagramService.publishCarousel(post.mediaUrls, caption);
      }

      if (result.success) {
        // Atualizar post como publicado
        await Post.findByIdAndUpdate(post._id, {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          instagramPostId: result.postId,
          publishedData: {
            platform: 'INSTAGRAM',
            publishedAt: new Date(),
            externalId: result.postId
          }
        });

        console.log(`✅ Post publicado com sucesso: ${result.postId}`);

        // Criar próxima ocorrência se for recorrente
        if (post.publishMode === 'RECURRING' && post.recurrence.type !== 'NONE') {
          await this.createRecurringPost(post);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`❌ Erro ao publicar post ${post._id}:`, error);
      
      // Marcar como falha
      await Post.findByIdAndUpdate(post._id, {
        status: 'FAILED',
        publishedData: {
          error: error.message,
          failedAt: new Date()
        }
      });
    }
  }

  buildCaption(post) {
    let caption = `${post.title}\n\n${post.content}`;
    
    if (post.hashtags && post.hashtags.length > 0) {
      caption += '\n\n' + post.hashtags.map(tag => `#${tag}`).join(' ');
    }

    if (post.mentions && post.mentions.length > 0) {
      caption += '\n\n' + post.mentions.map(mention => `@${mention}`).join(' ');
    }

    return caption;
  }

  async createRecurringPost(originalPost) {
    try {
      const nextDate = this.calculateNextOccurrence(originalPost.scheduledAt, originalPost.recurrence);
      
      if (!nextDate || (originalPost.recurrence.endDate && nextDate > originalPost.recurrence.endDate)) {
        return; // Não criar mais ocorrências
      }

      const newPost = new Post({
        ...originalPost.toObject(),
        _id: undefined,
        scheduledAt: nextDate,
        status: 'SCHEDULED',
        publishedAt: null,
        instagramPostId: null,
        publishedData: null,
        createdAt: undefined,
        updatedAt: undefined
      });

      await newPost.save();
      console.log(`🔄 Próxima ocorrência criada para: ${nextDate}`);
      
    } catch (error) {
      console.error('Erro ao criar post recorrente:', error);
    }
  }

  calculateNextOccurrence(currentDate, recurrence) {
    const next = new Date(currentDate);
    
    switch (recurrence.type) {
      case 'DAILY':
        next.setDate(next.getDate() + recurrence.interval);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + (7 * recurrence.interval));
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + recurrence.interval);
        break;
      default:
        return null;
    }

    return next;
  }

  schedulePost(post) {
    const taskId = `post_${post._id}`;
    
    // Remove tarefa existente se houver
    if (this.scheduledTasks.has(taskId)) {
      this.scheduledTasks.get(taskId).destroy();
    }

    // Cria nova tarefa
    const scheduledTime = new Date(post.scheduledAt);
    const cronExpression = `${scheduledTime.getMinutes()} ${scheduledTime.getHours()} ${scheduledTime.getDate()} ${scheduledTime.getMonth() + 1} *`;

    try {
      const task = cron.schedule(cronExpression, async () => {
        await this.publishPost(post);
        this.scheduledTasks.delete(taskId);
      }, {
        scheduled: false
      });

      this.scheduledTasks.set(taskId, task);
      task.start();

      console.log(`⏰ Post agendado para: ${scheduledTime}`);
    } catch (error) {
      console.error('Erro ao agendar post:', error);
    }
  }

  async cancelScheduledPost(postId) {
    const taskId = `post_${postId}`;
    
    if (this.scheduledTasks.has(taskId)) {
      this.scheduledTasks.get(taskId).destroy();
      this.scheduledTasks.delete(taskId);
    }

    await Post.findByIdAndUpdate(postId, {
      status: 'DRAFT',
      autoPublish: false
    });
  }

  getScheduledPosts() {
    return Array.from(this.scheduledTasks.keys());
  }

  async getUpcomingPosts(limit = 10) {
    return await Post.find({
      status: 'SCHEDULED',
      scheduledAt: { $gte: new Date() }
    })
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .populate('author', 'name email');
  }
}

// Criar e exportar uma instância única do serviço
const schedulerService = new SchedulerService();
export default schedulerService;
