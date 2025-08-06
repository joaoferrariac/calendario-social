import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';

const PostsPageDebug = () => {
  const [status, setStatus] = useState('Carregando...');

  console.log('PostsPageDebug: Componente renderizado');

  useEffect(() => {
    console.log('PostsPageDebug: useEffect executado');
    setStatus('Componente carregado com sucesso!');
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-red-500">Posts (Debug)</h1>
        <div className="bg-yellow-200 p-4 rounded">
          <p className="font-bold">Status: {status}</p>
          <p>URL: {window.location.href}</p>
          <p>Timestamp: {new Date().toISOString()}</p>
          <p>Token presente: {!!localStorage.getItem('auth_token') ? 'Sim' : 'Não'}</p>
        </div>
      </div>
    </Layout>
  );
};

export default PostsPageDebug;
