/**
 * Página de Gestão de Clientes (Multi-Tenant)
 * 
 * Acesso: Apenas DESIGNER, ADMIN ou MASTER
 * 
 * Funcionalidades:
 * - Listar clientes do usuário
 * - Criar novo cliente
 * - Editar cliente existente
 * - Desativar cliente
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Building2, 
  Palette, 
  MessageSquare,
  ChevronRight,
  Check,
  Loader2,
  Edit2,
  Trash2,
  X,
  Save,
  Eye,
  Users,
  Calendar
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useClient } from '@/lib/ClientContext';
import { usePermissions } from '@/lib/usePermissions';
import { db } from '@/lib/supabase';
import useAuthStore from '@/lib/authStore';

// Cores predefinidas para escolha rápida
const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#64748b', // Slate
];

// Form inicial vazio
const INITIAL_FORM = {
  id: null,
  name: '',
  slug: '',
  logoUrl: '',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  toneOfVoice: '',
};

export default function ClientsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { clients, currentClient, refreshClients, switchClient } = useClient();
  const { canCreateClient, canEditClient } = usePermissions();

  // Estados
  const [mode, setMode] = useState('list'); // 'list', 'create', 'edit'
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [previewLogo, setPreviewLogo] = useState('');

  // Verificar permissão de acesso
  useEffect(() => {
    if (!canCreateClient) {
      navigate('/dashboard');
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página.',
        variant: 'destructive',
      });
    }
  }, [canCreateClient, navigate, toast]);

  // Gerar slug a partir do nome
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Atualizar form
  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-gerar slug quando nome muda (apenas no modo create)
      if (field === 'name' && mode === 'create') {
        updated.slug = generateSlug(value);
      }

      // Preview do logo
      if (field === 'logoUrl') {
        setPreviewLogo(value);
      }
      
      return updated;
    });
  };

  // Abrir modo de criação
  const handleStartCreate = () => {
    setFormData(INITIAL_FORM);
    setPreviewLogo('');
    setMode('create');
  };

  // Abrir modo de edição
  const handleStartEdit = (client) => {
    setFormData({
      id: client.id,
      name: client.name || '',
      slug: client.slug || '',
      logoUrl: client.logo_url || '',
      primaryColor: client.primary_color || '#6366f1',
      secondaryColor: client.secondary_color || '#8b5cf6',
      toneOfVoice: client.tone_of_voice || '',
    });
    setPreviewLogo(client.logo_url || '');
    setMode('edit');
  };

  // Cancelar e voltar para lista
  const handleCancel = () => {
    setFormData(INITIAL_FORM);
    setPreviewLogo('');
    setMode('list');
  };

  // Criar cliente
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do cliente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const newClient = await db.clients.create(formData, user.id);
      
      toast({
        title: 'Cliente criado!',
        description: `${newClient.name} foi criado com sucesso.`,
      });

      refreshClients();
      handleCancel();

      // Perguntar se quer ativar o novo cliente
      if (window.confirm('Deseja ativar este cliente agora?')) {
        switchClient(newClient.id);
      }

    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: 'Erro ao criar',
        description: error.message || 'Não foi possível criar o cliente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar cliente
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do cliente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await db.clients.update(formData.id, formData);
      
      toast({
        title: 'Cliente atualizado!',
        description: `${formData.name} foi atualizado com sucesso.`,
      });

      refreshClients();
      handleCancel();

    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o cliente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Desativar cliente
  const handleDelete = async (client) => {
    if (!window.confirm(`Tem certeza que deseja desativar "${client.name}"?\n\nO cliente ficará inativo mas os dados serão mantidos.`)) {
      return;
    }

    try {
      await db.clients.delete(client.id);
      
      toast({
        title: 'Cliente desativado',
        description: `${client.name} foi desativado.`,
      });

      refreshClients();

    } catch (error) {
      console.error('Erro ao desativar cliente:', error);
      toast({
        title: 'Erro ao desativar',
        description: error.message || 'Não foi possível desativar o cliente.',
        variant: 'destructive',
      });
    }
  };

  // Ativar cliente
  const handleActivate = (clientId) => {
    switchClient(clientId);
    toast({
      title: 'Cliente ativado',
      description: 'O ambiente foi alterado para o cliente selecionado.',
    });
  };

  if (!canCreateClient) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-600" />
              Clientes
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie seus clientes e ambientes de trabalho
            </p>
          </div>
          
          {mode === 'list' && (
            <Button onClick={handleStartCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          )}
        </div>

        {/* Formulário de Criação/Edição */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {mode === 'create' ? (
                  <>
                    <Plus className="w-5 h-5 text-blue-600" />
                    Novo Cliente
                  </>
                ) : (
                  <>
                    <Edit2 className="w-5 h-5 text-blue-600" />
                    Editar Cliente
                  </>
                )}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={mode === 'create' ? handleCreate : handleUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna Esquerda */}
                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Cliente *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Ex: Empresa XYZ"
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identificador (slug)
                    </label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => handleChange('slug', e.target.value)}
                      placeholder="empresa-xyz"
                      disabled={isLoading}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Usado na URL e identificação interna
                    </p>
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL do Logo
                    </label>
                    <Input
                      value={formData.logoUrl}
                      onChange={(e) => handleChange('logoUrl', e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Preview do Logo */}
                  {previewLogo && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={previewLogo} 
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-lg border"
                        onError={() => setPreviewLogo('')}
                      />
                      <span className="text-sm text-gray-600">Preview do logo</span>
                    </div>
                  )}
                </div>

                {/* Coluna Direita */}
                <div className="space-y-4">
                  {/* Cores */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Cores da Marca
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Cor Principal */}
                      <div>
                        <span className="text-xs text-gray-500 mb-1 block">Principal</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                            disabled={isLoading}
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            className="font-mono text-xs w-24"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Cor Secundária */}
                      <div>
                        <span className="text-xs text-gray-500 mb-1 block">Secundária</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.secondaryColor}
                            onChange={(e) => handleChange('secondaryColor', e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                            disabled={isLoading}
                          />
                          <Input
                            value={formData.secondaryColor}
                            onChange={(e) => handleChange('secondaryColor', e.target.value)}
                            className="font-mono text-xs w-24"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cores predefinidas */}
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleChange('primaryColor', color)}
                          className="w-6 h-6 rounded border-2 transition-all hover:scale-110"
                          style={{ 
                            backgroundColor: color,
                            borderColor: formData.primaryColor === color ? '#1f2937' : 'transparent'
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tom de Voz */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Tom de Voz / Estilo
                    </label>
                    <Textarea
                      value={formData.toneOfVoice}
                      onChange={(e) => handleChange('toneOfVoice', e.target.value)}
                      placeholder="Ex: Profissional e amigável, usando linguagem acessível. Evitar jargões técnicos. Usar emojis com moderação."
                      rows={4}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Descreva o estilo de comunicação para geração de conteúdo com IA
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                <span className="text-xs font-medium text-gray-500 mb-2 block">PREVIEW DO CLIENTE</span>
                <div className="flex items-center gap-4">
                  {previewLogo ? (
                    <img 
                      src={previewLogo} 
                      alt="Logo"
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                      style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})` }}
                    >
                      {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {formData.name || 'Nome do Cliente'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      /{formData.slug || 'slug'}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: formData.primaryColor }}
                      title="Cor Principal"
                    />
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: formData.secondaryColor }}
                      title="Cor Secundária"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {mode === 'create' ? 'Criando...' : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      {mode === 'create' ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Criar Cliente
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Clientes */}
        {mode === 'list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Seus Clientes ({clients.length})
              </h2>
            </div>
            
            {clients.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
                <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum cliente cadastrado
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Crie seu primeiro cliente para começar a organizar seus projetos e conteúdos.
                </p>
                <Button onClick={handleStartCreate} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro cliente
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {clients.map(client => (
                  <div
                    key={client.id}
                    className={`bg-white border rounded-xl p-5 transition-all hover:shadow-md ${
                      currentClient?.id === client.id 
                        ? 'border-blue-500 ring-2 ring-blue-100' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Info do Cliente */}
                      <div className="flex items-center gap-4">
                        {client.logo_url ? (
                          <img 
                            src={client.logo_url} 
                            alt={client.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div 
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                            style={{ background: `linear-gradient(135deg, ${client.primary_color || '#6366f1'}, ${client.secondary_color || '#8b5cf6'})` }}
                          >
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{client.name}</h3>
                            {currentClient?.id === client.id && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                Ativo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 font-mono">
                            /{client.slug}
                          </p>
                          {client.tone_of_voice && (
                            <p className="text-xs text-gray-400 mt-1 max-w-md truncate">
                              {client.tone_of_voice}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Cores e Ações */}
                      <div className="flex items-center gap-4">
                        {/* Cores */}
                        <div className="flex gap-1">
                          <div 
                            className="w-6 h-6 rounded-lg"
                            style={{ backgroundColor: client.primary_color || '#6366f1' }}
                            title="Cor principal"
                          />
                          <div 
                            className="w-6 h-6 rounded-lg"
                            style={{ backgroundColor: client.secondary_color || '#8b5cf6' }}
                            title="Cor secundária"
                          />
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStartEdit(client)}
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(client)}
                            title="Desativar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          
                          {currentClient?.id !== client.id && (
                            <Button 
                              size="sm"
                              onClick={() => handleActivate(client.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Ativar
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats do cliente (placeholder) */}
                    <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>0 posts</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{client.userRole || 'OWNER'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dica */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>💡 Dica:</strong> Cada cliente tem seu próprio ambiente isolado. 
            Posts, mídias e configurações são separados por cliente. 
            Use o seletor no menu lateral para alternar entre clientes.
          </p>
        </div>
      </div>
    </Layout>
  );
}
