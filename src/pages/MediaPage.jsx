import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Download, 
  Search, 
  Grid3X3, 
  List,
  FileImage,
  FileVideo,
  Eye,
  X,
  Play
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { mediaAPI, handleApiError, formatFileSize } from '@/lib/api';

const MediaPage = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filterType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mediaData, statsData] = await Promise.all([
        mediaAPI.getFiles({ type: filterType !== 'all' ? filterType : undefined }),
        mediaAPI.getStats()
      ]);
      
      setFiles(mediaData.files || []);
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar mídia:', error);
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

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    // Verificar limite de tamanho (50MB máximo por arquivo)
    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = selectedFiles.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Arquivos muito grandes",
        description: `${oversizedFiles.length} arquivo(s) excedem o limite de 50MB`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      await mediaAPI.uploadMultipleFiles(selectedFiles, (progress) => {
        setUploadProgress(progress);
      });
      
      toast({
        title: "Sucesso!",
        description: `${selectedFiles.length} arquivo(s) enviado(s) com sucesso`,
      });
      
      loadData();
    } catch (error) {
      console.error('Erro no upload:', error);
      const errorData = handleApiError(error);
      toast({
        title: "Erro",
        description: errorData.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setShowUploader(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Tem certeza que deseja deletar este arquivo?')) return;
    
    try {
      await mediaAPI.deleteFile(fileId);
      toast({
        title: "Sucesso!",
        description: "Arquivo deletado com sucesso",
      });
      loadData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      const errorData = handleApiError(error);
      toast({
        title: "Erro",
        description: errorData.message,
        variant: "destructive"
      });
    }
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName || `media_${file.id}`;
    link.target = '_blank';
    link.click();
  };

  const filteredFiles = files.filter(file => {
    if (!searchTerm) return true;
    return file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
           file.originalName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Funções para detectar tipo de mídia (mimeType ou base64)
  const isImage = (file) => {
    if (file.mimeType?.startsWith('image/')) return true;
    if (file.url?.startsWith('data:image/')) return true;
    return false;
  };
  
  const isVideo = (file) => {
    if (file.mimeType?.startsWith('video/')) return true;
    if (file.url?.startsWith('data:video/')) return true;
    return false;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Biblioteca de Mídia
            </h1>
            <p className="text-gray-600">Gerencie suas imagens e vídeos</p>
          </div>
          
          <Button 
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileImage className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total de arquivos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.images}</p>
                  <p className="text-sm text-gray-500">Imagens</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Video className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.videos}</p>
                  <p className="text-sm text-gray-500">Vídeos</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileVideo className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
                  <p className="text-sm text-gray-500">Tamanho total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              Todos
            </Button>
            <Button
              variant={filterType === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('image')}
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Imagens
            </Button>
            <Button
              variant={filterType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('video')}
            >
              <Video className="w-4 h-4 mr-1" />
              Vídeos
            </Button>
          </div>

          <div className="flex items-center gap-1">
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

        {/* Upload Modal */}
        {showUploader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploader(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload de Arquivos</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowUploader(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Arraste arquivos ou clique para selecionar</p>
                  <p className="text-sm text-gray-400">Formatos suportados:</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <span className="font-medium">Imagens:</span> JPG, PNG, GIF, WebP, SVG
                  </p>
                  <p className="text-xs text-gray-400">
                    <span className="font-medium">Vídeos:</span> MP4, WebM, MOV, AVI, MKV, OGV
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/ogg"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              
              {uploading && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">{uploadProgress}% concluído</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Preview Modal */}
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewFile(null)}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setPreviewFile(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            {isImage(previewFile) ? (
              <img 
                src={previewFile.url} 
                alt={previewFile.originalName}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video 
                src={previewFile.url} 
                controls
                className="max-w-full max-h-[90vh]"
              />
            )}
          </motion.div>
        )}

        {/* Files Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando arquivos...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum arquivo encontrado</h3>
            <p className="text-gray-500 mb-4">Faça upload de imagens e vídeos para começar</p>
            <Button onClick={() => setShowUploader(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="aspect-square bg-gray-100 relative">
                  {isImage(file) ? (
                    <img 
                      src={file.url} 
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <video 
                        src={file.url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-700 ml-1" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setPreviewFile(file)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate">{file.originalName || file.filename}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y">
            {filteredFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {isImage(file) ? (
                    <img 
                      src={file.url} 
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <video 
                        src={file.url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-gray-700 ml-0.5" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.originalName || file.filename}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewFile(file)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(file.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MediaPage;
