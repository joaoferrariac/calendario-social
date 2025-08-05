import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Send, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const InstagramPublisher = ({ post, onPublishSuccess }) => {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(post?.instagramPostId || false);
  const { toast } = useToast();

  const handlePublish = async () => {
    setPublishing(true);
    
    try {
      const response = await api.post(`/instagram/publish/${post._id}`);
      
      if (response.data.success) {
        setPublished(true);
        toast({
          title: "🎉 Sucesso!",
          description: response.data.message,
        });
        
        if (onPublishSuccess) {
          onPublishSuccess(response.data.instagramPostId);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Erro ao publicar no Instagram:', error);
      toast({
        title: "❌ Erro",
        description: error.response?.data?.message || "Erro ao publicar no Instagram",
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  };

  if (published) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
      >
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">
            Publicado no Instagram!
          </p>
          <p className="text-xs text-green-600">
            Post ID: {post.instagramPostId || 'Disponível após sincronização'}
          </p>
        </div>
        {post.instagramPostId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://www.instagram.com/p/${post.instagramPostId}`, '_blank')}
            className="text-green-600 border-green-200 hover:bg-green-100"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        )}
      </motion.div>
    );
  }

  // Verificar se o post tem requisitos mínimos
  const hasImages = post.mediaUrls && post.mediaUrls.length > 0;
  const hasContent = post.title && post.content;
  const canPublish = hasImages && hasContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Status de requisitos */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          {hasContent ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={hasContent ? 'text-green-700' : 'text-red-700'}>
            Título e conteúdo
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          {hasImages ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={hasImages ? 'text-green-700' : 'text-red-700'}>
            Pelo menos uma imagem
          </span>
        </div>
      </div>

      {/* Botão de publicação */}
      <Button
        onClick={handlePublish}
        disabled={!canPublish || publishing}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
      >
        {publishing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Publicando...
          </>
        ) : (
          <>
            <Instagram className="w-4 h-4 mr-2" />
            Publicar no Instagram
          </>
        )}
      </Button>

      {!canPublish && (
        <p className="text-xs text-gray-500 text-center">
          {!hasContent && "Adicione título e conteúdo. "}
          {!hasImages && "Adicione pelo menos uma imagem."}
        </p>
      )}

      {/* Preview da legenda */}
      {canPublish && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-2">Preview da legenda:</p>
          <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
            <p className="font-medium">{post.title}</p>
            <p className="mt-1">{post.content}</p>
            {post.hashtags && post.hashtags.length > 0 && (
              <p className="mt-2 text-blue-600">
                {post.hashtags.map(tag => `#${tag}`).join(' ')}
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InstagramPublisher;
