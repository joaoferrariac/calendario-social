import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Post from './models/Post.js';
import connectDB from './config/database.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Limpar dados existentes
    console.log('🗑️ Limpando dados existentes...');
    await Post.deleteMany({});
    await User.deleteMany({});
    
    // Criar usuários
    console.log('👥 Criando usuários...');
    
    const users = [
      {
        name: 'Administrador',
        email: 'admin@exemplo.com',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        name: 'Editor',
        email: 'editor@exemplo.com',
        password: 'editor123',
        role: 'EDITOR'
      },
      {
        name: 'Leitor',
        email: 'leitor@exemplo.com',
        password: 'reader123',
        role: 'READER'
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Usuário criado: ${user.name} (${user.email})`);
    }

    // Criar posts
    console.log('📝 Criando posts...');
    
    const posts = [
      {
        title: 'Bem-vindos ao nosso perfil!',
        content: 'Estamos muito felizes em compartilhar nossa jornada com vocês. Aqui você encontrará conteúdo exclusivo sobre design, tecnologia e inovação. #bemvindos #design #tecnologia',
        platform: 'INSTAGRAM',
        postType: 'FEED',
        status: 'PUBLISHED',
        mediaUrls: ['https://picsum.photos/600/600?random=1'],
        hashtags: ['bemvindos', 'design', 'tecnologia'],
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        likes: 127,
        comments: 23,
        shares: 8,
        insights: {
          reach: 1250,
          impressions: 1890,
          engagement: 158,
          clicks: 45
        }
      },
      {
        title: 'Dicas de Design #1',
        content: 'A regra dos terços é fundamental no design visual. Ela ajuda a criar composições mais equilibradas e interessantes. Experimente aplicar essa técnica em seus projetos! #designtips #visualdesign',
        platform: 'INSTAGRAM',
        postType: 'CAROUSEL',
        status: 'PUBLISHED',
        mediaUrls: [
          'https://picsum.photos/600/600?random=2',
          'https://picsum.photos/600/600?random=3'
        ],
        hashtags: ['designtips', 'visualdesign', 'dicas'],
        publishedAt: new Date('2024-01-16T14:30:00Z'),
        likes: 89,
        comments: 12,
        shares: 15,
        insights: {
          reach: 890,
          impressions: 1234,
          engagement: 116,
          clicks: 32
        }
      },
      {
        title: 'Story: Bastidores do projeto',
        content: 'Mostrando como é nosso processo criativo. Do sketch inicial até o resultado final! Swipe up para ver mais detalhes.',
        platform: 'INSTAGRAM',
        postType: 'STORY',
        status: 'PUBLISHED',
        mediaUrls: ['https://picsum.photos/600/1067?random=4'],
        hashtags: ['bastidores', 'processo', 'criativo'],
        publishedAt: new Date('2024-01-17T09:15:00Z'),
        likes: 45,
        comments: 5,
        shares: 3,
        insights: {
          reach: 567,
          impressions: 789,
          engagement: 53,
          clicks: 18
        }
      },
      {
        title: 'Tutorial: Como criar paletas de cores',
        content: 'Neste vídeo, ensino como criar paletas de cores harmoniosas para seus projetos. Ferramenta gratuita incluída na descrição! #colorpalette #tutorial #design',
        platform: 'INSTAGRAM',
        postType: 'REELS',
        status: 'PUBLISHED',
        mediaUrls: ['https://picsum.photos/600/1067?random=5'],
        hashtags: ['colorpalette', 'tutorial', 'design', 'cores'],
        publishedAt: new Date('2024-01-18T16:45:00Z'),
        likes: 203,
        comments: 31,
        shares: 24,
        insights: {
          reach: 2340,
          impressions: 3456,
          engagement: 258,
          clicks: 67
        }
      },
      {
        title: 'Cliente em destaque',
        content: 'Orgulhosos de apresentar o trabalho realizado para @clienteexemplo. Um projeto que uniu criatividade e estratégia para resultados incríveis! #cliente #sucesso #branding',
        platform: 'INSTAGRAM',
        postType: 'FEED',
        status: 'PUBLISHED',
        mediaUrls: ['https://picsum.photos/600/600?random=6'],
        hashtags: ['cliente', 'sucesso', 'branding', 'portfolio'],
        mentions: ['clienteexemplo'],
        publishedAt: new Date('2024-01-19T11:20:00Z'),
        likes: 156,
        comments: 18,
        shares: 12,
        insights: {
          reach: 1678,
          impressions: 2234,
          engagement: 186,
          clicks: 54
        }
      },
      {
        title: 'Tendências 2024',
        content: 'As principais tendências de design para 2024 estão aqui! Minimalismo, cores vibrantes e tipografias experimentais lideram o ranking. O que você acha? #trends2024 #designtrends',
        platform: 'INSTAGRAM',
        postType: 'CAROUSEL',
        status: 'PUBLISHED',
        mediaUrls: [
          'https://picsum.photos/600/600?random=7',
          'https://picsum.photos/600/600?random=8',
          'https://picsum.photos/600/600?random=9'
        ],
        hashtags: ['trends2024', 'designtrends', 'tendencias'],
        publishedAt: new Date('2024-01-20T13:00:00Z'),
        likes: 78,
        comments: 9,
        shares: 6,
        insights: {
          reach: 934,
          impressions: 1123,
          engagement: 93,
          clicks: 28
        }
      },
      {
        title: 'Post agendado para amanhã',
        content: 'Conteúdo especial chegando em breve! Prepare-se para dicas exclusivas sobre UX/UI Design. #comingsoon #uxui #design',
        platform: 'INSTAGRAM',
        postType: 'FEED',
        status: 'SCHEDULED',
        mediaUrls: ['https://picsum.photos/600/600?random=10'],
        hashtags: ['comingsoon', 'uxui', 'design'],
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas a partir de agora
        likes: 0,
        comments: 0,
        shares: 0,
        insights: {
          reach: 0,
          impressions: 0,
          engagement: 0,
          clicks: 0
        }
      },
      {
        title: 'Rascunho: Ideias para a próxima campanha',
        content: 'Brainstorming de ideias para a próxima campanha de marketing digital. Focando em storytelling e engajamento autêntico.',
        platform: 'INSTAGRAM',
        postType: 'FEED',
        status: 'DRAFT',
        mediaUrls: [],
        hashtags: ['brainstorming', 'marketing', 'storytelling'],
        likes: 0,
        comments: 0,
        shares: 0,
        insights: {
          reach: 0,
          impressions: 0,
          engagement: 0,
          clicks: 0
        }
      }
    ];

    for (const postData of posts) {
      // Selecionar autor aleatório entre os criados
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      postData.author = randomUser._id;
      
      const post = new Post(postData);
      await post.save();
      console.log(`✅ Post criado: ${post.title}`);
    }

    console.log('🎉 Seed concluído com sucesso!');
    console.log(`👥 ${createdUsers.length} usuários criados`);
    console.log(`📝 ${posts.length} posts criados`);
    
    console.log('\n📧 Credenciais de login:');
    console.log('Admin: admin@exemplo.com / admin123');
    console.log('Editor: editor@exemplo.com / editor123');
    console.log('Leitor: leitor@exemplo.com / reader123');
    
  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
    process.exit(0);
  }
};

seedDatabase();
