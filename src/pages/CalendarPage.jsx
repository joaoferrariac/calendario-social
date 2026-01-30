import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Clock,
  CheckCircle,
  X,
  Edit,
  Trash2,
  Image as ImageIcon,
  Eye,
  Play
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { postsAPI, handleApiError } from '@/lib/api';

// Função para verificar se é vídeo pela URL ou base64
const isVideoUrl = (url) => {
  if (!url) return false;
  // Detectar por data URL (base64)
  if (url.startsWith('data:video/')) return true;
  // Detectar por extensão
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogv', '.ogg'];
  const urlLower = url.toLowerCase();
  return videoExtensions.some(ext => urlLower.includes(ext));
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts();
      const postsData = {};
      
      (response.posts || []).forEach(post => {
        const dateKey = new Date(post.scheduledDate || post.createdAt).toISOString().split('T')[0];
        if (!postsData[dateKey]) {
          postsData[dateKey] = [];
        }
        postsData[dateKey].push(post);
      });
      
      setPosts(postsData);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      const errorData = handleApiError(error);
      toast({
        title: "Erro",
        description: errorData.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleNavigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 0) {
      setCurrentDate(new Date());
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
      setCurrentDate(newDate);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Dias do mês anterior
    const prevMonth = new Date(year, month, 0);
    const prevDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevDays - i),
        isCurrentMonth: false
      });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Dias do próximo mês
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getPostsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return posts[dateKey] || [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500';
      case 'SCHEDULED': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'Publicado';
      case 'SCHEDULED': return 'Agendado';
      default: return 'Rascunho';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setShowDayModal(true);
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

  const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];
  const formattedSelectedDate = selectedDate 
    ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Calendário de Postagens
            </h1>
            <p className="text-gray-600">Visualize suas postagens de forma organizada</p>
          </div>
          
          <Button 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
            onClick={() => navigate('/posts/new')}
          >
            <Plus className="w-4 h-4" />
            Novo Post
          </Button>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigateMonth(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigateMonth(0)}
              >
                Hoje
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigateMonth(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando calendário...</p>
            </div>
          ) : (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth().map((day, index) => {
                  const dayPosts = getPostsForDate(day.date);
                  const today = isToday(day.date);
                  const hasPosts = dayPosts.length > 0;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleDayClick(day.date)}
                      className={`
                        min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all
                        ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${today ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-200'}
                        ${hasPosts ? 'hover:shadow-lg hover:border-purple-400' : 'hover:shadow-md hover:border-purple-300'}
                      `}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${today ? 'text-purple-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      `}>
                        {day.date.getDate()}
                      </div>
                      
                      {hasPosts && (
                        <div className="space-y-1">
                          {dayPosts.slice(0, 2).map((post, postIndex) => (
                            <div
                              key={postIndex}
                              className={`
                                text-xs p-1 rounded truncate text-white
                                ${getStatusColor(post.status)}
                              `}
                              title={post.title}
                            >
                              {post.title || 'Sem título'}
                            </div>
                          ))}
                          {dayPosts.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayPosts.length - 2} mais
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span>Rascunho</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>Agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span>Publicado</span>
          </div>
        </div>

        {/* Modal de Posts do Dia */}
        <AnimatePresence>
          {showDayModal && selectedDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDayModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 capitalize">
                      {formattedSelectedDate}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedDatePosts.length} {selectedDatePosts.length === 1 ? 'post' : 'posts'} neste dia
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDayModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                  {selectedDatePosts.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDatePosts.map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {/* Preview da mídia */}
                            <div className="flex-shrink-0">
                              {post.mediaUrl ? (
                                isVideoUrl(post.mediaUrl) ? (
                                  <div className="relative w-20 h-20 bg-black rounded-lg overflow-hidden">
                                    <video 
                                      src={post.mediaUrl}
                                      className="w-full h-full object-cover"
                                      muted
                                      preload="metadata"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <Play className="w-6 h-6 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <img 
                                    src={post.mediaUrl} 
                                    alt={post.title}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                )
                              ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Conteúdo do post */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {post.title || 'Sem título'}
                                </h3>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(post.status)}`}>
                                  {getStatusLabel(post.status)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {post.content || 'Sem conteúdo'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {post.scheduledDate 
                                    ? new Date(post.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                    : 'Sem horário'}
                                </span>
                              </div>
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowDayModal(false);
                                  navigate(`/posts/edit/${post.id}`);
                                }}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              >
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
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum post neste dia</h3>
                      <p className="text-sm text-gray-500 mb-4">Crie um novo post para esta data</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => {
                      setShowDayModal(false);
                      // Passar a data selecionada como parâmetro
                      const dateStr = formatDateKey(selectedDate);
                      navigate(`/posts/new?date=${dateStr}`);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Post para este Dia
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default CalendarPage;
