import React from 'react';
import Layout from '@/components/Layout/Layout';

const UsersPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie contas de usuário e permissões</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-center text-gray-500 py-12">
            Gerenciamento de usuários será implementado aqui
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default UsersPage;
