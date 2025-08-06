import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Repeat, Bell, 
  Play, Pause, Edit3, Zap,
  Instagram, Facebook, Twitter, Linkedin,
  Image, Video, FileText, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const PostScheduler = ({ post, onUpdate }) => {
  const [scheduleData, setScheduleData] = useState({
    scheduledAt: post?.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : '',
    autoPublish: post?.autoPublish || false,
    publishMode: post?.publishMode || 'MANUAL',
    recurrence: post?.recurrence || {
      type: 'NONE',
      interval: 1,
      endDate: null,
      daysOfWeek: []
    },
    reminder: post?.reminder || {
      enabled: false,
      minutesBefore: 60
    }
  });

  const { toast } = useToast();

  // Ícones para diferentes plataformas
  const platformIcons = {
    INSTAGRAM: { icon: Instagram, color: 'text-purple-600', bg: 'bg-purple-100' },
    FACEBOOK: { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-100' },
    TWITTER: { icon: Twitter, color: 'text-sky-600', bg: 'bg-sky-100' },
    LINKEDIN: { icon: Linkedin, color: 'text-blue-800', bg: 'bg-blue-100' }
  };

  // Ícones para tipos de post
  const postTypeIcons = {
    FEED: { icon: Image, color: 'text-green-600', bg: 'bg-green-100' },
    STORY: { icon: Play, color: 'text-orange-600', bg: 'bg-orange-100' },
    REELS: { icon: Video, color: 'text-red-600', bg: 'bg-red-100' },
    CAROUSEL: { icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    IGTV: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' }
  };

  // Ícones para modos de publicação
  const publishModeIcons = {
    MANUAL: { icon: Edit3, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Manual' },
    SCHEDULED: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Agendado' },
    RECURRING: { icon: Repeat, color: 'text-green-600', bg: 'bg-green-100', label: 'Recorrente' }
  };

  const handleSave = () => {
    const updatedPost = {
      ...post,
      scheduledAt: scheduleData.scheduledAt ? new Date(scheduleData.scheduledAt) : null,
      autoPublish: scheduleData.autoPublish,
      publishMode: scheduleData.publishMode,
      recurrence: scheduleData.recurrence,
      reminder: scheduleData.reminder,
      status: scheduleData.scheduledAt ? 'SCHEDULED' : 'DRAFT'
    };

    onUpdate(updatedPost);
    
    toast({
      title: "✅ Agendamento Salvo",
      description: scheduleData.scheduledAt 
        ? `Post agendado para ${new Date(scheduleData.scheduledAt).toLocaleString('pt-BR')}`
        : "Configurações de agendamento salvas",
    });
  };

  const PlatformIcon = platformIcons[post?.platform] || platformIcons.INSTAGRAM;
  const PostTypeIcon = postTypeIcons[post?.postType] || postTypeIcons.FEED;
  const PublishModeIcon = publishModeIcons[scheduleData.publishMode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-white border border-gray-200 rounded-lg space-y-6"
    >
      {/* Header com Ícones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Plataforma */}
          <div className={`p-2 rounded-lg ${PlatformIcon.bg}`}>
            <PlatformIcon.icon className={`w-5 h-5 ${PlatformIcon.color}`} />
          </div>
          
          {/* Tipo de Post */}
          <div className={`p-2 rounded-lg ${PostTypeIcon.bg}`}>
            <PostTypeIcon.icon className={`w-5 h-5 ${PostTypeIcon.color}`} />
          </div>
          
          {/* Modo de Publicação */}
          <div className={`p-2 rounded-lg ${PublishModeIcon.bg}`}>
            <PublishModeIcon.icon className={`w-5 h-5 ${PublishModeIcon.color}`} />
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {post?.platform} • {post?.postType} • {PublishModeIcon.label}
        </div>
      </div>

      {/* Modo de Publicação */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modo de Publicação
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(publishModeIcons).map(([mode, config]) => (
            <button
              key={mode}
              onClick={() => setScheduleData(prev => ({ ...prev, publishMode: mode }))}
              className={`p-3 border-2 rounded-lg transition-all ${
                scheduleData.publishMode === mode
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <config.icon className={`w-5 h-5 mx-auto mb-1 ${
                scheduleData.publishMode === mode ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <div className="text-xs font-medium">{config.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Data e Hora de Agendamento */}
      {scheduleData.publishMode !== 'MANUAL' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data e Hora
            </label>
            <Input
              type="datetime-local"
              value={scheduleData.scheduledAt}
              onChange={(e) => setScheduleData(prev => ({ 
                ...prev, 
                scheduledAt: e.target.value 
              }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Zap className="w-4 h-4 inline mr-1" />
              Publicação Automática
            </label>
            <button
              onClick={() => setScheduleData(prev => ({ 
                ...prev, 
                autoPublish: !prev.autoPublish 
              }))}
              className={`w-full p-2 rounded-lg border-2 transition-all ${
                scheduleData.autoPublish
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {scheduleData.autoPublish ? (
                <><Play className="w-4 h-4 inline mr-2" />Automático</>
              ) : (
                <><Pause className="w-4 h-4 inline mr-2" />Manual</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Configurações de Recorrência */}
      {scheduleData.publishMode === 'RECURRING' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Repeat className="w-4 h-4 mr-2" />
            Configurações de Recorrência
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequência
              </label>
              <select
                value={scheduleData.recurrence.type}
                onChange={(e) => setScheduleData(prev => ({
                  ...prev,
                  recurrence: { ...prev.recurrence, type: e.target.value }
                }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="NONE">Não repetir</option>
                <option value="DAILY">Diariamente</option>
                <option value="WEEKLY">Semanalmente</option>
                <option value="MONTHLY">Mensalmente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo
              </label>
              <Input
                type="number"
                min="1"
                value={scheduleData.recurrence.interval}
                onChange={(e) => setScheduleData(prev => ({
                  ...prev,
                  recurrence: { ...prev.recurrence, interval: parseInt(e.target.value) }
                }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <Input
                type="date"
                value={scheduleData.recurrence.endDate}
                onChange={(e) => setScheduleData(prev => ({
                  ...prev,
                  recurrence: { ...prev.recurrence, endDate: e.target.value }
                }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Configurações de Lembrete */}
      {scheduleData.scheduledAt && (
        <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Lembrete
            </h4>
            <button
              onClick={() => setScheduleData(prev => ({
                ...prev,
                reminder: { ...prev.reminder, enabled: !prev.reminder.enabled }
              }))}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                scheduleData.reminder.enabled
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {scheduleData.reminder.enabled ? 'Ativo' : 'Inativo'}
            </button>
          </div>

          {scheduleData.reminder.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lembrar com antecedência (minutos)
              </label>
              <Input
                type="number"
                min="1"
                value={scheduleData.reminder.minutesBefore}
                onChange={(e) => setScheduleData(prev => ({
                  ...prev,
                  reminder: { ...prev.reminder, minutesBefore: parseInt(e.target.value) }
                }))}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Resumo do Agendamento */}
      {scheduleData.scheduledAt && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📅 Resumo do Agendamento</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Data:</strong> {new Date(scheduleData.scheduledAt).toLocaleString('pt-BR')}</p>
            <p><strong>Modo:</strong> {PublishModeIcon.label}</p>
            <p><strong>Publicação:</strong> {scheduleData.autoPublish ? 'Automática' : 'Manual'}</p>
            {scheduleData.recurrence.type !== 'NONE' && (
              <p><strong>Recorrência:</strong> {scheduleData.recurrence.type.toLowerCase()}</p>
            )}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => setScheduleData({
            ...scheduleData,
            scheduledAt: '',
            autoPublish: false,
            publishMode: 'MANUAL'
          })}
        >
          Limpar
        </Button>
        
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Salvar Agendamento
        </Button>
      </div>
    </motion.div>
  );
};

export default PostScheduler;
