import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Image as ImageIcon, Trash2, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import MediaUploader from '@/components/MediaUploader';
import InstagramPublisher from '@/components/InstagramPublisher';
import PostScheduler from '@/components/PostScheduler';
import api from '@/lib/api';

const PostEditorSimple = ({ post, selectedDate, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    platform: post?.platform || 'INSTAGRAM',
    scheduledAt: selectedDate ? selectedDate.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    mediaUrls: post?.mediaUrls || [],
    hashtags: post?.hashtags || [],
    publishMode: post?.publishMode || 'MANUAL',
    autoPublish: post?.autoPublish || false
  });
  const [saving, setSaving] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        platform: formData.platform,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        mediaUrls: formData.mediaUrls,
        status: 'SCHEDULED'
      };

      let response;
      if (post) {
        // Atualizar post existente
        response = await api.put(`/posts/${post._id}`, postData);
      } else {
        // Criar novo post
        response = await api.post('/posts', postData);
      }
      
      toast({
        title: "Sucesso!",
        description: post ? "Post atualizado com sucesso" : "Post criado com sucesso",
      });
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao salvar o post",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUploaded = (uploadedFiles) => {
    const mediaUrls = uploadedFiles.map(file => file.data.url);
    setFormData(prev => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, ...mediaUrls]
    }));
    setShowMediaUploader(false);
    
    toast({
      title: "Sucesso!",
      description: `${uploadedFiles.length} imagem(ns) adicionada(s)`,
    });
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {post ? 'Editar Post' : 'Novo Post'}
              </h2>
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

          {/* Content */}
          <div className="p-6">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'content' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Conteúdo
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'schedule' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Agendamento
              </button>
              {post && (
                <button
                  onClick={() => setActiveTab('publish')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'publish' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Publicar
                </button>
              )}
            </div>

            {/* Tab Content */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título do Post
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do post..."
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conteúdo
                    </label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Escreva o conteúdo do seu post..."
                      rows={6}
                      className="w-full"
                    />
                  </div>

                  {/* Área de Mídia */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Imagens do Post
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMediaUploader(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Imagens
                      </Button>
                    </div>

                    {/* Grid de Imagens */}
                    {formData.mediaUrls.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 border border-gray-200 rounded-lg">
                        {formData.mediaUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={`http://localhost:5000${url}`}
                              alt={`Mídia ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeMedia(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nenhuma imagem adicionada</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMediaUploader(true)}
                          className="mt-2 text-purple-600 hover:text-purple-700"
                        >
                          Clique para adicionar imagens
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Agendamento
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                      className="w-full"
                      required
                    />
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <PostScheduler 
                  post={{...post, ...formData}}
                  onUpdate={(updatedPost) => {
                    setFormData(prev => ({
                      ...prev,
                      publishMode: updatedPost.publishMode,
                      autoPublish: updatedPost.autoPublish,
                      scheduledAt: updatedPost.scheduledAt ? updatedPost.scheduledAt.toISOString().slice(0, 16) : prev.scheduledAt
                    }));
                  }}
                />
              )}

              {activeTab === 'publish' && post && (
                <InstagramPublisher 
                  post={{...post, ...formData}} 
                  onPublishSuccess={() => {
                    toast({
                      title: "Sucesso!",
                      description: "Post publicado no Instagram com sucesso!",
                    });
                    onSave();
                  }}
                />
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* MediaUploader Modal */}
        {showMediaUploader && (
          <MediaUploader
            onClose={() => setShowMediaUploader(false)}
            onUpload={handleMediaUploaded}
            maxFiles={10}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PostEditorSimple;
