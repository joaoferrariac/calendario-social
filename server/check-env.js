import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔍 Verificando Variáveis de Ambiente...\n');

// Instagram OAuth
console.log('📱 Instagram OAuth:');
console.log(`   INSTAGRAM_CLIENT_ID: ${process.env.INSTAGRAM_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   INSTAGRAM_CLIENT_SECRET: ${process.env.INSTAGRAM_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   INSTAGRAM_REDIRECT_URI: ${process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5000/api/instagram-auth/callback'}`);

// Instagram API Legacy
console.log('\n📱 Instagram API Legacy:');
console.log(`   INSTAGRAM_ACCESS_TOKEN: ${process.env.INSTAGRAM_ACCESS_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   INSTAGRAM_BUSINESS_ACCOUNT_ID: ${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ? '✅ Configurado' : '❌ Não configurado'}`);

// Database
console.log('\n🗄️  Database:');
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI || '❌ Não configurado'}`);

// JWT
console.log('\n🔐 JWT:');
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);

// Cloudinary
console.log('\n☁️  Cloudinary:');
console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || '❌ Não configurado'}`);
console.log(`   CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`   CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ Não configurado'}`);

console.log('\n' + '='.repeat(50));

// Verificar se as credenciais do Instagram são placeholders
if (process.env.INSTAGRAM_CLIENT_ID === 'seu_client_id_aqui') {
  console.log('⚠️  AVISO: INSTAGRAM_CLIENT_ID está com valor placeholder!');
  console.log('   Você precisa configurar as credenciais reais do Instagram.');
}

if (process.env.INSTAGRAM_CLIENT_SECRET === 'seu_client_secret_aqui') {
  console.log('⚠️  AVISO: INSTAGRAM_CLIENT_SECRET está com valor placeholder!');
  console.log('   Você precisa configurar as credenciais reais do Instagram.');
}

if (process.env.INSTAGRAM_ACCESS_TOKEN === 'seu_access_token_aqui') {
  console.log('⚠️  AVISO: INSTAGRAM_ACCESS_TOKEN está com valor placeholder!');
  console.log('   Você precisa configurar as credenciais reais do Instagram.');
}

console.log('\n📋 Para configurar o Instagram:');
console.log('1. Acesse https://developers.facebook.com/');
console.log('2. Crie um app e configure o Instagram Basic Display');
console.log('3. Substitua os valores placeholder no arquivo .env');
console.log('4. Reinicie o servidor');
