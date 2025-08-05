import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Instagram,
  Image as ImageIcon,
  Video,
  Calendar,
  Clock,
  Hash,
  Type,
  MapPin,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Upload,
  X,
  Plus,
  Smile,
  Save,
  Send,
  AlertCircle,
  Camera,
  Settings,
  Zap,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { postsAPI, mediaAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import MediaUploader from '@/components/MediaUploader';

const InstagramPreview = ({ post, selectedMedia }) => {
  const previewMedia = selectedMedia || (post.media && post.media[0]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-sm mx-auto"
    >
      {/* Instagram Header */}
      <div className="flex items-center space-x-3 p-4">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
          <Instagram className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-medium text-slate-900">@sua_empresa</p>
          <p className="text-sm text-slate-500">{post.location || 'São Paulo, Brasil'}</p>
        </div>
        <div className="ml-auto">
          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
        </div>
      </div>

      {/* Media Content */}
      <div className="aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 relative">
        {previewMedia ? (
          previewMedia.type?.startsWith('image/') ? (
            <img 
              src={previewMedia.url || URL.createObjectURL(previewMedia)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : previewMedia.type?.startsWith('video/') ? (
            <video 
              src={previewMedia.url || URL.createObjectURL(previewMedia)}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <Camera className="w-16 h-16 text-purple-400 mb-3" />
              <p className="text-sm text-purple-600 font-medium">Preview da mídia</p>
            </div>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <ImageIcon className="w-16 h-16 text-purple-400 mb-3" />
            <p className="text-sm text-purple-600 font-medium">Adicione uma imagem ou vídeo</p>
          </div>
        )}
        
        {/* Post Type Indicator */}
        {post.type && (
          <div className="absolute top-4 right-4">
            {post.type === 'STORY' && (
              <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Stories
              </div>
            )}
            {post.type === 'REEL' && (
              <div className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Reels
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Heart className="w-6 h-6 text-slate-400" />
            <MessageCircle className="w-6 h-6 text-slate-400" />
            <Share className="w-6 h-6 text-slate-400" />
          </div>
          <div className="text-slate-400">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <p className="text-sm mb-2">
          <span className="font-medium">247 curtidas</span>
        </p>
        
        {/* Caption Preview */}
        {post.content && (
          <div className="text-sm text-slate-900">
            <span className="font-medium">@sua_empresa</span> {post.content}
          </div>
        )}
        
        {/* Hashtags Preview */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-2 text-sm">
            {post.hashtags.split(' ').map((tag, index) => (
              <span key={index} className="text-purple-600 mr-1">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center mt-3 text-xs text-slate-400">
          <Clock className="w-3 h-3 mr-1" />
          {post.scheduledAt ? 
            `Agendado para ${new Date(post.scheduledAt).toLocaleDateString('pt-BR')}` :
            'Agora mesmo'
          }
        </div>
      </div>
    </motion.div>
  );
};

const HashtagSuggestions = ({ onSelect, currentContent }) => {
  const popularHashtags = [
    '#instagram', '#marketing', '#socialmedia', '#digital', '#business',
    '#branding', '#content', '#engagement', '#growth', '#strategy',
    '#success', '#entrepreneur', '#lifestyle', '#inspiration', '#motivation'
  ];
  
  const [suggestions, setSuggestions] = useState(popularHashtags);
  
  useEffect(() => {
    // Filter suggestions based on current content
    const used = currentContent.toLowerCase().split(' ').filter(word => word.startsWith('#'));
    const filtered = popularHashtags.filter(tag => 
      !used.some(usedTag => usedTag.includes(tag.substring(1)))
    );
    setSuggestions(filtered.slice(0, 10));
  }, [currentContent]);
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">Hashtags Sugeridas:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((hashtag) => (
          <button
            key={hashtag}
            onClick={() => onSelect(hashtag)}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
          >
            {hashtag}
          </button>
        ))}
      </div>
    </div>
  );
};

const PostEditor = ({ post, onSave, onCancel, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    hashtags: post?.hashtags || '',
    location: post?.location || '',
    platform: post?.platform || 'INSTAGRAM',
    type: post?.type || 'FEED',
    status: post?.status || 'DRAFT',
    scheduledAt: post?.scheduledAt || '',
    media: post?.media || []
  });
  
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [errors, setErrors] = useState({});
  const [charCount, setCharCount] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  
  const maxChars = formData.type === 'STORY' ? 150 : 2200;
  
  useEffect(() => {
    setCharCount(formData.content.length);
  }, [formData.content]);
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: postsAPI.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast({ title: 'Post criado com sucesso!' });
      navigate('/posts');
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao criar post',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => postsAPI.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast({ title: 'Post atualizado com sucesso!' });
      if (onSave) onSave();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar post',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    }
    
    if (formData.content.length > maxChars) {
      newErrors.content = `Conteúdo excede ${maxChars} caracteres`;
    }
    
    if (formData.status === 'SCHEDULED' && !formData.scheduledAt) {
      newErrors.scheduledAt = 'Data de agendamento é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Erro na validação',
        description: 'Por favor, corrija os erros antes de continuar',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      if (mode === 'edit' && post?.id) {
        await updateMutation.mutateAsync({ id: post.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };
  
  const handleSaveDraft = async () => {
    const draftData = { ...formData, status: 'DRAFT' };
    try {
      if (mode === 'edit' && post?.id) {
        await updateMutation.mutateAsync({ id: post.id, data: draftData });
      } else {
        await createMutation.mutateAsync(draftData);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };
  
  const handleMediaUpload = (uploadedFiles) => {
    const newMediaFiles = uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      type: file.type,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...newMediaFiles]
    }));
    
    if (newMediaFiles.length > 0) {
      setSelectedMedia(newMediaFiles[0]);
    }
    
    setShowMediaUploader(false);
  };
  
  const handleRemoveMedia = (mediaId) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter(m => m.id !== mediaId)
    }));
    
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia(formData.media[0] || null);
    }
  };
  
  const addHashtag = (hashtag) => {
    const currentHashtags = formData.hashtags;
    const newHashtags = currentHashtags ? `${currentHashtags} ${hashtag}` : hashtag;
    handleInputChange('hashtags', newHashtags);
  };
  
  const isLoading = createMutation.isPending || updateMutation.isPending;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {mode === 'edit' ? 'Editar Post' : 'Criar Novo Post'}
            </h1>
            <p className="text-slate-600 mt-1">
              Crie conteúdo incrível para o Instagram
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onCancel || (() => navigate('/posts'))}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {formData.status === 'SCHEDULED' ? 'Agendar' : 'Publicar'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tipo de Post</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'FEED', label: 'Feed', icon: Instagram, color: 'purple' },
                  { value: 'STORY', label: 'Stories', icon: Camera, color: 'pink' },
                  { value: 'REEL', label: 'Reels', icon: Video, color: 'blue' }
                ].map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => handleInputChange('type', value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === value
                        ? `border-${color}-600 bg-${color}-50`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      formData.type === value ? `text-${color}-600` : 'text-slate-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      formData.type === value ? `text-${color}-600` : 'text-slate-600'
                    }`}>
                      {label}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações Básicas</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título do Post
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Lançamento do novo produto..."
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Localização
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="São Paulo, Brasil"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Conteúdo</h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${
                    charCount > maxChars ? 'text-red-500' : 
                    charCount > maxChars * 0.8 ? 'text-yellow-500' : 'text-slate-500'
                  }`}>
                    {charCount}/{maxChars}
                  </span>
                </div>
              </div>
              
              <Textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Escreva a legenda do seu post aqui..."
                rows={6}
                className={`resize-none ${errors.content ? 'border-red-500' : ''}`}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.content}
                </p>
              )}
              
              {/* Hashtags */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hashtags
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    value={formData.hashtags}
                    onChange={(e) => handleInputChange('hashtags', e.target.value)}
                    placeholder="#marketing #instagram #socialmedia"
                    className="pl-10"
                  />
                </div>
                
                <div className="mt-4">
                  <HashtagSuggestions 
                    onSelect={addHashtag}
                    currentContent={formData.hashtags}
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Media Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Mídia</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowMediaUploader(true)}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Mídia
                </Button>
              </div>
              
              {formData.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.media.map((media) => (
                    <div 
                      key={media.id}
                      className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden ${
                        selectedMedia?.id === media.id ? 'border-purple-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedMedia(media)}
                    >
                      {media.type?.startsWith('image/') ? (
                        <img
                          src={media.url}
                          alt="Media preview"
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <div className="w-full h-24 bg-purple-100 flex items-center justify-center">
                          <Video className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMedia(media.id);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  onClick={() => setShowMediaUploader(true)}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Clique para adicionar fotos ou vídeos</p>
                  <p className="text-slate-500 text-sm mt-1">JPG, PNG, MP4 até 50MB</p>
                </div>
              )}
            </motion.div>
            
            {/* Publishing Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Opções de Publicação</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="DRAFT">Rascunho</option>
                    <option value="SCHEDULED">Agendar</option>
                    <option value="PUBLISHED">Publicar Agora</option>
                  </select>
                </div>
                
                {formData.status === 'SCHEDULED' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data e Hora de Publicação
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.scheduledAt ? 'border-red-500' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.scheduledAt && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.scheduledAt}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Preview do Instagram</h3>
                <InstagramPreview post={formData} selectedMedia={selectedMedia} />
                
                {/* Preview Stats */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center text-purple-600 mb-1">
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Curtidas</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">247</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-blue-600 mb-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Comentários</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">12</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center text-green-600 mb-1">
                        <Share className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Shares</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">5</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Media Uploader Modal */}
      <AnimatePresence>
        {showMediaUploader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Adicionar Mídia</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMediaUploader(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <MediaUploader onUpload={handleMediaUpload} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostEditor;
