import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, RefreshCw, User, BarChart3, Calendar, ExternalLink, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const InstagramConnect = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/instagram-auth/status');
      setConnectionStatus(response.data);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setConnectionStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await api.get('/instagram-auth/auth');
      
      if (response.data.success) {
        // Abrir popup para autenticação
        const popup = window.open(
          response.data.authUrl,
          'instagram-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Polling para verificar se a autenticação foi concluída
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Recarregar status após alguns segundos
            setTimeout(() => {
              checkConnectionStatus();
            }, 2000);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com Instagram",
        variant: "destructive"
      });
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.post('/instagram-auth/sync');
      
      if (response.data.success) {
        toast({
          title: "Sucesso!",
          description: "Dados sincronizados com sucesso"
        });
        await checkConnectionStatus();
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro na sincronização",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta do Instagram?')) {
      return;
    }

    try {
      await api.delete('/instagram-auth/disconnect');
      
      toast({
        title: "Sucesso!",
        description: "Instagram desconectado com sucesso"
      });
      
      setConnectionStatus({ connected: false });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: "Erro",
        description: "Erro ao desconectar",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (!connectionStatus?.connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Conectar Instagram</h3>
          <p className="text-gray-600 mb-6">
            Conecte sua conta do Instagram para sincronizar posts, insights e automatizar publicações.
          </p>
          
          <Button
            onClick={handleConnect}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Instagram className="w-5 h-5 mr-2" />
            Conectar Instagram
          </Button>
        </div>
      </motion.div>
    );
  }

  const { profile, insights, recentPosts, lastSyncAt, needsRefresh } = connectionStatus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Status da Conexão */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <Instagram className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">@{profile.username}</h3>
              <p className="text-sm text-gray-600">{profile.accountType} Account</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
            
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              size="sm"
            >
              <Unlink className="w-4 h-4 mr-2" />
              Desconectar
            </Button>
          </div>
        </div>

        {needsRefresh && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Seu token expira em breve. A renovação será feita automaticamente.
            </p>
          </div>
        )}

        {/* Estatísticas do Perfil */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{profile.followersCount?.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{profile.followsCount?.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Seguindo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{profile.mediaCount?.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Última sincronização: {new Date(lastSyncAt).toLocaleString()}
        </div>
      </div>

      {/* Insights (se disponível) */}
      {insights && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Insights (Últimos 30 dias)
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{insights.impressions?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Impressões</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{insights.reach?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Alcance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{insights.profileViews?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Visualizações</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{insights.websiteClicks?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Cliques no Site</div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Recentes */}
      {recentPosts && recentPosts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Posts Recentes
          </h4>
          
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                {post.mediaUrl && (
                  <img
                    src={post.mediaUrl}
                    alt="Post"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                    {post.caption || 'Sem legenda'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>❤️ {post.likesCount}</span>
                      <span>💬 {post.commentsCount}</span>
                      <span>{post.mediaType}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InstagramConnect;
