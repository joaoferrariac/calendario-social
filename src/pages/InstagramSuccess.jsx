import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InstagramSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar após 3 segundos
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Instagram Conectado!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Sua conta do Instagram foi conectada com sucesso. Estamos sincronizando seus dados...
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-purple-600 mb-6">
          <Instagram className="w-5 h-5" />
          <span className="font-medium">Sincronizando dados...</span>
        </div>
        
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 w-full"
        >
          Ir para Dashboard
        </Button>
      </div>
    </div>
  );
};

export default InstagramSuccess;
