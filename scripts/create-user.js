// Script para criar usuário no Supabase Auth
// Executar: node scripts/create-user.js

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Precisa da service role key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configure as variáveis de ambiente:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('💡 A service role key está em:');
  console.error('   Supabase Dashboard > Settings > API > service_role (secret)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  const userData = {
    email: 'joao@gmail.com',
    password: 'joao@123',
    name: 'João',
    role: 'MASTER'  // Primeiro usuário como MASTER
  };

  console.log(`\n🔄 Criando usuário: ${userData.email}...`);

  // Criar no Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true, // Já confirma o email
    user_metadata: {
      name: userData.name,
      role: userData.role
    }
  });

  if (authError) {
    console.error('❌ Erro ao criar usuário:', authError.message);
    return;
  }

  console.log('✅ Usuário criado no Auth:', authData.user.id);

  // A trigger deve criar na tabela users, mas vamos garantir
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Verificar/atualizar na tabela users
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (!existingUser) {
    // Criar manualmente se trigger não executou
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }]);

    if (insertError) {
      console.error('⚠️ Erro ao inserir na tabela users:', insertError.message);
    } else {
      console.log('✅ Usuário inserido na tabela users');
    }
  } else {
    // Atualizar role se necessário
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: userData.role, name: userData.name })
      .eq('id', authData.user.id);

    if (!updateError) {
      console.log('✅ Usuário atualizado na tabela users');
    }
  }

  console.log('\n🎉 Usuário criado com sucesso!');
  console.log('   Email:', userData.email);
  console.log('   Senha:', userData.password);
  console.log('   Role:', userData.role);
}

createUser().catch(console.error);
