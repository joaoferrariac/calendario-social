import express from 'express';

const router = express.Router();

// Diagnóstico do sistema
router.get('/status', (req, res) => {
  const placeholders = [
    'seu_client_id_aqui',
    'seu_client_secret_aqui',
    'seu_access_token_aqui',
    'YOUR_CLIENT_ID',
    'YOUR_CLIENT_SECRET'
  ];

  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    server: {
      port: process.env.PORT || 5000,
      running: true
    },
    database: {
      mongodb_uri: process.env.MONGODB_URI ? '✅ Configurado' : '❌ Não configurado',
      mongodb_host: process.env.MONGODB_URI ? new URL(process.env.MONGODB_URI).host : 'N/A'
    },
    instagram: {
      client_id: {
        configured: !!process.env.INSTAGRAM_CLIENT_ID,
        is_placeholder: placeholders.includes(process.env.INSTAGRAM_CLIENT_ID),
        status: process.env.INSTAGRAM_CLIENT_ID && !placeholders.includes(process.env.INSTAGRAM_CLIENT_ID) ? '✅ Configurado' : '❌ Placeholder'
      },
      client_secret: {
        configured: !!process.env.INSTAGRAM_CLIENT_SECRET,
        is_placeholder: placeholders.includes(process.env.INSTAGRAM_CLIENT_SECRET),
        status: process.env.INSTAGRAM_CLIENT_SECRET && !placeholders.includes(process.env.INSTAGRAM_CLIENT_SECRET) ? '✅ Configurado' : '❌ Placeholder'
      },
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5000/api/instagram-auth/callback',
      ready: process.env.INSTAGRAM_CLIENT_ID && 
             process.env.INSTAGRAM_CLIENT_SECRET &&
             !placeholders.includes(process.env.INSTAGRAM_CLIENT_ID) &&
             !placeholders.includes(process.env.INSTAGRAM_CLIENT_SECRET)
    },
    cloudinary: {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configurado' : '❌ Não configurado',
      api_key: process.env.CLOUDINARY_API_KEY ? '✅ Configurado' : '❌ Não configurado',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Configurado' : '❌ Não configurado'
    },
    jwt: {
      secret: process.env.JWT_SECRET ? '✅ Configurado' : '❌ Não configurado'
    }
  };

  // Determinar status geral
  const issues = [];
  
  if (!status.instagram.ready) {
    issues.push('Instagram OAuth não configurado (credenciais são placeholders)');
  }
  
  if (!process.env.MONGODB_URI) {
    issues.push('MongoDB URI não configurado');
  }
  
  if (!process.env.JWT_SECRET) {
    issues.push('JWT Secret não configurado');
  }

  const overallStatus = issues.length === 0 ? '✅ Sistema Pronto' : '⚠️ Configuração Necessária';

  res.json({
    status: overallStatus,
    issues,
    details: status,
    next_steps: issues.length > 0 ? [
      'Configure as credenciais do Instagram no arquivo .env',
      'Siga o guia em INSTAGRAM-CONFIG-DETALHADO.md',
      'Reinicie o servidor após configurar'
    ] : [
      'Sistema pronto para uso',
      'Teste a conexão com Instagram',
      'Configure usuários de teste se necessário'
    ]
  });
});

export default router;
