/**
 * ClientSwitcher - Componente para trocar de cliente/tenant
 * 
 * Exibe o cliente atual e permite alternar entre clientes vinculados.
 * Aparece no sidebar/header para acesso rápido.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ChevronDown, 
  Check, 
  Plus,
  Settings
} from 'lucide-react';
import { useClient } from '@/lib/ClientContext';
import { usePermissions } from '@/lib/usePermissions';

export default function ClientSwitcher({ collapsed = false }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { currentClient, clients, switchClient, hasMultipleClients } = useClient();
  const { canCreateClient } = usePermissions();

  const handleSwitch = (clientId) => {
    switchClient(clientId);
    setIsOpen(false);
    // Recarregar página para atualizar dados do novo cliente
    window.location.reload();
  };

  const handleManageClients = () => {
    setIsOpen(false);
    navigate('/clients');
  };

  // Se não há cliente, não renderiza
  if (!currentClient) return null;

  // Versão colapsada (só ícone)
  if (collapsed) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
        style={{ backgroundColor: currentClient.primary_color }}
        title={currentClient.name}
      >
        {currentClient.logo_url ? (
          <img 
            src={currentClient.logo_url} 
            alt={currentClient.name}
            className="w-6 h-6 rounded object-cover"
          />
        ) : (
          <span className="text-white font-bold text-sm">
            {currentClient.name?.charAt(0).toUpperCase()}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Botão do cliente atual */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-left"
      >
        {/* Avatar/Logo do cliente */}
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: currentClient.primary_color }}
        >
          {currentClient.logo_url ? (
            <img 
              src={currentClient.logo_url} 
              alt={currentClient.name}
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <span className="text-white font-bold">
              {currentClient.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info do cliente */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {currentClient.name}
          </p>
          <p className="text-xs text-slate-400">
            {currentClient.userRole || 'Cliente'}
          </p>
        </div>

        {/* Indicador de dropdown */}
        {(hasMultipleClients || canCreateClient) && (
          <ChevronDown 
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown de clientes */}
      {isOpen && (hasMultipleClients || canCreateClient) && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Lista de clientes */}
            <div className="max-h-64 overflow-y-auto">
              {clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => handleSwitch(client.id)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors text-left ${
                    client.id === currentClient.id ? 'bg-slate-700/50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: client.primary_color }}
                  >
                    {client.logo_url ? (
                      <img 
                        src={client.logo_url} 
                        alt={client.name}
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs">
                        {client.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {client.slug}
                    </p>
                  </div>

                  {/* Check se ativo */}
                  {client.id === currentClient.id && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Ações */}
            {canCreateClient && (
              <div className="border-t border-slate-700 p-2">
                <button
                  onClick={handleManageClients}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Gerenciar Clientes
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/clients');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-purple-400 hover:bg-purple-900/30 hover:text-purple-300 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Criar Novo Cliente
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
