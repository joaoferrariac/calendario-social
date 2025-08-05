
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Lock, Copy, Check, FileText, Save, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import MediaUploader from '@/components/MediaUploader';
import MediaGrid from '@/components/MediaGrid';

const PostEditor = ({ selectedDate, existingPost, onSave, onClose, user, isEditor }) => {
  const [caption, setCaption] = useState(existingPost?.caption || '');
  const [feedMedia, setFeedMedia] = useState(existingPost?.feedMedia || existingPost?.images?.map(img => ({ url: img, type: 'image' })) || []);
  const [storyMedia, setStoryMedia] = useState(existingPost?.storyMedia || existingPost?.storyImages?.map(img => ({ url: img, type: 'image' })) || []);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();

  const MAX_MEDIA = 10;

  const handleSave = async () => {
    if (!isEditor) {
      toast({
        title: "Acesso negado",
        description: "Apenas editores podem salvar postagens.",
        variant: "destructive"
      });
      return;
    }

    if (!caption.trim() && feedMedia.length === 0 && storyMedia.length === 0) {
      toast({
        title: "Conteúdo necessário",
        description: "Adicione pelo menos uma legenda ou mídia.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave({
        caption: caption.trim(),
        feedMedia,
        storyMedia,
        createdAt: existingPost?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a postagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyCaption = async () => {
    if (!caption.trim()) {
      toast({
        title: "Nenhuma legenda",
        description: "Não há legenda para copiar.",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      toast({
        title: "Legenda copiada!",
        description: "A legenda foi copiada para a área de transferência.",
      });
      setTimeout(() => setCopiedCaption(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a legenda.",
        variant: "destructive"
      });
    }
  };

  const exportMedia = () => {
    const allMedia = [...feedMedia, ...storyMedia];
    if (allMedia.length === 0) {
      toast({
        title: "Nenhuma mídia",
        description: "Não há mídia para exportar.",
        variant: "destructive"
      });
      return;
    }

    const dateStr = selectedDate?.toISOString().split('T')[0] || 'postagem';
    
    allMedia.forEach((media, index) => {
      const isStoryMedia = index >= feedMedia.length;
      const mediaType = isStoryMedia ? 'story' : 'feed';
      const mediaIndex = isStoryMedia ? index - feedMedia.length + 1 : index + 1;
      const extension = media.type === 'video' ? 'mp4' : 'png';
      const filename = `${dateStr}_${mediaType}_${mediaIndex}.${extension}`;
      
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

  const formatDate = (date) => {
    return date?.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const hasChanges = () => {
    if (!existingPost) return caption.trim() || feedMedia.length > 0 || storyMedia.length > 0;
    
    return (
      caption !== (existingPost.caption || '') ||
      JSON.stringify(feedMedia) !== JSON.stringify(existingPost.feedMedia || []) ||
      JSON.stringify(storyMedia) !== JSON.stringify(existingPost.storyMedia || [])
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
              <span>{existingPost ? 'Visualizar Postagem' : 'Nova Postagem'}</span>
              {!isEditor && <Lock className="h-4 w-4 text-muted-foreground" />}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatDate(selectedDate)}
            </p>
            {!isEditor && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Modo somente leitura - Apenas editores podem modificar postagens
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportMedia}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="post-layout space-y-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Postagem {selectedDate?.toLocaleDateString('pt-BR')}
              </h3>
            </div>

            {feedMedia.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-foreground">
                  Mídia do Feed (1080x1350)
                </h4>
                <MediaGrid
                  media={feedMedia}
                  onRemove={(index) => setFeedMedia(prev => prev.filter((_, i) => i !== index))}
                  isEditor={isEditor}
                  type="feed"
                />
              </div>
            )}

            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-md font-medium text-foreground">
                <FileText className="h-4 w-4" />
                <span>Legenda</span>
              </label>
              <textarea
                value={caption}
                onChange={(e) => isEditor && setCaption(e.target.value)}
                placeholder={isEditor ? "Escreva a legenda da sua postagem..." : "Nenhuma legenda disponível"}
                className={`w-full h-32 p-4 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary ${
                  !isEditor ? 'cursor-not-allowed opacity-75' : ''
                }`}
                readOnly={!isEditor}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {caption.length} caracteres
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyCaption}
                  className="copy-button flex items-center space-x-2"
                  disabled={!caption.trim()}
                >
                  {copiedCaption ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{copiedCaption ? 'Copiado!' : 'Copiar Legenda'}</span>
                </Button>
              </div>
            </div>

            {storyMedia.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-foreground">
                  Stories (1080x1920)
                </h4>
                <MediaGrid
                  media={storyMedia}
                  onRemove={(index) => setStoryMedia(prev => prev.filter((_, i) => i !== index))}
                  isEditor={isEditor}
                  type="story"
                />
              </div>
            )}

            {isEditor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                <MediaUploader
                  title="Adicionar Mídia do Feed"
                  subtitle="Imagens e vídeos (1080x1350)"
                  media={feedMedia}
                  onMediaAdd={setFeedMedia}
                  maxMedia={MAX_MEDIA}
                  acceptedFormats="image/*,video/*"
                />

                <MediaUploader
                  title="Adicionar Stories"
                  subtitle="Imagens e vídeos (1080x1920)"
                  media={storyMedia}
                  onMediaAdd={setStoryMedia}
                  maxMedia={MAX_MEDIA}
                  acceptedFormats="image/*,video/*"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border bg-secondary/20">
          <div className="flex items-center space-x-2">
            {isEditor && hasChanges() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 text-sm text-muted-foreground"
              >
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span>Alterações não salvas</span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              {isEditor ? 'Cancelar' : 'Fechar'}
            </Button>
            {isEditor && (
              <Button 
                onClick={handleSave}
                disabled={isSaving || !hasChanges()}
                className="flex items-center space-x-2 min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    {existingPost ? <Edit className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    <span>{existingPost ? 'Atualizar' : 'Salvar'} Postagem</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PostEditor;
