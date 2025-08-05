import React from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PostsSidebar = ({ posts, isEditor, onExportPost, onDeletePost }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24"
    >
      <h3 className="text-lg font-semibold mb-4 text-foreground">Postagens Recentes</h3>
      <div className="space-y-3">
        {Object.entries(posts)
          .sort(([a], [b]) => new Date(b) - new Date(a))
          .slice(0, 5)
          .map(([dateKey, post]) => {
            const date = new Date(dateKey);
            const totalMedia = (post.feedMedia?.length || 0) + (post.storyMedia?.length || 0) + 
                              (post.images?.length || 0) + (post.storyImages?.length || 0);
            return (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-secondary/50 rounded-lg border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {date.getDate()}/{date.getMonth() + 1}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {post.caption || 'Sem legenda'}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {totalMedia} arquivo(s)
                    </p>
                    {post.createdByName && (
                      <p className="text-xs text-muted-foreground/70">
                        por {post.createdByName}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onExportPost(date)}
                      className="h-8 w-8 p-0"
                      title="Exportar mídia"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {isEditor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePost(date)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        {Object.keys(posts).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma postagem ainda
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PostsSidebar;