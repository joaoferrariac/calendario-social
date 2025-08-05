import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Calendar,
  Camera,
  Play,
  FileImage,
  FileVideo,
  Eye
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import MediaUploader from '@/components/MediaUploader';
import { useToast } from '@/components/ui/use-toast';
import { mediaAPI } from '@/lib/api';

const MediaPage = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar arquivos
  const { data: mediaData, isLoading, error } = useQuery({
    queryKey: ['media-files', { search: searchTerm, type: filterType }],
    queryFn: () => mediaAPI.getFiles({ 
      search: searchTerm, 
      type: filterType !== 'all' ? filterType : undefined 
    }),
    retry: 1
  });

  // Query para estatísticas
  const { data: statsData } = useQuery({
    queryKey: ['media-stats'],
    queryFn: mediaAPI.getStats,
    retry: 1
  });

  // Mutation para deletar arquivo
  const deleteMutation = useMutation({
    mutationFn: mediaAPI.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries(['media-files']);
      queryClient.invalidateQueries(['media-stats']);
      toast({
        title: "Sucesso!",
        description: "Arquivo deletado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao deletar arquivo",
        variant: "destructive"
      });
    }
  });

  const handleDelete = (fileId) => {
    if (window.confirm('Tem certeza que deseja deletar este arquivo?')) {
      deleteMutation.mutate(fileId);
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName || `media_${file.id}`;
    link.target = '_blank';
    link.click();
  };

  const handleUploadSuccess = () => {
    setShowUploader(false);
    queryClient.invalidateQueries(['media-files']);
    queryClient.invalidateQueries(['media-stats']);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const files = mediaData?.files || [];
  const stats = statsData || {};

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Galeria de Mídia
            </h1>
            <p className="text-gray-600">Gerencie seus arquivos de imagem e vídeo</p>
          </div>
          
          <Button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Upload className="w-4 h-4" />
            Upload Mídia
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileImage className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Arquivos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Imagens</p>
                <p className="text-2xl font-bold text-gray-900">{stats.imageCount || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-pink-100 rounded-lg">
                <FileVideo className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vídeos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.videoCount || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Espaço Usado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(stats.totalSize || 0)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar arquivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <option value="all">Todos os tipos</option>
                  <option value="image">Imagens</option>
                  <option value="video">Vídeos</option>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
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
        </div>

        {/* Galeria */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">Nenhum arquivo encontrado</p>
              <Button
                onClick={() => setShowUploader(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Fazer Upload
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Play className="w-16 h-16 text-white" />
                      <video
                        src={file.url}
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        muted
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(file)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(file.url, '_blank')}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(file.id)}
                        className="bg-red-500/80 hover:bg-red-600/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {file.originalName}
                    </p>
                    <p className="text-white/70 text-xs">
                      {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {file.type === 'image' ? 'Imagem' : 'Vídeo'} • {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Enviado em {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal do Media Uploader */}
      <AnimatePresence>
        {showUploader && (
          <MediaUploader
            onClose={() => setShowUploader(false)}
            onUpload={handleUploadSuccess}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default MediaPage;
