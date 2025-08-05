import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock, Image, Video, Camera, Grid as GridIcon } from 'lucide-react';

const CalendarGrid = ({ 
  currentDate, 
  posts, 
  selectedDate, 
  onDateClick, 
  onNavigateMonth, 
  formatDateKey,
  getPostTypeIcon,
  getPlatformColor
}) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Adicionar dias vazios do início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getPostsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return posts[dateKey] || [];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const getPostTypeCount = (postsForDate) => {
    const counts = {
      FEED: 0,
      STORY: 0,
      REELS: 0,
      CAROUSEL: 0,
      IGTV: 0
    };
    
    postsForDate.forEach(post => {
      counts[post.postType] = (counts[post.postType] || 0) + 1;
    });
    
    return counts;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header do Calendário */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateMonth(-1)}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateMonth(0)}
              className="text-white hover:bg-white/20 px-4"
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateMonth(1)}
              className="text-white hover:bg-white/20"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {dayNames.map(day => (
          <div key={day} className="p-4 text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          if (!day) {
            return (
              <div key={index} className="h-32 border-r border-b border-gray-100 bg-gray-50/50" />
            );
          }

          const postsForDate = getPostsForDate(day);
          const hasPost = postsForDate.length > 0;
          const todayCheck = isToday(day);
          const selectedCheck = isSelected(day);
          const postCounts = getPostTypeCount(postsForDate);

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                h-32 border-r border-b border-gray-100 p-2 cursor-pointer relative
                ${todayCheck ? 'bg-purple-50 border-purple-200' : 'bg-white hover:bg-gray-50'}
                ${selectedCheck ? 'ring-2 ring-purple-400 bg-purple-50' : ''}
                transition-all duration-200
              `}
              onClick={() => onDateClick(day)}
            >
              {/* Número do dia */}
              <div className={`
                text-sm font-semibold mb-1
                ${todayCheck ? 'text-purple-700' : selectedCheck ? 'text-purple-600' : 'text-gray-700'}
              `}>
                {day.getDate()}
              </div>

              {/* Posts do dia */}
              {hasPost && (
                <div className="space-y-1">
                  {/* Contador de posts por tipo */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(postCounts).map(([type, count]) => {
                      if (count === 0) return null;
                      
                      return (
                        <motion.div
                          key={type}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`
                            flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full
                            ${type === 'STORY' ? 'bg-pink-100 text-pink-700' :
                              type === 'REELS' ? 'bg-purple-100 text-purple-700' :
                              type === 'CAROUSEL' ? 'bg-blue-100 text-blue-700' :
                              type === 'IGTV' ? 'bg-red-100 text-red-700' :
                              'bg-green-100 text-green-700'}
                          `}
                        >
                          {getPostTypeIcon && getPostTypeIcon(type)}
                          <span className="font-medium">{count}</span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Preview dos posts principais */}
                  <div className="flex items-center gap-1">
                    {postsForDate.slice(0, 3).map((post, postIndex) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: postIndex * 0.1 }}
                        className={`
                          w-2 h-2 rounded-full
                          ${getPlatformColor ? getPlatformColor(post.platform) : 'bg-gray-400'}
                        `}
                        title={`${post.platform} - ${post.title}`}
                      />
                    ))}
                    {postsForDate.length > 3 && (
                      <span className="text-xs text-gray-500 ml-1">
                        +{postsForDate.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Indicador de hoje */}
              {todayCheck && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"
                />
              )}

              {/* Badge para dias com muitos posts */}
              {postsForDate.length > 5 && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute bottom-1 right-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold"
                >
                  {postsForDate.length}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Dia atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <span>Instagram</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Facebook</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-3 h-3 text-pink-600" />
            <span>Stories</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="w-3 h-3 text-purple-600" />
            <span>Reels</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarGrid;