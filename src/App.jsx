import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import useAuthStore from '@/lib/authStore';
import ErrorBoundary from '@/components/ErrorBoundary';

// Páginas
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CalendarPage from '@/pages/CalendarPage';
import PostsPage from '@/pages/PostsPage';
import MediaPage from '@/pages/MediaPage';
import UsersPage from '@/pages/UsersPage';
import ProfilePage from '@/pages/ProfilePage';

// Componente de rota protegida
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, hasAnyRole } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Componente de loading
const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

function App() {
  const { verifyToken, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Verificar token ao inicializar a aplicação
    verifyToken();
  }, [verifyToken]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title>Calendário de Postagens - Sistema de Gerenciamento</title>
        <meta name="description" content="Sistema completo para gerenciar calendário de postagens com upload de imagens e legendas" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Rota pública */}
          <Route 
            path="/login" 
            element={
              isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          
          {/* Rotas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/posts" 
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <PostsPage />
                </ErrorBoundary>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/media" 
            element={
              <ProtectedRoute roles={['ADMIN', 'EDITOR']}>
                <MediaPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirecionamentos */}
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />
            } 
          />
          
          {/* 404 - Página não encontrada */}
          <Route 
            path="*" 
            element={
              <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />
            } 
          />
        </Routes>
        
        <Toaster />
      </div>
    </>
  );
}

export default App;