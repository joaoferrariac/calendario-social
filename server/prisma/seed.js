import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Hash das senhas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const editorPassword = await bcrypt.hash('editor123', 10);
  const readerPassword = await bcrypt.hash('reader123', 10);

  // Criar usuários de demonstração
  const admin = await prisma.user.upsert({
    where: { email: 'admin@exemplo.com' },
    update: {},
    create: {
      email: 'admin@exemplo.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@exemplo.com' },
    update: {},
    create: {
      email: 'editor@exemplo.com',
      password: editorPassword,
      name: 'Editor de Conteúdo',
      role: 'EDITOR',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor'
    }
  });

  const reader = await prisma.user.upsert({
    where: { email: 'leitor@exemplo.com' },
    update: {},
    create: {
      email: 'leitor@exemplo.com',
      password: readerPassword,
      name: 'Leitor',
      role: 'READER',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=reader'
    }
  });

  // Criar posts de exemplo
  const posts = [
    {
      title: 'Novo produto revolucionário',
      content: 'Estamos empolgados em apresentar nossa mais nova inovação! Depois de meses de desenvolvimento, finalmente chegou o momento de compartilhar com vocês. 🚀✨',
      scheduledAt: new Date('2025-08-10T09:00:00Z'),
      platform: 'INSTAGRAM',
      postType: 'FEED',
      mediaUrls: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'],
      hashtags: ['inovacao', 'produto', 'lancamento', 'tecnologia', 'startup'],
      authorId: editor.id,
      status: 'SCHEDULED'
    },
    {
      title: 'Story motivacional',
      content: 'Comece a semana com energia positiva!',
      scheduledAt: new Date('2025-08-05T07:00:00Z'),
      platform: 'INSTAGRAM',
      postType: 'STORY',
      mediaUrls: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'],
      hashtags: ['motivacao', 'segunda', 'positividade'],
      authorId: editor.id,
      status: 'DRAFT'
    },
    {
      title: 'Reels da semana',
      content: 'Nos bastidores do nosso processo criativo! Vem ver como fazemos a mágica acontecer 🎨🎬',
      scheduledAt: new Date('2025-08-12T15:30:00Z'),
      platform: 'INSTAGRAM',
      postType: 'REELS',
      mediaUrls: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400'],
      hashtags: ['bastidores', 'criatividade', 'equipe', 'processo', 'reels'],
      authorId: admin.id,
      status: 'SCHEDULED'
    },
    {
      title: 'Carrossel de dicas',
      content: '5 dicas essenciais para aumentar sua produtividade no trabalho! Deslize para ver todas 👆',
      scheduledAt: new Date('2025-08-08T14:00:00Z'),
      platform: 'INSTAGRAM',
      postType: 'CAROUSEL',
      mediaUrls: [
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'
      ],
      hashtags: ['produtividade', 'dicas', 'trabalho', 'foco', 'carrossel'],
      authorId: editor.id,
      status: 'PUBLISHED'
    },
    {
      title: 'Novidades LinkedIn',
      content: 'Compartilhando nossa jornada empresarial e as lições aprendidas ao longo do caminho. A transparência é fundamental para construir confiança com nossa comunidade.',
      scheduledAt: new Date('2025-08-09T10:00:00Z'),
      platform: 'LINKEDIN',
      postType: 'FEED',
      mediaUrls: ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400'],
      hashtags: ['negocios', 'transparencia', 'lideranca', 'crescimento'],
      authorId: admin.id,
      status: 'SCHEDULED'
    },
    {
      title: 'Momento inspirador',
      content: 'Sexta-feira é dia de celebrar as conquistas da semana! 🎉 Qual foi sua maior vitória?',
      scheduledAt: new Date('2025-08-09T18:00:00Z'),
      platform: 'FACEBOOK',
      postType: 'FEED',
      mediaUrls: ['https://images.unsplash.com/photo-1492472584521-8b97bc9d8e15?w=400'],
      hashtags: ['sexta', 'conquistas', 'celebracao', 'vitoria'],
      authorId: editor.id,
      status: 'DRAFT'
    },
    {
      title: 'Tutorial rápido',
      content: 'Como fazer um café perfeito em 60 segundos! ☕️ Salvem esse vídeo para não esquecer',
      scheduledAt: new Date('2025-08-11T08:30:00Z'),
      platform: 'INSTAGRAM',
      postType: 'REELS',
      mediaUrls: ['https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400'],
      hashtags: ['cafe', 'tutorial', 'dica', 'manha', 'rotina'],
      authorId: admin.id,
      status: 'PUBLISHED'
    },
    {
      title: 'Equipe unida',
      content: 'Nosso time é nossa maior força! Juntos somos imparáveis 💪 #TeamWork',
      scheduledAt: new Date('2025-08-07T16:00:00Z'),
      platform: 'INSTAGRAM',
      postType: 'FEED',
      mediaUrls: ['https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400'],
      hashtags: ['equipe', 'trabalho', 'unidos', 'forca', 'time'],
      authorId: editor.id,
      status: 'PUBLISHED'
    }
  ];

  for (const postData of posts) {
    await prisma.post.create({
      data: postData
    });
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log(`👤 Usuários criados: ${admin.name}, ${editor.name}, ${reader.name}`);
  console.log(`📝 Posts criados: ${posts.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
