import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  FileText,
  Image,
  TrendingUp,
  Building2
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { postsAPI, mediaAPI } from '@/lib/api';
import useAuthStore from '@/lib/authStore';
import { usePermissions } from '@/lib/usePermissions';

const MetricCard = ({ title, value, subtitle, icon: Icon, color, isLoading, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${color} shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          )}
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const QuickActions = () => {
  const navigate = useNavigate();
  const { canCreateClient } = usePermissions();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Ações Rápidas</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <Button 
          onClick={() => navigate('/posts/new')}
          className="h-auto p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 group"
        >
          <div className="flex items-center w-full">
            <FileText className="w-8 h-8 mr-4 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-medium text-white">Novo Post</p>
              <p className="text-xs opacity-90">Criar uma nova postagem</p>
            </div>
            <Plus className="w-5 h-5 ml-auto" />
          </div>
        </Button>

        {/* Botão Cadastrar Cliente - Apenas DESIGNER/ADMIN/MASTER */}
        {canCreateClient && (
          <Button 
            onClick={() => navigate('/clients')}
            className="h-auto p-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 group"
          >
            <div className="flex items-center w-full">
              <Building2 className="w-8 h-8 mr-4 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-white">Cadastrar Cliente</p>
                <p className="text-xs opacity-90">Criar novo ambiente</p>
              </div>
              <Plus className="w-5 h-5 ml-auto" />
            </div>
          </Button>
        )}
        
        <Button 
          onClick={() => navigate('/calendar')}
          variant="outline" 
          className="h-auto p-4 border-blue-200 hover:bg-blue-50 group"
        >
          <div className="flex items-center w-full">
            <Calendar className="w-6 h-6 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-medium text-blue-600">Ver Calendário</p>
              <p className="text-xs text-blue-500">Visualizar agendamentos</p>
            </div>
          </div>
        </Button>
        
        <Button 
          onClick={() => navigate('/media')}
          variant="outline" 
          className="h-auto p-4 border-purple-200 hover:bg-purple-50 group"
        >
          <div className="flex items-center w-full">
            <Image className="w-6 h-6 mr-3 text-purple-600 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-medium text-purple-600">Biblioteca de Mídia</p>
              <p className="text-xs text-purple-500">Gerenciar arquivos</p>
            </div>
          </div>
        </Button>
      </div>
    </motion.div>
  );
};

const RecentActivity = ({ isLoading, posts }) => {
  const navigate = useNavigate();

  return (
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
            <div 
              key={post.id} 
              className="flex items-center space-x-3 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => navigate('/posts')}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                post.status === 'PUBLISHED' ? 'bg-green-100' :
                post.status === 'SCHEDULED' ? 'bg-blue-100' : 'bg-yellow-100'
              }`}>
                {post.status === 'PUBLISHED' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : post.status === 'SCHEDULED' ? (
                  <Clock className="w-6 h-6 text-blue-600" />
                ) : (
                  <FileText className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 truncate">{post.title || 'Sem título'}</p>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <span>{
                    post.status === 'PUBLISHED' ? 'Publicado' :
                    post.status === 'SCHEDULED' ? 'Agendado' : 'Rascunho'
                  }</span>
                  <span>•</span>
                  <span>{new Date(post.scheduledDate || post.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-slate-500 mb-4">Nenhuma atividade recente</p>
          <Button 
            onClick={() => navigate('/posts')}
            className="bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Post
          </Button>
        </div>
      )}
    </motion.div>
  );
};

const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [postsStats, setPostsStats] = useState(null);
  const [mediaStats, setMediaStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [postsStatsData, mediaStatsData, postsData] = await Promise.all([
          postsAPI.getStats(),
          mediaAPI.getStats(),
          postsAPI.getPosts({ limit: 5 })
        ]);
        
        setPostsStats(postsStatsData);
        setMediaStats(mediaStatsData);
        setRecentPosts(postsData.posts || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Olá, {user?.name || 'Usuário'}! 👋
            </h1>
            <p className="text-lg text-slate-600">
              Bem-vindo ao Calendário Social
            </p>
          </div>
          
          <div className="mt-6 lg:mt-0">
            <Button 
              onClick={() => navigate('/posts/new')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Post
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Posts"
            value={postsStats?.total || 0}
            subtitle="Todos os posts"
            icon={FileText}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            isLoading={loading}
            onClick={() => navigate('/posts')}
          />
          
          <MetricCard
            title="Rascunhos"
            value={postsStats?.draft || 0}
            subtitle="Em elaboração"
            icon={Clock}
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
            isLoading={loading}
            onClick={() => navigate('/posts')}
          />
          
          <MetricCard
            title="Agendados"
            value={postsStats?.scheduled || 0}
            subtitle="Programados"
            icon={Calendar}
            color="bg-gradient-to-r from-blue-600 to-indigo-600"
            isLoading={loading}
            onClick={() => navigate('/calendar')}
          />

          <MetricCard
            title="Publicados"
            value={postsStats?.published || 0}
            subtitle="Já publicados"
            icon={CheckCircle}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
            isLoading={loading}
            onClick={() => navigate('/posts')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity 
              isLoading={loading} 
              posts={recentPosts} 
            />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Media Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Resumo de Mídia
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{mediaStats?.total || 0}</p>
              <p className="text-sm text-slate-500">Arquivos totais</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{mediaStats?.images || 0}</p>
              <p className="text-sm text-slate-500">Imagens</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-3xl font-bold text-slate-900">{mediaStats?.videos || 0}</p>
              <p className="text-sm text-slate-500">Vídeos</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
