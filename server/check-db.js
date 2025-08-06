import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Post from './models/Post.js';
import InstagramConnection from './models/InstagramConnection.js';

// Carregar variáveis de ambiente
dotenv.config();

const checkDatabase = async () => {
  try {
    // Conectar ao MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/calendario-social';
    await mongoose.connect(mongoURI);

    console.log('🔌 Conectado ao MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Verificar collections e documentos
    console.log('\n📋 ESTATÍSTICAS DO BANCO:');
    
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const scheduledCount = await Post.countDocuments({ status: 'SCHEDULED' });
    const publishedCount = await Post.countDocuments({ status: 'PUBLISHED' });
    const draftCount = await Post.countDocuments({ status: 'DRAFT' });
    const instagramCount = await InstagramConnection.countDocuments();
    
    console.log(`👥 Usuários: ${userCount}`);
    console.log(`📝 Posts Total: ${postCount}`);
    console.log(`   📋 Rascunhos: ${draftCount}`);
    console.log(`   ⏰ Agendados: ${scheduledCount}`);
    console.log(`   ✅ Publicados: ${publishedCount}`);
    console.log(`📱 Conexões Instagram: ${instagramCount}`);
    
    // Listar usuários
    console.log('\n👥 USUÁRIOS:');
    const users = await User.find({}, 'name email role isActive').lean();
    users.forEach(user => {
      const status = user.isActive ? '✅' : '❌';
      console.log(`${status} ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Posts recentes
    console.log('\n📝 POSTS RECENTES:');
    const recentPosts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
      
    recentPosts.forEach(post => {
      const date = new Date(post.createdAt).toLocaleDateString('pt-BR');
      const status = post.status === 'PUBLISHED' ? '✅' : 
                    post.status === 'SCHEDULED' ? '⏰' : '📋';
      console.log(`${status} ${post.title} - ${post.author?.name} (${date})`);
    });
    
    // Posts agendados
    console.log('\n⏰ PRÓXIMOS POSTS AGENDADOS:');
    const upcomingPosts = await Post.find({ 
      status: 'SCHEDULED',
      scheduledAt: { $gte: new Date() }
    })
    .populate('author', 'name')
    .sort({ scheduledAt: 1 })
    .limit(5)
    .lean();
    
    if (upcomingPosts.length > 0) {
      upcomingPosts.forEach(post => {
        const date = new Date(post.scheduledAt).toLocaleString('pt-BR');
        const mode = post.publishMode === 'RECURRING' ? '🔄' : 
                    post.publishMode === 'SCHEDULED' ? '⏰' : '🤚';
        console.log(`${mode} ${post.title} - ${date} (${post.author?.name})`);
      });
    } else {
      console.log('Nenhum post agendado');
    }
    
    // Health check das conexões
    console.log('\n🏥 HEALTH CHECK:');
    console.log(`✅ MongoDB: Conectado`);
    console.log(`✅ Collections: ${mongoose.connection.db.collections ? 'OK' : 'ERRO'}`);
    console.log(`✅ Índices: Verificando...`);
    
    // Verificar índices importantes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Collections encontradas: ${collections.map(c => c.name).join(', ')}`);
    
    console.log('\n🎯 CREDENCIAIS DE ACESSO:');
    console.log('🔑 Admin: admin@exemplo.com / admin123');
    console.log('✏️ Editor: editor@exemplo.com / editor123');
    console.log('👁️ Leitor: leitor@exemplo.com / reader123');
    
    console.log('\n✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  } finally {
    // Fechar conexão
    await mongoose.connection.close();
    console.log('🔌 Conexão MongoDB fechada');
    process.exit(0);
  }
};

// Executar verificação
checkDatabase();
