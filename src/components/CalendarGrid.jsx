import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const CalendarGrid = ({ 
  currentDate, 
  posts, 
  selectedDate, 
  onDateClick, 
  onNavigateMonth, 
  formatDateKey 
}) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMonth(-1)}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMonth(0)}
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMonth(1)}
          >
            →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="calendar-day opacity-0" />;
          }

          const dateKey = formatDateKey(day);
          const hasPost = posts[dateKey];
          const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey;
          const isToday = formatDateKey(new Date()) === dateKey;

          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`calendar-day ${hasPost ? 'has-post' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'ring-2 ring-primary' : ''}`}
              onClick={() => onDateClick(day)}
            >
              <span className="text-sm font-medium">{day.getDate()}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CalendarGrid;