import React from 'react';
import Layout from '@/components/Layout/Layout';

const MediaPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mídia</h1>
          <p className="text-gray-600">Gerencie seus arquivos de imagem e vídeo</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-center text-gray-500 py-12">
            Galeria de mídia será implementada aqui
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default MediaPage;
