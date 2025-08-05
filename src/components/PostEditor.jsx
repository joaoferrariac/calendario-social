import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Calendar, Clock, Image as ImageIcon, Video, Camera, 
  Grid, Hash, Type, Palette, Upload, Trash2, Eye, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import MediaUploader from '@/components/MediaUploader';
import { api } from '@/lib/api';

const PostEditor = ({ post, selectedDate, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scheduledAt: '',
    platform: 'INSTAGRAM',
    postType: 'FEED',
    mediaUrls: [],
    hashtags: []
  });
  const [hashtagInput, setHashtagInput] = useState('');
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
        platform: post.platform || 'INSTAGRAM',
        postType: post.postType || 'FEED',
        mediaUrls: post.mediaUrls || [],
        hashtags: post.hashtags || []
      });
    } else if (selectedDate) {
      const defaultDateTime = new Date(selectedDate);
      defaultDateTime.setHours(12, 0, 0, 0);
      setFormData(prev => ({
        ...prev,
        scheduledAt: defaultDateTime.toISOString().slice(0, 16)
      }));
    }
  }, [post, selectedDate]);

  const platforms = [
    { value: 'INSTAGRAM', label: 'Instagram', color: 'from-purple-500 to-pink-500' },
    { value: 'FACEBOOK', label: 'Facebook', color: 'from-blue-600 to-blue-700' },
    { value: 'TWITTER', label: 'Twitter', color: 'from-sky-400 to-sky-600' },
    { value: 'LINKEDIN', label: 'LinkedIn', color: 'from-blue-700 to-blue-800' },
    { value: 'TIKTOK', label: 'TikTok', color: 'from-gray-800 to-black' },
    { value: 'YOUTUBE', label: 'YouTube', color: 'from-red-600 to-red-700' }
  ];

  const postTypes = [
    { value: 'FEED', label: 'Post do Feed', icon: ImageIcon, desc: 'Post padrão no feed' },
    { value: 'STORY', label: 'Story', icon: Camera, desc: 'Story de 24 horas' },
    { value: 'REELS', label: 'Reels', icon: Video, desc: 'Vídeo curto vertical' },
    { value: 'CAROUSEL', label: 'Carrossel', icon: Grid, desc: 'Múltiplas imagens' },
    { value: 'IGTV', label: 'IGTV', icon: Video, desc: 'Vídeo longo' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddHashtag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const hashtag = hashtagInput.trim().replace('#', '');
      if (hashtag && !formData.hashtags.includes(hashtag)) {
        setFormData(prev => ({
          ...prev,
          hashtags: [...prev.hashtags, hashtag]
        }));
        setHashtagInput('');
      }
    }
  };

  const removeHashtag = (hashtag) => {
    setFormData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }));
  };

  const handleMediaUpload = (mediaFiles) => {
    const mediaUrls = mediaFiles.map(file => file.secure_url);
    setFormData(prev => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, ...mediaUrls]
    }));
    setShowMediaUploader(false);
    toast({
      title: "Sucesso!",
      description: `${mediaFiles.length} arquivo(s) adicionado(s)`,
    });
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.scheduledAt) {
      toast({
        title: "Erro",
        description: "Data e hora são obrigatórias",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        scheduledAt: new Date(formData.scheduledAt).toISOString()
      };

      if (post) {
        await api.put(`/posts/${post.id}`, payload);
        toast({
          title: "Sucesso!",
          description: "Post atualizado com sucesso",
        });
      } else {
        await api.post('/posts', payload);
        toast({
          title: "Sucesso!",
          description: "Post criado com sucesso",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao salvar post",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlatform = platforms.find(p => p.value === formData.platform);
  const selectedPostType = postTypes.find(p => p.value === formData.postType);

  const getCharacterLimit = () => {
    switch (formData.platform) {
      case 'TWITTER': return 280;
      case 'INSTAGRAM': return formData.postType === 'STORY' ? 0 : 2200;
      case 'LINKEDIN': return 3000;
      case 'FACEBOOK': return 63206;
      default: return 2200;
    }
  };

  const characterLimit = getCharacterLimit();
  const remainingChars = characterLimit - (formData.content?.length || 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className={`p-6 bg-gradient-to-r ${selectedPlatform.color} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedPostType && <selectedPostType.icon className="w-6 h-6" />}
                <div>
                  <h2 className="text-xl font-bold">
                    {post ? 'Editar Post' : 'Novo Post'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {selectedPlatform.label} • {selectedPostType?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-white hover:bg-white/20"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Formulário */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Digite o título do post"
                  className="w-full"
                  required
                />
              </div>

              {/* Plataforma e Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plataforma
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {platforms.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Post
                  </label>
                  <select
                    value={formData.postType}
                    onChange={(e) => handleInputChange('postType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {postTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Data e Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data e Hora da Publicação *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {/* Conteúdo */}
              {formData.postType !== 'STORY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type className="w-4 h-4 inline mr-1" />
                    Conteúdo
                    {characterLimit > 0 && (
                      <span className={`ml-2 text-xs ${remainingChars < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        {remainingChars} caracteres restantes
                      </span>
                    )}
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Escreva o conteúdo do seu post..."
                    className="w-full h-32"
                    maxLength={characterLimit || undefined}
                  />
                </div>
              )}

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Hashtags
                </label>
                <Input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleAddHashtag}
                  placeholder="Digite uma hashtag e pressione Enter"
                  className="w-full"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.hashtags.map((hashtag, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      #{hashtag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(hashtag)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Mídia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Mídia
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMediaUploader(true)}
                  className="w-full flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Adicionar Imagens/Vídeos
                </Button>
                
                {formData.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {formData.mediaUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Mídia ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview (se ativado) */}
            {previewMode && (
              <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${selectedPlatform.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedPlatform.label}
                    </span>
                  </div>
                  {formData.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{formData.title}</h4>
                  )}
                  {formData.content && (
                    <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">{formData.content}</p>
                  )}
                  {formData.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {formData.hashtags.map((hashtag, index) => (
                        <span key={index} className="text-blue-500 text-xs">
                          #{hashtag}
                        </span>
                      ))}
                    </div>
                  )}
                  {formData.mediaUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-1">
                      {formData.mediaUrls.slice(0, 4).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-16 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {post ? 'Atualizar' : 'Criar'} Post
                </>
              )}
            </Button>
          </div>

          {/* Modal de Upload de Mídia */}
          <AnimatePresence>
            {showMediaUploader && (
              <MediaUploader
                onClose={() => setShowMediaUploader(false)}
                onUpload={handleMediaUpload}
                maxFiles={10}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostEditor;
