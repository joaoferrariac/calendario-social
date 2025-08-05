import React, { useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, Video } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MediaUploader = ({ 
  title, 
  subtitle, 
  media, 
  onMediaAdd, 
  maxMedia, 
  acceptedFormats 
}) => {
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback((files) => {
    const remainingSlots = maxMedia - media.length;

    if (remainingSlots <= 0) {
      toast({
        title: "Limite atingido",
        description: `Máximo de ${maxMedia} arquivos por seção.`,
        variant: "destructive"
      });
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
          onMediaAdd(prev => [...prev, { 
            url: e.target.result, 
            type: mediaType,
            name: file.name,
            size: file.size
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos de imagem ou vídeo.",
          variant: "destructive"
        });
      }
    });

    if (files.length > remainingSlots) {
      toast({
        title: "Alguns arquivos não foram adicionados",
        description: `Apenas ${remainingSlots} arquivos foram adicionados devido ao limite.`,
        variant: "destructive"
      });
    }
  }, [media.length, maxMedia, onMediaAdd, toast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div>
      <label className="flex items-center space-x-2 text-sm font-medium text-foreground mb-3">
        <div className="flex items-center space-x-1">
          <ImageIcon className="h-4 w-4" />
          <Video className="h-4 w-4" />
        </div>
        <div>
          <span>{title}</span>
          <span className="text-xs text-muted-foreground ml-2">({media.length}/{maxMedia})</span>
        </div>
      </label>
      <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-primary ${
          media.length >= maxMedia ? 'opacity-50 cursor-not-allowed border-border' : 'border-border'
        }`}
      >
        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          {media.length >= maxMedia 
            ? 'Limite de arquivos atingido' 
            : 'Clique ou arraste imagens/vídeos'
          }
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
        disabled={media.length >= maxMedia}
      />
    </div>
  );
};

export default MediaUploader;