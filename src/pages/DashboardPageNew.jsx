import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Instagram,
  Heart,
  MessageCircle,
  Share,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  Eye,
  Play,
  Camera,
  Plus
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { postsAPI, mediaAPI, usersAPI } from '@/lib/api';
import useAuthStore from '@/lib/authStore';

const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend, isLoading, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className="flex items-center space-x-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">{trend}</span>
        </div>
      )}
    </div>
    
    <div>
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      {isLoading ? (
        <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
      ) : (
        <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      )}
      {subtitle && (
        <p className="text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

const InstagramPreview = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center">
        <Instagram className="w-5 h-5 mr-2 text-purple-600" />
        Preview Instagram
      </h3>
      <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
        Ver Todos
      </Button>
    </div>

    <div className="space-y-4">
      {/* Post Preview */}
      <div className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center space-x-3 p-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <Instagram className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900">@sua_empresa</p>
            <p className="text-sm text-slate-500">Há 2 horas • São Paulo</p>
          </div>
          <div className="ml-auto">
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
          </div>
        </div>

        {/* Image Placeholder */}
        <div className="aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex flex-col items-center justify-center relative group">
          <Camera className="w-16 h-16 text-purple-400 mb-3" />
          <p className="text-sm text-purple-600 font-medium">Sua próxima postagem aparecerá aqui</p>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <Heart className="w-6 h-6 text-slate-400 hover:text-red-500 cursor-pointer transition-colors" />
              <MessageCircle className="w-6 h-6 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
              <Share className="w-6 h-6 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
            </div>
            <div className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </div>
          </div>
          <p className="text-sm">
            <span className="font-medium">247 curtidas</span>
          </p>
          <p className="text-sm text-slate-900 mt-1">
            <span className="font-medium">@sua_empresa</span> Conteúdo incrível sendo criado! 🚀 
            <span className="text-purple-600"> #marketing #instagram #socialmedia</span>
          </p>
          <p className="text-xs text-slate-500 mt-2 cursor-pointer hover:text-slate-700">Ver todos os 12 comentários</p>
          <div className="flex items-center mt-3 text-xs text-slate-400">
            <Clock className="w-3 h-3 mr-1" />
            Há 2 horas
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const QuickActions = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
  >
    <h3 className="text-lg font-semibold text-slate-900 mb-6">Ações Rápidas</h3>
    
    <div className="grid grid-cols-1 gap-4">
      <Button className="h-auto p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 group">
        <div className="flex items-center w-full">
          <Instagram className="w-8 h-8 mr-4 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-medium text-white">Novo Post do Feed</p>
            <p className="text-xs opacity-90">Criar post para o Instagram</p>
          </div>
          <Plus className="w-5 h-5 ml-auto" />
        </div>
      </Button>
      
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto p-4 border-purple-200 hover:bg-purple-50 group">
          <div className="text-center">
            <Camera className="w-6 h-6 mb-2 text-purple-600 mx-auto group-hover:scale-110 transition-transform" />
            <p className="font-medium text-purple-600 text-sm">Stories</p>
            <p className="text-xs text-purple-500">24h</p>
          </div>
        </Button>
        
        <Button variant="outline" className="h-auto p-4 border-pink-200 hover:bg-pink-50 group">
          <div className="text-center">
            <Play className="w-6 h-6 mb-2 text-pink-600 mx-auto group-hover:scale-110 transition-transform" />
            <p className="font-medium text-pink-600 text-sm">Reels</p>
            <p className="text-xs text-pink-500">Vídeo</p>
          </div>
        </Button>
      </div>
      
      <Button variant="outline" className="h-auto p-4 border-blue-200 hover:bg-blue-50 group">
        <div className="flex items-center w-full">
          <Calendar className="w-6 h-6 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-medium text-blue-600">Agendar Postagem</p>
            <p className="text-xs text-blue-500">Programar para mais tarde</p>
          </div>
        </div>
      </Button>
    </div>
  </motion.div>
);

const RecentActivity = ({ isLoading, posts }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
  >
    <h3 className="text-lg font-semibold text-slate-900 mb-6">Atividade Recente</h3>
    
    {isLoading ? (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    ) : posts && posts.length > 0 ? (
      <div className="space-y-4">
        {posts.slice(0, 5).map((post) => (
          <div key={post.id} className="flex items-center space-x-3 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              post.status === 'PUBLISHED' ? 'bg-green-100' :
              post.status === 'SCHEDULED' ? 'bg-blue-100' : 'bg-yellow-100'
            }`}>
              {post.status === 'PUBLISHED' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : post.status === 'SCHEDULED' ? (
                <Clock className="w-6 h-6 text-blue-600" />
              ) : (
                <Eye className="w-6 h-6 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900 truncate">{post.title}</p>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Instagram className="w-4 h-4" />
                <span>{post.platform}</span>
                <span>•</span>
                <span>{new Date(post.scheduledAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="text-slate-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Instagram className="w-8 h-8 text-purple-600" />
        </div>
        <p className="text-slate-500 mb-4">Nenhuma atividade recente</p>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeiro Post
        </Button>
      </div>
    )}
  </motion.div>
);

const DashboardPage = () => {
  const { user } = useAuthStore();

  // Queries para estatísticas
  const { data: postsStats, isLoading: postsLoading } = useQuery({
    queryKey: ['posts-stats'],
    queryFn: postsAPI.getStats
  });

  const { data: mediaStats, isLoading: mediaLoading } = useQuery({
    queryKey: ['media-stats'],
    queryFn: mediaAPI.getStats,
    enabled: user?.role === 'ADMIN' || user?.role === 'EDITOR'
  });

  const { data: recentPosts, isLoading: recentLoading } = useQuery({
    queryKey: ['recent-posts'],
    queryFn: () => postsAPI.getPosts({ limit: 5, page: 1 }),
    select: (data) => data.posts
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Olá, {user?.name}! 👋
            </h1>
            <p className="text-lg text-slate-600">
              Vamos criar conteúdo incrível para o Instagram hoje
            </p>
          </div>
          
          <div className="mt-6 lg:mt-0 flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 rounded-xl">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-700">Instagram conectado</span>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Novo Post
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Posts Criados"
            value={postsStats?.total || 0}
            subtitle="Total de posts"
            icon={Instagram}
            color="bg-gradient-to-r from-purple-600 to-pink-600"
            trend="+12%"
            isLoading={postsLoading}
          />
          
          <MetricCard
            title="Agendados"
            value={postsStats?.byStatus?.scheduled || 0}
            subtitle="Próximos 7 dias"
            icon={Clock}
            color="bg-gradient-to-r from-blue-600 to-blue-700"
            isLoading={postsLoading}
          />
          
          <MetricCard
            title="Publicados"
            value={postsStats?.byStatus?.published || 0}
            subtitle="Este mês"
            icon={CheckCircle}
            color="bg-gradient-to-r from-green-600 to-green-700"
            trend="+8%"
            isLoading={postsLoading}
          />

          <MetricCard
            title="Arquivos de Mídia"
            value={mediaStats?.totalFiles || 0}
            subtitle="Fotos e vídeos"
            icon={Camera}
            color="bg-gradient-to-r from-pink-600 to-red-600"
            isLoading={mediaLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Instagram Preview */}
          <div className="lg:col-span-2">
            <InstagramPreview />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity 
          isLoading={recentLoading} 
          posts={recentPosts} 
        />
      </div>
    </Layout>
  );
};

export default DashboardPage;
