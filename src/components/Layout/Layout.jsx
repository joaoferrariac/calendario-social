import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  Image,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/lib/authStore';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, canEdit } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
      roles: ['ADMIN', 'EDITOR', 'READER']
    },
    {
      name: 'Calendário',
      icon: Calendar,
      path: '/calendar',
      roles: ['ADMIN', 'EDITOR', 'READER']
    },
    {
      name: 'Posts',
      icon: FileText,
      path: '/posts',
      roles: ['ADMIN', 'EDITOR', 'READER']
    },
    {
      name: 'Mídia',
      icon: Image,
      path: '/media',
      roles: ['ADMIN', 'EDITOR']
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">Social Calendar</span>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  if (isOpen) {
    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
        
        {/* Mobile Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 z-50 w-80 h-full bg-white shadow-xl lg:hidden"
        >
          <SidebarContent />
        </motion.div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
      <SidebarContent />
    </div>
  );
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/calendar':
        return 'Calendário';
      case '/posts':
        return 'Posts';
      case '/media':
        return 'Mídia';
      case '/users':
        return 'Usuários';
      case '/profile':
        return 'Perfil';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 lg:ml-64">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <h1 className="text-xl font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <main className="lg:ml-64 pt-16">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
