import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import DetailsPage from './components/DetailsPage';
import MobileApp from './components/MobileApp';

type ViewType = 'login' | 'dashboard' | 'details' | 'mobile';

function App() {
  const { user, login, logout, loginWithMobile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  // Check URL for mobile app access
  React.useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (path === '/mobile' || urlParams.get('mobile') === 'true') {
      setCurrentView('mobile');
    } else if (user) {
      setCurrentView('dashboard');
    }
  }, [user]);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const success = await login(username, password);
    if (success) {
      setCurrentView('dashboard');
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setCurrentView('login');
  };

  const handleViewDetails = (empId: string) => {
    setSelectedEmpId(empId);
    setCurrentView('details');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleMobileLogin = async (mobileNumber: string): Promise<boolean> => {
    const success = await loginWithMobile(mobileNumber);
    return success;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
          <p className="text-sm text-gray-500">API: {import.meta.env.VITE_API_BASE_URL || 'Using fallback'}</p>
        </div>
      </div>
    );
  }

  // Mobile app view
  if (currentView === 'mobile') {
    return (
      <MobileApp
        onLoginWithMobile={handleMobileLogin}
        user={user}
      />
    );
  }

  // Main dashboard views
  if (!user) {
    return (
      <LoginForm onLogin={handleLogin} />
    );
  }

  switch (currentView) {
    case 'dashboard':
      return (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onViewDetails={handleViewDetails}
        />
      );
    case 'details':
      return (
        <DetailsPage
          empId={selectedEmpId}
          onBack={handleBackToDashboard}
        />
      );
    default:
      return <LoginForm onLogin={handleLogin} />;
  }
}

export default App;