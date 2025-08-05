import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  FileText, 
  Image, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { postsAPI, mediaAPI, usersAPI } from '@/lib/api';
import useAuthStore from '@/lib/authStore';

const StatCard = ({ title, value, icon: Icon, color, trend, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
        {trend && (
          <p className="text-xs text-green-600 mt-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const RecentActivity = ({ isLoading, posts }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Atividade Recente
    </h3>
    
    {isLoading ? (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    ) : posts?.length > 0 ? (
      <div className="space-y-4">
        {posts.slice(0, 5).map((post) => (
          <div key={post.id} className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              post.status === 'PUBLISHED' ? 'bg-green-100' :
              post.status === 'SCHEDULED' ? 'bg-blue-100' :
              post.status === 'DRAFT' ? 'bg-yellow-100' : 'bg-gray-100'
            }`}>
              {post.status === 'PUBLISHED' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : post.status === 'SCHEDULED' ? (
                <Clock className="w-4 h-4 text-blue-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {post.title}
              </p>
              <p className="text-xs text-gray-500">
                {post.platform} • {new Date(post.scheduledAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-center py-8">
        Nenhuma atividade recente
      </p>
    )}
  </motion.div>
);

const DashboardPage = () => {
  const { user, isAdmin } = useAuthStore();

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

  const { data: usersStats, isLoading: usersLoading } = useQuery({
    queryKey: ['users-stats'],
    queryFn: usersAPI.getStats,
    enabled: user?.role === 'ADMIN'
  });

  const { data: recentPosts, isLoading: recentLoading } = useQuery({
    queryKey: ['recent-posts'],
    queryFn: () => postsAPI.getPosts({ limit: 5, page: 1 }),
    select: (data) => data.posts
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Aqui está um resumo das suas atividades
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Posts"
            value={postsStats?.total || 0}
            icon={FileText}
            color="bg-blue-500"
            isLoading={postsLoading}
          />
          
          <StatCard
            title="Posts Agendados"
            value={postsStats?.byStatus?.scheduled || 0}
            icon={Clock}
            color="bg-yellow-500"
            isLoading={postsLoading}
          />
          
          <StatCard
            title="Posts Publicados"
            value={postsStats?.byStatus?.published || 0}
            icon={CheckCircle}
            color="bg-green-500"
            isLoading={postsLoading}
          />

          {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
            <StatCard
              title="Arquivos de Mídia"
              value={mediaStats?.totalFiles || 0}
              icon={Image}
              color="bg-purple-500"
              isLoading={mediaLoading}
            />
          )}

          {user?.role === 'ADMIN' && (
            <StatCard
              title="Total de Usuários"
              value={usersStats?.total || 0}
              icon={Users}
              color="bg-indigo-500"
              isLoading={usersLoading}
            />
          )}
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posts por Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Posts por Status
            </h3>
            
            {postsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rascunhos</span>
                  <span className="text-sm font-medium text-gray-900">
                    {postsStats?.byStatus?.draft || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Agendados</span>
                  <span className="text-sm font-medium text-gray-900">
                    {postsStats?.byStatus?.scheduled || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Publicados</span>
                  <span className="text-sm font-medium text-gray-900">
                    {postsStats?.byStatus?.published || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Arquivados</span>
                  <span className="text-sm font-medium text-gray-900">
                    {postsStats?.byStatus?.archived || 0}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Atividade Recente */}
          <RecentActivity 
            isLoading={recentLoading} 
            posts={recentPosts} 
          />
        </div>

        {/* Media Stats (apenas para Admin/Editor) */}
        {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estatísticas de Mídia
            </h3>
            
            {mediaLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {mediaStats?.totalImages || 0}
                  </p>
                  <p className="text-sm text-gray-600">Imagens</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {mediaStats?.totalVideos || 0}
                  </p>
                  <p className="text-sm text-gray-600">Vídeos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatFileSize(mediaStats?.totalSize)}
                  </p>
                  <p className="text-sm text-gray-600">Espaço Usado</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Stats (apenas para Admin) */}
        {user?.role === 'ADMIN' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usuários por Função
            </h3>
            
            {usersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {usersStats?.byRole?.admin || 0}
                  </p>
                  <p className="text-sm text-gray-600">Administradores</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {usersStats?.byRole?.editor || 0}
                  </p>
                  <p className="text-sm text-gray-600">Editores</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {usersStats?.byRole?.reader || 0}
                  </p>
                  <p className="text-sm text-gray-600">Leitores</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
