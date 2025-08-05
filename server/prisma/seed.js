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
      title: 'Lançamento do novo produto',
      content: 'Estamos empolgados em apresentar nossa mais nova inovação! 🚀',
      scheduledAt: new Date('2025-08-10T09:00:00Z'),
      platform: 'INSTAGRAM',
      hashtags: ['#inovacao', '#produto', '#lancamento'],
      authorId: editor.id,
      status: 'SCHEDULED'
    },
    {
      title: 'Dica de segunda-feira',
      content: 'Comece a semana com energia positiva! ✨',
      scheduledAt: new Date('2025-08-05T07:00:00Z'),
      platform: 'FACEBOOK',
      hashtags: ['#motivacao', '#segunda', '#positividade'],
      authorId: editor.id,
      status: 'DRAFT'
    },
    {
      title: 'Behind the scenes',
      content: 'Nos bastidores do nosso escritório criativo 🎨',
      scheduledAt: new Date('2025-08-12T15:30:00Z'),
      platform: 'LINKEDIN',
      hashtags: ['#trabalho', '#criatividade', '#equipe'],
      authorId: admin.id,
      status: 'SCHEDULED'
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
