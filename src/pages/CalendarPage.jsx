import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Filter, Grid, List, Upload, Video, Image as ImageIcon, Camera } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import CalendarGrid from '@/components/CalendarGrid';
import PostEditor from '@/components/PostEditor';
import MediaUploader from '@/components/MediaUploader';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [posts, setPosts] = useState({});
  const [filteredPosts, setFilteredPosts] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [platformFilter, setPlatformFilter] = useState('all');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [posts, platformFilter, postTypeFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts');
      const postsData = {};
      
      response.data.forEach(post => {
        const dateKey = new Date(post.scheduledAt).toISOString().split('T')[0];
        if (!postsData[dateKey]) {
          postsData[dateKey] = [];
        }
        postsData[dateKey].push(post);
      });
      
      setPosts(postsData);
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

  const applyFilters = () => {
    let filtered = { ...posts };

    if (platformFilter !== 'all' || postTypeFilter !== 'all') {
      filtered = {};
      Object.keys(posts).forEach(dateKey => {
        const filteredPostsForDate = posts[dateKey].filter(post => {
          const platformMatch = platformFilter === 'all' || post.platform === platformFilter;
          const typeMatch = postTypeFilter === 'all' || post.postType === postTypeFilter;
          return platformMatch && typeMatch;
        });
        
        if (filteredPostsForDate.length > 0) {
          filtered[dateKey] = filteredPostsForDate;
        }
      });
    }

    setFilteredPosts(filtered);
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    const dateKey = formatDateKey(date);
    const postsForDate = filteredPosts[dateKey] || [];
    
    if (postsForDate.length === 1) {
      setEditingPost(postsForDate[0]);
    } else {
      setEditingPost(null);
    }
    setShowEditor(true);
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

  const handleCreatePost = () => {
    setEditingPost(null);
    setSelectedDate(new Date());
    setShowEditor(true);
  };

  const handlePostSaved = () => {
    setShowEditor(false);
    setEditingPost(null);
    loadPosts();
    toast({
      title: "Sucesso!",
      description: "Post salvo com sucesso",
    });
  };

  const handleMediaUploaded = (mediaData) => {
    setShowMediaUploader(false);
    // Aqui você pode fazer algo com os dados da mídia uploadada
    toast({
      title: "Sucesso!",
      description: "Mídia enviada com sucesso",
    });
  };

  const getPostTypeIcon = (postType) => {
    switch (postType) {
      case 'STORY': return <Camera className="w-4 h-4" />;
      case 'REELS': return <Video className="w-4 h-4" />;
      case 'CAROUSEL': return <Grid className="w-4 h-4" />;
      default: return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'INSTAGRAM': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'FACEBOOK': return 'bg-blue-600';
      case 'TWITTER': return 'bg-sky-500';
      case 'LINKEDIN': return 'bg-blue-700';
      case 'TIKTOK': return 'bg-black';
      case 'YOUTUBE': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

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
            <p className="text-gray-600">Gerencie suas postagens de forma visual e organizada</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMediaUploader(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Mídia
            </Button>
            <Button
              onClick={handleCreatePost}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4" />
              Novo Post
            </Button>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          <Select
            value={platformFilter}
            onValueChange={setPlatformFilter}
            className="w-40"
          >
            <option value="all">Todas as plataformas</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="TWITTER">Twitter</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="TIKTOK">TikTok</option>
            <option value="YOUTUBE">YouTube</option>
          </Select>

          <Select
            value={postTypeFilter}
            onValueChange={setPostTypeFilter}
            className="w-40"
          >
            <option value="all">Todos os tipos</option>
            <option value="FEED">Feed</option>
            <option value="STORY">Story</option>
            <option value="REELS">Reels</option>
            <option value="CAROUSEL">Carrossel</option>
            <option value="IGTV">IGTV</option>
          </Select>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Component */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando calendário...</p>
            </div>
          </div>
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            posts={filteredPosts}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            onNavigateMonth={handleNavigateMonth}
            formatDateKey={formatDateKey}
            getPostTypeIcon={getPostTypeIcon}
            getPlatformColor={getPlatformColor}
          />
        )}

        {/* Modals */}
        <AnimatePresence>
          {showEditor && (
            <PostEditor
              post={editingPost}
              selectedDate={selectedDate}
              onClose={() => setShowEditor(false)}
              onSave={handlePostSaved}
            />
          )}

          {showMediaUploader && (
            <MediaUploader
              onClose={() => setShowMediaUploader(false)}
              onUpload={handleMediaUploaded}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default CalendarPage;
