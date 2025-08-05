import React from 'react';
import { motion } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MediaGrid = ({ media, onRemove, isEditor, type }) => {
  const getAspectRatio = () => {
    return type === 'story' ? 'aspect-[9/16]' : 'aspect-[4/5]';
  };

  const getGridCols = () => {
    return type === 'story' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3';
  };

  return (
    <div className={`grid ${getGridCols()} gap-4`}>
      {media.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className={`${getAspectRatio()} relative overflow-hidden rounded-lg border border-border bg-secondary/20`}>
            {item.type === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            ) : (
              <img
                src={item.url}
                alt={`${type} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
            
            {isEditor && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              {item.type === 'video' && <Play className="h-3 w-3" />}
              <span>
                {type === 'feed' ? 'Feed' : 'Story'} {index + 1}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MediaGrid;