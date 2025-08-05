import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, LogOut, Shield, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PostEditor from '@/components/PostEditor';
import CalendarGrid from '@/components/CalendarGrid';
import PostsSidebar from '@/components/PostsSidebar';
import { getPostsFromStorage, savePostToStorage, deletePostFromStorage, migrateOldPosts } from '@/lib/storage';
import { logoutUser } from '@/lib/auth';

const CalendarManager = ({ user, onLogout }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [posts, setPosts] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const { toast } = useToast();

  const isEditor = user?.role === 'editor';

  useEffect(() => {
    const loadedPosts = migrateOldPosts();
    setPosts(loadedPosts);
  }, []);

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    const dateKey = formatDateKey(date);
    if (posts[dateKey]) {
      setEditingPost(posts[dateKey]);
    } else {
      setEditingPost(null);
    }
    setShowEditor(true);
  };

  const handleSavePost = (postData) => {
    if (!isEditor) {
      toast({
        title: "Acesso negado",
        description: "Apenas editores podem criar ou modificar postagens.",
        variant: "destructive"
      });
      return;
    }

    const dateKey = formatDateKey(selectedDate);
    const savedPost = savePostToStorage(dateKey, {
      ...postData,
      createdBy: user.id,
      createdByName: user.name
    });
    setPosts(prev => ({
      ...prev,
      [dateKey]: savedPost
    }));
    setShowEditor(false);
    setEditingPost(null);
    toast({
      title: "Postagem salva!",
      description: "Sua postagem foi salva com sucesso.",
    });
  };

  const handleDeletePost = (date) => {
    if (!isEditor) {
      toast({
        title: "Acesso negado",
        description: "Apenas editores podem excluir postagens.",
        variant: "destructive"
      });
      return;
    }

    const dateKey = formatDateKey(date);
    deletePostFromStorage(dateKey);
    setPosts(prev => {
      const newPosts = { ...prev };
      delete newPosts[dateKey];
      return newPosts;
    });
    toast({
      title: "Postagem excluída",
      description: "A postagem foi removida do calendário.",
    });
  };

  const handleExportPost = (date) => {
    const dateKey = formatDateKey(date);
    const post = posts[dateKey];
    if (!post) return;

    const allMedia = [...(post.feedMedia || []), ...(post.storyMedia || [])];
    
    if (allMedia.length === 0) {
      toast({
        title: "Nenhuma mídia",
        description: "Esta postagem não possui mídia para exportar.",
        variant: "destructive"
      });
      return;
    }

    allMedia.forEach((media, index) => {
      const isStoryMedia = index >= (post.feedMedia?.length || 0);
      const mediaType = isStoryMedia ? 'story' : 'feed';
      const mediaIndex = isStoryMedia ? index - (post.feedMedia?.length || 0) + 1 : index + 1;
      const extension = media.type === 'video' ? 'mp4' : 'png';
      const filename = `${dateKey}_${mediaType}_${mediaIndex}.${extension}`;
      
      const link = document.createElement('a');
      link.href = media.url;
      link.download = filename;
      link.click();
    });

    toast({
      title: "Mídia exportada!",
      description: `${allMedia.length} arquivo(s) foram baixados.`,
    });
  };

  const handleLogout = () => {
    logoutUser();
    onLogout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Calendário de Postagens</h1>
                <p className="text-sm text-muted-foreground">Gerencie suas postagens de forma organizada</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-secondary/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {isEditor ? (
                    <Shield className="h-4 w-4 text-green-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isEditor 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {isEditor ? 'Editor' : 'Leitor'}
                </span>
              </div>

              {isEditor && (
                <Button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setEditingPost(null);
                    setShowEditor(true);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nova Postagem</span>
                </Button>
              )}

              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <CalendarGrid
              currentDate={currentDate}
              posts={posts}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              onNavigateMonth={navigateMonth}
              formatDateKey={formatDateKey}
            />
          </div>

          <div className="lg:col-span-1">
            <PostsSidebar
              posts={posts}
              isEditor={isEditor}
              onExportPost={handleExportPost}
              onDeletePost={handleDeletePost}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEditor && (
          <PostEditor
            selectedDate={selectedDate}
            existingPost={editingPost}
            onSave={handleSavePost}
            onClose={() => {
              setShowEditor(false);
              setEditingPost(null);
            }}
            user={user}
            isEditor={isEditor}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarManager;