import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Plus, Edit, Trash2, Calendar, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { postsAPI, handleApiError } from '@/lib/api';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postsAPI.getPosts();
      const postsData = response?.posts || [];
      
      setPosts(postsData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      const errorData = handleApiError(error);
      setError(errorData.message);
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    
    try {
      await postsAPI.deletePost(postId);
      toast({
        title: "Post excluído",
        description: "O post foi removido com sucesso.",
      });
      loadPosts();
    } catch (error) {
      const errorData = handleApiError(error);
      toast({
        title: "Erro",
        description: errorData.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'Publicado';
      case 'SCHEDULED': return 'Agendado';
      default: return 'Rascunho';
    }
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
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Post
          </Button>
        </div>
        
        <div className="grid gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{post.title || 'Sem título'}</h2>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                      {getStatusLabel(post.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.content || 'Sem conteúdo'}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.scheduledDate 
                        ? new Date(post.scheduledDate).toLocaleDateString('pt-BR')
                        : 'Sem data'}
                    </span>
                    {post.mediaUrl && (
                      <span className="flex items-center gap-1">
                        <Image className="w-4 h-4" />
                        Com mídia
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum post encontrado</h3>
            <p className="text-gray-500 mb-4">Crie seu primeiro post para começar!</p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Post
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PostsPage;
