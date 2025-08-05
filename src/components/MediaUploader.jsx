import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Image as ImageIcon, Video, X, FileText, 
  Cloud, Check, AlertCircle, Trash2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';

const MediaUploader = ({ onClose, onUpload, maxFiles = 10 }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const acceptedTypes = {
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
    'image/webp': 'WebP',
    'video/mp4': 'MP4',
    'video/quicktime': 'MOV',
    'video/webm': 'WebM'
  };

  const validateFile = (file) => {
    // Verificar tipo
    if (!acceptedTypes[file.type]) {
      return { valid: false, error: 'Tipo de arquivo não suportado' };
    }

    // Verificar tamanho (50MB para vídeos, 10MB para imagens)
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = file.type.startsWith('video/') ? '50MB' : '10MB';
      return { valid: false, error: `Arquivo muito grande. Máximo: ${maxSizeMB}` };
    }

    return { valid: true };
  };

  const processFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList);
    
    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: "Limite excedido",
        description: `Máximo de ${maxFiles} arquivos permitidos`,
        variant: "destructive"
      });
      return;
    }

    const validFiles = [];
    const errors = [];

    newFiles.forEach((file, index) => {
      const validation = validateFile(file);
      if (validation.valid) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev => [...prev, {
            id: `${Date.now()}-${index}`,
            file,
            preview: e.target.result,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            name: file.name,
            size: file.size,
            status: 'ready'
          }]);
        };
        reader.readAsDataURL(file);
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Alguns arquivos foram rejeitados",
        description: errors.join(', '),
        variant: "destructive"
      });
    }
  }, [files.length, maxFiles, toast]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "Nenhum arquivo",
        description: "Selecione pelo menos um arquivo para upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const uploadedFiles = [];

      for (const fileData of files) {
        const formData = new FormData();
        formData.append('file', fileData.file);

        setFiles(prev => prev.map(f => 
          f.id === fileData.id ? { ...f, status: 'uploading' } : f
        ));

        try {
          const response = await api.post('/media/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          uploadedFiles.push(response.data);
          
          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'completed' } : f
          ));
        } catch (error) {
          console.error(`Erro ao fazer upload de ${fileData.name}:`, error);
          setFiles(prev => prev.map(f => 
            f.id === fileData.id ? { ...f, status: 'error' } : f
          ));
        }
      }

      if (uploadedFiles.length > 0) {
        onUpload(uploadedFiles);
        toast({
          title: "Upload concluído!",
          description: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
        });
      }
    } catch (error) {
      console.error('Erro geral no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Erro ao fazer upload dos arquivos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Upload de Mídia</h2>
                  <p className="text-white/80 text-sm">
                    Imagens e vídeos para suas postagens
                  </p>
                </div>
              </div>
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

          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Área de Drop */}
            <div
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Suporta: JPEG, PNG, GIF, WebP, MP4, MOV, WebM
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Max: 10MB (imagens) | 50MB (vídeos) | {maxFiles} arquivos
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Selecionar Arquivos
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>

            {/* Lista de Arquivos */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-medium text-gray-900">
                  Arquivos Selecionados ({files.length}/{maxFiles})
                </h3>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* Preview */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {file.type === 'image' ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {acceptedTypes[file.file.type]}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        {file.status === 'ready' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
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
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar {files.length} arquivo(s)
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaUploader;
