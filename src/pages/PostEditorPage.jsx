import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  X,
  Upload,
  Eye,
  Send,
  Play
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { postsAPI, mediaAPI, handleApiError } from '@/lib/api';

// Função para verificar se é vídeo pelo mimeType, base64 ou extensão da URL
const isVideoFile = (file) => {
  if (file?.mimeType?.startsWith('video/')) return true;
  if (file?.url) {
    // Detectar por data URL (base64)
    if (file.url.startsWith('data:video/')) return true;
    // Detectar por extensão
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.ogv', '.ogg'];
    const url = file.url.toLowerCase();
    return videoExtensions.some(ext => url.includes(ext));
  }
  return false;
};

const PostEditorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Capturar data da URL (vindo do calendário)
  const dateFromUrl = searchParams.get('date');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    scheduledDate: dateFromUrl || '',
    scheduledTime: '',
    status: 'DRAFT',
    mediaUrl: null,
  });

  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPost(id);
      const post = response.post;
      
      const scheduledDate = post.scheduledDate 
        ? new Date(post.scheduledDate).toISOString().split('T')[0] 
        : '';
      const scheduledTime = post.scheduledDate
        ? new Date(post.scheduledDate).toTimeString().slice(0, 5)
        : '';
      
      setFormData({
        title: post.title || '',
        content: post.content || '',
        scheduledDate,
        scheduledTime,
        status: post.status || 'DRAFT',
        mediaUrl: post.mediaUrl || null,
      });
      
      if (post.mediaUrl) {
        setMediaFiles([{ url: post.mediaUrl, name: 'Imagem atual' }]);
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      const errorData = handleApiError(error);
      toast({
        title: "Erro",
        description: errorData.message,
        variant: "destructive"
      });
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingMedia(true);
    
    try {
      const file = files[0]; // Por enquanto, só uma mídia
      
      // Verificar limite de tamanho (50MB máximo)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 50MB",
          variant: "destructive"
        });
        setUploadingMedia(false);
        return;
      }
      
      const result = await mediaAPI.uploadFile(file);
      
      setMediaFiles([{ 
        url: result.file.url, 
        name: file.name,
        mimeType: file.type 
      }]);
      setFormData(prev => ({ ...prev, mediaUrl: result.file.url }));
      
      const isVideo = file.type.startsWith('video/');
      toast({
        title: "Upload concluído",
        description: isVideo ? "Vídeo adicionado com sucesso" : "Imagem adicionada com sucesso",
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      const errorData = handleApiError(error);
      toast({
        title: "Erro no upload",
        description: errorData.message,
        variant: "destructive"
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = () => {
    setMediaFiles([]);
    setFormData(prev => ({ ...prev, mediaUrl: null }));
  };

  const handleSubmit = async (status = 'DRAFT') => {
    if (!formData.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para o post",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      let scheduledDate = null;
      if (formData.scheduledDate) {
        const dateStr = formData.scheduledTime 
          ? `${formData.scheduledDate}T${formData.scheduledTime}:00`
          : `${formData.scheduledDate}T12:00:00`;
        scheduledDate = new Date(dateStr).toISOString();
      }

      const postData = {
        title: formData.title,
        content: formData.content,
        scheduledDate,
        status,
        mediaUrl: formData.mediaUrl,
      };

      if (isEditing) {
        await postsAPI.updatePost(id, postData);
        toast({
          title: "Post atualizado",
          description: "As alterações foram salvas com sucesso",
        });
      } else {
        await postsAPI.createPost(postData);
        toast({
          title: "Post criado",
          description: status === 'SCHEDULED' 
            ? "Post agendado com sucesso" 
            : "Rascunho salvo com sucesso",
        });
      }

      navigate('/posts');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      const errorData = handleApiError(error);
      toast({
        title: "Erro ao salvar",
        description: errorData.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Carregando post...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/posts')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Post' : 'Novo Post'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleSubmit('DRAFT')}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600"
              onClick={() => handleSubmit('SCHEDULED')}
              disabled={saving || !formData.scheduledDate}
            >
              <Send className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Agendar'}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Título */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Post *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Digite o título do post..."
                className="text-lg"
              />
            </div>

            {/* Conteúdo */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo / Legenda
              </label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Escreva o conteúdo do seu post..."
                rows={6}
                className="resize-none"
              />
              <div className="mt-2 text-right text-sm text-gray-500">
                {formData.content.length} caracteres
              </div>
            </div>

            {/* Upload de Mídia */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Mídia
              </label>
              
              {mediaFiles.length > 0 ? (
                <div className="relative">
                  {isVideoFile(mediaFiles[0]) ? (
                    <video 
                      src={mediaFiles[0].url}
                      controls
                      className="w-full h-64 object-cover rounded-lg bg-black"
                    />
                  ) : (
                    <img 
                      src={mediaFiles[0].url} 
                      alt="Preview" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeMedia}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                    {uploadingMedia ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                        <p className="text-gray-500">Enviando...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-2">Arraste uma mídia ou clique para selecionar</p>
                        <p className="text-sm text-gray-400">Imagens: PNG, JPG, GIF, WebP</p>
                        <p className="text-sm text-gray-400">Vídeos: MP4, WebM, MOV</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={handleMediaUpload}
                    disabled={uploadingMedia}
                  />
                </label>
              )}
            </div>
          </motion.div>

          {/* Sidebar - Configurações */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Agendamento */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Agendamento
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <Input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário
                  </label>
                  <Input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Preview
              </h3>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Preview Header */}
                <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Sua Empresa</p>
                    <p className="text-xs text-gray-500">Agora</p>
                  </div>
                </div>
                
                {/* Preview Image/Video */}
                {mediaFiles.length > 0 ? (
                  isVideoFile(mediaFiles[0]) ? (
                    <div className="relative w-full aspect-square bg-black">
                      <video 
                        src={mediaFiles[0].url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-700 ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={mediaFiles[0].url} 
                      alt="Preview" 
                      className="w-full aspect-square object-cover"
                    />
                  )
                ) : (
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                
                {/* Preview Content */}
                <div className="p-3">
                  <p className="text-sm font-medium">{formData.title || 'Título do post'}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                    {formData.content || 'O conteúdo do seu post aparecerá aqui...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dica</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.scheduledDate 
                      ? `Post será publicado em ${new Date(formData.scheduledDate).toLocaleDateString('pt-BR')}`
                      : 'Selecione uma data para agendar o post'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PostEditorPage;
