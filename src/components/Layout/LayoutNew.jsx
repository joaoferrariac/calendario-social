import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Image, 
  Users, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Instagram,
  Settings,
  Bell,
  Search,
  Plus,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/lib/authStore';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Início',
      icon: Home,
      path: '/dashboard',
      roles: ['ADMIN', 'EDITOR', 'READER']
    },
    {
      name: 'Calendário',
      icon: Calendar,
      path: '/calendar',
      roles: ['ADMIN', 'EDITOR', 'READER'],
      badge: 'Novo'
    },
    {
      name: 'Posts Instagram',
      icon: Instagram,
      path: '/posts',
      roles: ['ADMIN', 'EDITOR', 'READER'],
      highlight: true
    },
    {
      name: 'Mídia',
      icon: Image,
      path: '/media',
      roles: ['ADMIN', 'EDITOR']
    },
    {
      name: 'Analytics',
      icon: TrendingUp,
      path: '/analytics',
      roles: ['ADMIN', 'EDITOR'],
      badge: 'Pro'
    },
    {
      name: 'Usuários',
      icon: Users,
      path: '/users',
      roles: ['ADMIN']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SocialHub</h1>
            <p className="text-xs text-slate-400">Marketing Pro</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-3">
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          onClick={() => navigate('/calendar')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Post
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" className="bg-slate-700 hover:bg-slate-600 text-white border-0">
            <Activity className="w-4 h-4 mr-1" />
            Stories
          </Button>
          <Button variant="secondary" size="sm" className="bg-slate-700 hover:bg-slate-600 text-white border-0">
            <Instagram className="w-4 h-4 mr-1" />
            Reels
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
          Principal
        </div>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-[1.02]'
                  : item.highlight
                  ? 'text-purple-300 hover:bg-purple-900/30 hover:text-white border border-purple-700/50'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                <span>{item.name}</span>
              </div>
              
              {item.badge && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  item.badge === 'Pro' 
                    ? 'bg-yellow-500 text-yellow-900'
                    : 'bg-blue-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Conta
          </div>
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3 mb-4 p-3 bg-slate-800/50 rounded-xl">
          <div className="relative">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-10 h-10 rounded-full border-2 border-purple-500"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 capitalize flex items-center">
              {user?.role?.toLowerCase()}
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-red-400 hover:bg-red-900/20 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 shadow-2xl">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-50 w-80 h-full lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:pl-80">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="hidden sm:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar posts, hashtags, analytics..."
                    className="pl-10 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white focus:border-purple-200 w-96 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative hover:bg-slate-100">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
              </Button>
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>

              <div className="flex items-center space-x-2 px-3 py-2 bg-purple-100 rounded-xl">
                <Instagram className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Pro Plan</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100/50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
