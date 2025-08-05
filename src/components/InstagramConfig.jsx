import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, CheckCircle, AlertCircle, ExternalLink, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const InstagramConfig = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkInstagramStatus();
  }, []);

  const checkInstagramStatus = async () => {
    try {
      const response = await api.get('/instagram/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Erro ao verificar status do Instagram:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar configuração do Instagram",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await api.post('/instagram/test');
      
      if (response.data.success) {
        toast({
          title: "✅ Sucesso!",
          description: "Conexão com Instagram funcionando perfeitamente",
        });
        await checkInstagramStatus(); // Atualizar status
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: error.response?.data?.message || "Erro ao testar conexão",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white rounded-lg border border-gray-200"
    >
      <div className="flex items-center gap-3 mb-4">
        <Instagram className="w-8 h-8 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Configuração do Instagram
        </h3>
      </div>

      {status?.configured ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Instagram Configurado</span>
          </div>

          {status.accountInfo && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Informações da Conta:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Username:</strong> @{status.accountInfo.username}</p>
                <p><strong>Seguidores:</strong> {status.accountInfo.followers_count?.toLocaleString()}</p>
                <p><strong>Posts:</strong> {status.accountInfo.media_count}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={testConnection}
              disabled={testing}
              variant="outline"
              className="flex-1"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Testando...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open('https://developers.facebook.com/', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Instagram Não Configurado</span>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Como Configurar:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Acesse o <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Facebook Developers</a></li>
              <li>Crie um App e configure a Instagram Basic Display API</li>
              <li>Obtenha o Access Token e Business Account ID</li>
              <li>Configure as variáveis no arquivo .env do servidor:</li>
            </ol>
            
            <div className="mt-3 p-3 bg-gray-800 text-green-400 rounded text-xs font-mono">
              INSTAGRAM_ACCESS_TOKEN=seu_token_aqui<br />
              INSTAGRAM_BUSINESS_ACCOUNT_ID=seu_id_aqui
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://developers.facebook.com/', '_blank')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Configurar Instagram
            </Button>
            
            <Button
              onClick={checkInstagramStatus}
              variant="outline"
            >
              Verificar
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InstagramConfig;
