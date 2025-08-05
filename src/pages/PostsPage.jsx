import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, 
  Play, Volume2, VolumeX, Eye, Calendar, Clock,
  Instagram, Facebook, Twitter, Linkedin, Music, Grid3X3,
  Filter, Search, Plus, Share, Download
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('instagram'); // 'instagram', 'grid', 'list'
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mutedVideos, setMutedVideos] = useState(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts');
      setPosts(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVideoMute = (postId) => {
    setMutedVideos(prev => {
      const newMuted = new Set(prev);
      if (newMuted.has(postId)) {
        newMuted.delete(postId);
      } else {
        newMuted.add(postId);
      }
      return newMuted;
    });
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'INSTAGRAM': return <Instagram className="w-5 h-5" />;
      case 'FACEBOOK': return <Facebook className="w-5 h-5" />;
      case 'TWITTER': return <Twitter className="w-5 h-5" />;
      case 'LINKEDIN': return <Linkedin className="w-5 h-5" />;
      default: return <Instagram className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'INSTAGRAM': return 'text-purple-600';
      case 'FACEBOOK': return 'text-blue-600';
      case 'TWITTER': return 'text-sky-500';
      case 'LINKEDIN': return 'text-blue-700';
      default: return 'text-purple-600';
    }
  };

  const getPostTypeLabel = (postType) => {
    switch (postType) {
      case 'STORY': return 'Story';
      case 'REELS': return 'Reels';
      case 'CAROUSEL': return 'Carrossel';
      case 'IGTV': return 'IGTV';
      default: return 'Feed';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'há poucos minutos';
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays < 7) return `há ${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const filteredPosts = posts.filter(post => {
    const matchesPlatform = filterPlatform === 'all' || post.platform === filterPlatform;
    const matchesType = filterType === 'all' || post.postType === filterType;
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPlatform && matchesType && matchesSearch;
  });

  // Componente de Post do Instagram
  const InstagramPost = ({ post }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg max-w-md mx-auto mb-6 overflow-hidden"
    >
      {/* Header do Post */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-0.5">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">
                {post.author?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">
                {post.author?.name || 'Usuário'}
              </span>
              {post.postType === 'STORY' && (
                <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded">
                  Story
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {getPlatformIcon(post.platform)}
              <span>{getPostTypeLabel(post.postType)}</span>
              <span>•</span>
              <span>{formatDate(post.scheduledAt)}</span>
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-600" />
      </div>

      {/* Conteúdo/Mídia */}
      <div className="relative">
        {post.mediaUrls && post.mediaUrls.length > 0 ? (
          <div className="relative bg-gray-100">
            {post.mediaUrls[0].includes('.mp4') || post.mediaUrls[0].includes('video') ? (
              <div className="relative">
                <video
                  className="w-full h-96 object-cover"
                  autoPlay
                  loop
                  muted={mutedVideos.has(post.id)}
                  playsInline
                >
                  <source src={post.mediaUrls[0]} type="video/mp4" />
                </video>
                <button
                  onClick={() => toggleVideoMute(post.id)}
                  className="absolute bottom-3 right-3 p-2 bg-black bg-opacity-50 rounded-full text-white"
                >
                  {mutedVideos.has(post.id) ? 
                    <VolumeX className="w-4 h-4" /> : 
                    <Volume2 className="w-4 h-4" />
                  }
                </button>
                {post.postType === 'REELS' && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                    <Play className="w-4 h-4" />
                    <Music className="w-4 h-4" />
                  </div>
                )}
              </div>
            ) : (
              <img
                src={post.mediaUrls[0]}
                alt={post.title}
                className="w-full h-96 object-cover"
              />
            )}
            
            {post.mediaUrls.length > 1 && (
              <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                1/{post.mediaUrls.length}
              </div>
            )}
          </div>
        ) : (
          <div className="h-96 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <p className="text-sm opacity-90">Post sem mídia</p>
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Heart className="w-6 h-6 hover:text-red-500 cursor-pointer" />
            <MessageCircle className="w-6 h-6 hover:text-gray-600 cursor-pointer" />
            <Send className="w-6 h-6 hover:text-gray-600 cursor-pointer" />
          </div>
          <Bookmark className="w-6 h-6 hover:text-gray-600 cursor-pointer" />
        </div>
        
        <div className="text-sm font-semibold mb-1">
          {Math.floor(Math.random() * 1000) + 50} curtidas
        </div>
        
        {post.content && (
          <div className="text-sm mb-2">
            <span className="font-semibold mr-2">
              {post.author?.name || 'usuario'}
            </span>
            {post.content}
          </div>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="text-sm text-blue-900 mb-2">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="mr-1">#{tag}</span>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500">
          Ver todos os {Math.floor(Math.random() * 50) + 5} comentários
        </div>
      </div>
    </motion.div>
  );

  // Componente de Post em Grid
  const GridPost = ({ post }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 group cursor-pointer"
    >
      {post.mediaUrls && post.mediaUrls.length > 0 ? (
        <img
          src={post.mediaUrls[0]}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">{post.title}</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              <Heart className="w-5 h-5" />
              <span>{Math.floor(Math.random() * 500) + 50}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-5 h-5" />
              <span>{Math.floor(Math.random() * 50) + 5}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${getPlatformColor(post.platform)}`}>
            {getPostTypeLabel(post.postType)}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(post.scheduledAt)}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-gray-900 truncate">
          {post.title}
        </h3>
        {post.content && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {post.content}
          </p>
        )}
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
            <p className="text-gray-600">Visualize seus posts como no Instagram</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Post
            </Button>
          </div>
        </div>

        {/* Filtros e Controles */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Busca */}
            <div className="flex-1 min-w-60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtros */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todas as plataformas</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="TWITTER">Twitter</option>
              <option value="LINKEDIN">LinkedIn</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="FEED">Feed</option>
              <option value="STORY">Story</option>
              <option value="REELS">Reels</option>
              <option value="CAROUSEL">Carrossel</option>
            </select>

            {/* Modo de Visualização */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'instagram' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('instagram')}
                className="rounded-r-none"
              >
                <Instagram className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredPosts.length} posts encontrados</span>
            <div className="flex items-center gap-4">
              <span>Visualização: {viewMode === 'instagram' ? 'Instagram' : 'Grade'}</span>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Instagram className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum post encontrado</h3>
            <p className="text-gray-500 mb-4">
              Crie seu primeiro post para ver como ficará no Instagram
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Criar Post
            </Button>
          </div>
        ) : (
          <div className={`
            ${viewMode === 'instagram' 
              ? 'max-w-lg mx-auto' 
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            }
          `}>
            <AnimatePresence>
              {filteredPosts.map((post) => (
                viewMode === 'instagram' ? (
                  <InstagramPost key={post.id} post={post} />
                ) : (
                  <GridPost key={post.id} post={post} />
                )
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PostsPage;
