/**
 * Página de Gestão de Clientes (Multi-Tenant)
 * 
 * Acesso: Apenas DESIGNER, ADMIN ou MASTER
 * 
 * Funcionalidades:
 * - Listar clientes do usuário
 * - Criar novo cliente
 * - Editar cliente existente
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
  Loader2
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

export default function ClientsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { clients, refreshClients, switchClient } = useClient();
  const { canCreateClient, canEditClient } = usePermissions();

  // Estados
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    toneOfVoice: '',
  });

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
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-')     // Substitui espaços e caracteres especiais por -
      .replace(/^-+|-+$/g, '');         // Remove - do início e fim
  };

  // Atualizar form
  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-gerar slug quando nome muda
      if (field === 'name') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
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

      // Atualizar lista e limpar form
      refreshClients();
      setFormData({
        name: '',
        slug: '',
        logoUrl: '',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        toneOfVoice: '',
      });
      setIsCreating(false);

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
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus clientes e ambientes
            </p>
          </div>
          
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          )}
        </div>

        {/* Formulário de Criação */}
        {isCreating && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Novo Cliente
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nome do Cliente *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: Empresa XYZ"
                  disabled={isLoading}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Identificador (slug)
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="empresa-xyz"
                  disabled={isLoading}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usado na URL e identificação interna
                </p>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  URL do Logo
                </label>
                <Input
                  value={formData.logoUrl}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  disabled={isLoading}
                />
              </div>

              {/* Cores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cor Principal
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                      disabled={isLoading}
                    />
                    <div className="flex gap-1 flex-wrap">
                      {PRESET_COLORS.slice(0, 5).map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleChange('primaryColor', color)}
                          className="w-6 h-6 rounded border-2 transition-transform hover:scale-110"
                          style={{ 
                            backgroundColor: color,
                            borderColor: formData.primaryColor === color ? '#fff' : 'transparent'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cor Secundária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                      disabled={isLoading}
                    />
                    <div className="flex gap-1 flex-wrap">
                      {PRESET_COLORS.slice(5).map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleChange('secondaryColor', color)}
                          className="w-6 h-6 rounded border-2 transition-transform hover:scale-110"
                          style={{ 
                            backgroundColor: color,
                            borderColor: formData.secondaryColor === color ? '#fff' : 'transparent'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tom de Voz */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Tom de Voz
                </label>
                <Textarea
                  value={formData.toneOfVoice}
                  onChange={(e) => handleChange('toneOfVoice', e.target.value)}
                  placeholder="Ex: Profissional e amigável, usando linguagem acessível..."
                  rows={3}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Descreva o estilo de comunicação para geração de conteúdo
                </p>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Criar Cliente
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Clientes */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Seus Clientes</h2>
          
          {clients.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum cliente encontrado.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro cliente
              </Button>
            </div>
          ) : (
            clients.map(client => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Logo ou cor */}
                  {client.logo_url ? (
                    <img 
                      src={client.logo_url} 
                      alt={client.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: client.primary_color }}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {client.slug} • {client.userRole}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Indicador de cores */}
                  <div className="flex gap-1 mr-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: client.primary_color }}
                      title="Cor principal"
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: client.secondary_color }}
                      title="Cor secundária"
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleActivate(client.id)}
                  >
                    Ativar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
