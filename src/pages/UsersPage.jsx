/**
 * Página de Gestão de Usuários
 * 
 * Acesso: Apenas DESIGNER, ADMIN ou MASTER
 * 
 * Funcionalidades:
 * - Listar usuários
 * - Criar novo usuário (sem registro público!)
 * - Editar usuário existente
 * - Vincular usuários a clientes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users,
  UserPlus,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Building2
} from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/lib/usePermissions';
import { useClient } from '@/lib/ClientContext';
import { db } from '@/lib/supabase';
import useAuthStore from '@/lib/authStore';

// Roles disponíveis para criação (MASTER só pode ser criado manualmente)
const AVAILABLE_ROLES = [
  { value: 'READER', label: 'Leitor', description: 'Apenas visualização' },
  { value: 'EDITOR', label: 'Editor', description: 'Criar e editar posts' },
  { value: 'DESIGNER', label: 'Designer', description: 'Gerenciar clientes e usuários' },
  { value: 'ADMIN', label: 'Admin', description: 'Acesso total ao sistema' },
];

export default function UsersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { clients, currentClient } = useClient();
  const { canCreateClient, isAdmin, isDesigner } = usePermissions();

  // Estados
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'READER',
    clientId: null,
  });

  // Verificar permissão de acesso
  useEffect(() => {
    if (!canCreateClient) {
      navigate('/dashboard');
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para gerenciar usuários.',
        variant: 'destructive',
      });
    }
  }, [canCreateClient, navigate, toast]);

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, [currentClient]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os usuários (com filtro por cliente se necessário)
      const { data, error } = await db.users.list();
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async () => {
    // Validações
    if (!formData.name?.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }
    if (!formData.email?.trim()) {
      toast({ title: 'Erro', description: 'Email é obrigatório', variant: 'destructive' });
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast({ title: 'Erro', description: 'Senha deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const result = await db.users.create({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      if (result.error) throw new Error(result.error);

      // Se tiver cliente selecionado, vincular
      if (formData.clientId && result.data) {
        await db.userClients.create({
          user_id: result.data.id,
          client_id: formData.clientId,
          role: formData.role,
        });
      }

      toast({
        title: 'Usuário criado!',
        description: `${formData.name} foi adicionado ao sistema.`,
      });

      // Reset form
      setFormData({ name: '', email: '', password: '', role: 'READER', clientId: null });
      setIsCreating(false);
      loadUsers();
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Não foi possível criar o usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await db.users.delete(userId);
      if (error) throw error;

      toast({ title: 'Usuário excluído', description: 'O usuário foi removido.' });
      loadUsers();
    } catch (err) {
      console.error('Erro ao excluir:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o usuário.',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      MASTER: 'bg-purple-100 text-purple-700 border-purple-200',
      ADMIN: 'bg-red-100 text-red-700 border-red-200',
      DESIGNER: 'bg-blue-100 text-blue-700 border-blue-200',
      EDITOR: 'bg-green-100 text-green-700 border-green-200',
      READER: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[role] || colors.READER;
  };

  if (!canCreateClient) return null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              Usuários
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie contas de usuário e permissões
            </p>
          </div>
          
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          )}
        </div>

        {/* Formulário de Criação */}
        {isCreating && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              Cadastrar Novo Usuário
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nome do usuário"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissão *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                >
                  {AVAILABLE_ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cliente (opcional) */}
              {clients.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vincular a Cliente (opcional)
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.clientId || ''}
                    onChange={(e) => handleChange('clientId', e.target.value || null)}
                  >
                    <option value="">Nenhum cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setFormData({ name: '', email: '', password: '', role: 'READER', clientId: null });
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Criar Usuário
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Usuários */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário cadastrado</p>
              <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
                className="mt-4"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastrar primeiro usuário
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {u.name}
                              {u.id === user?.id && (
                                <span className="ml-2 text-xs text-blue-600">(você)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(u.role)}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {u.id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informação */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Apenas DESIGNER, ADMIN e MASTER podem cadastrar novos usuários. 
            Clientes não possuem acesso ao cadastro - eles recebem credenciais criadas por você.
          </p>
        </div>
      </div>
    </Layout>
  );
}
