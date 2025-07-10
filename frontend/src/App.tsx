import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import AdminLogin from './components/AdminLogin';
import BLOLogin from './components/BLOLogin';
import AdminDashboard from './components/AdminDashboard';
import BLODashboard from './components/BLODashboard';
import BLODetailsPage from './components/BLODetailsPage';

type ViewType = 'admin-login' | 'blo-login' | 'admin-dashboard' | 'blo-dashboard' | 'blo-details';

function App() {
  const { admin, user, loading, adminLogin, bloLogin, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('admin-login');
  const [selectedBLOId, setSelectedBLOId] = useState<string>('');

  React.useEffect(() => {
    if (admin) {
      setCurrentView('admin-dashboard');
    } else if (user) {
      setCurrentView('blo-dashboard');
    }
  }, [admin, user]);

  const handleAdminLogin = async (userId: string, password: string): Promise<boolean> => {
    const success = await adminLogin(userId, password);
    if (success) {
      setCurrentView('admin-dashboard');
    }
    return success;
  };

  const handleBLOLogin = async (userId: string, password: string): Promise<boolean> => {
    const success = await bloLogin(userId, password);
    if (success) {
      setCurrentView('blo-dashboard');
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setCurrentView('admin-login');
  };

  const handleViewBLODetails = (bloId: string) => {
    setSelectedBLOId(bloId);
    setCurrentView('blo-details');
  };

  const handleBackToAdminDashboard = () => {
    setCurrentView('admin-dashboard');
  };

  const handleSwitchToBLOLogin = () => {
    setCurrentView('blo-login');
  };

  const handleBackToAdminLogin = () => {
    setCurrentView('admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show appropriate view based on authentication state and current view
  if (admin && currentView === 'admin-dashboard') {
    return (
      <AdminDashboard
        admin={admin}
        onLogout={handleLogout}
        onViewBLODetails={handleViewBLODetails}
      />
    );
  }

  if (admin && currentView === 'blo-details') {
    return (
      <BLODetailsPage
        bloId={selectedBLOId}
        onBack={handleBackToAdminDashboard}
      />
    );
  }

  if (user && currentView === 'blo-dashboard') {
    return (
      <BLODashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Login views
  if (currentView === 'blo-login') {
    return (
      <BLOLogin
        onLogin={handleBLOLogin}
        onBackToAdmin={handleBackToAdminLogin}
      />
    );
  }

  // Default to admin login
  return (
    <div className="relative">
      <AdminLogin onLogin={handleAdminLogin} />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleSwitchToBLOLogin}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 underline"
        >
          Login as BLO instead
        </button>
      </div>
    </div>
  );
}

export default App;