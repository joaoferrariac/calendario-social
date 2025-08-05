import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Instagram, Send, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishingStates, setPublishingStates] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/posts');
      const postsData = response.data?.posts || [];
      
      setPosts(postsData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const publishToInstagram = async (postId) => {
    setPublishingStates(prev => ({ ...prev, [postId]: true }));
    
    try {
      const response = await api.post(`/instagram/publish/${postId}`);
      
      if (response.data.success) {
        toast({
          title: "🎉 Sucesso!",
          description: response.data.message,
        });
        
        // Atualizar a lista de posts
        await loadPosts();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao publicar no Instagram:', error);
      toast({
        title: "❌ Erro",
        description: error.response?.data?.message || "Erro ao publicar no Instagram",
        variant: "destructive"
      });
    } finally {
      setPublishingStates(prev => ({ ...prev, [postId]: false }));
    }
  };

  const canPublishToInstagram = (post) => {
    return post.title && 
           post.content && 
           post.mediaUrls && 
           post.mediaUrls.length > 0 && 
           !post.instagramPostId &&
           post.status !== 'PUBLISHED';
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Posts</h1>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Carregando posts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Posts</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Erro: {error}</p>
            <button 
              onClick={loadPosts}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Posts</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No Instagram: {posts.filter(p => p.instagramPostId).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Prontos: {posts.filter(p => canPublishToInstagram(p)).length}</span>
            </div>
            <div>Total: {posts.length} posts</div>
          </div>
        </div>
        
        <div className="grid gap-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {/* Header do post */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {post.author?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author?.name || 'Usuário'}</h3>
                    <p className="text-sm text-gray-500">{post.author?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                    post.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                    {post.platform}
                  </span>
                </div>
              </div>

              {/* Conteúdo do post */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                <p className="text-gray-700">{post.content}</p>
              </div>

              {/* Imagens */}
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                  {post.mediaUrls.slice(0, 3).map((url, index) => (
                    <img
                      key={index}
                      src={url.startsWith('http') ? url : `http://localhost:5000${url}`}
                      alt={`Media ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                  {post.mediaUrls.length > 3 && (
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center text-gray-500">
                      +{post.mediaUrls.length - 3} mais
                    </div>
                  )}
                </div>
              )}

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.hashtags.map((tag, index) => (
                    <span key={index} className="text-blue-600 text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Estatísticas e Ações */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  <span>🔄 {post.shares}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Status de publicação no Instagram */}
                  {post.instagramPostId ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Publicado no IG</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://www.instagram.com/p/${post.instagramPostId}`, '_blank')}
                        className="p-1 h-auto"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : canPublishToInstagram(post) ? (
                    <Button
                      onClick={() => publishToInstagram(post._id)}
                      disabled={publishingStates[post._id]}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {publishingStates[post._id] ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Publicando...
                        </>
                      ) : (
                        <>
                          <Instagram className="w-4 h-4 mr-2" />
                          Publicar
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Não disponível</span>
                    </div>
                  )}
                  
                  {/* Data */}
                  <div className="text-sm text-gray-500">
                    {post.publishedAt ? 
                      new Date(post.publishedAt).toLocaleDateString('pt-BR') : 
                      post.scheduledAt ? 
                      `Agendado para ${new Date(post.scheduledAt).toLocaleDateString('pt-BR')}` :
                      'Rascunho'
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum post encontrado</h3>
            <p className="text-gray-500">Crie seu primeiro post para começar!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PostsPage;
