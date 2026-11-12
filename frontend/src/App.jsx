import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ErrorBoundary from './components/common/ErrorBoundary';
import GlobalScrollBackground from './components/cinematic/GlobalScrollBackground';

import LoginPage from './pages/LoginPage';
import CinematicLanding from './pages/CinematicLanding';
import DashboardView from './pages/DashboardView';
import MapView from './pages/MapView';
import AssetsView from './pages/AssetsView';
import FaultsView from './pages/FaultsView';
import MaintenanceView from './pages/MaintenanceView';
import AnalyticsView from './pages/AnalyticsView';

import { AuthProvider, useAuth } from './context/AuthContext';
import { checkSystemHealth } from './services/api';

/**
 * Protected Route Gatekeeper
 * First asks for login to access any platform service.
 * Redirects to /login if unauthenticated.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0F1D',
        color: '#10B981',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid rgba(16, 185, 129, 0.2)',
          borderTopColor: '#10B981',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '1rem'
        }} />
        <span>Authenticating Grid Session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Platform Multi-Page Layout with Persistent 4K Scroll-Scrubbing Background
 */
function AppLayout({ healthStatus, onRefreshHealth, children }) {
  return (
    <div className="app-container" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 4K Global Scroll-Scrubbing Video Background on EVERY page */}
      <GlobalScrollBackground opacity={0.32} />

      {/* Role-Adaptive Sidebar */}
      <Sidebar />

      {/* Main Multi-Page Shell */}
      <div className="main-wrapper">
        <Header 
          healthStatus={healthStatus} 
          onRefreshHealth={onRefreshHealth} 
        />
        <main className="content-body">
          <ErrorBoundary fallbackTitle="View Rendering Error">
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function MainRoutes() {
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState({ online: false, data: null });
  const [selectedInstForFault, setSelectedInstForFault] = useState(null);
  const [verifyTargetFault, setVerifyTargetFault] = useState(null);

  const refreshHealth = async () => {
    const result = await checkSystemHealth();
    setHealthStatus({
      online: result.online,
      data: result.data,
    });
  };

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReportFaultOnSite = (installation) => {
    setSelectedInstForFault(installation);
    navigate('/faults');
  };

  const handleNavigateToMapWithSite = (installation) => {
    navigate('/map');
  };

  const handleOpenVerifyModal = (fault) => {
    setVerifyTargetFault(fault);
    navigate('/maintenance');
  };

  return (
    <Routes>
      {/* 1. Dedicated Multi-Page Authentication Portal */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Full 4K Cinematic Interactive Storytelling Experience */}
      <Route 
        path="/experience" 
        element={
          <CinematicLanding 
            onEnterApp={(route) => navigate(route ? (route.startsWith('/') ? route : `/${route}`) : '/dashboard')}
            onNavigate={(route) => navigate(route.startsWith('/') ? route : `/${route}`)}
            onOpenAuth={() => navigate('/login')}
          />
        } 
      />

      {/* 3. Protected Multi-Page Platform Views */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppLayout healthStatus={healthStatus} onRefreshHealth={refreshHealth}>
              <DashboardView 
                healthData={healthStatus.data} 
                healthOnline={healthStatus.online} 
              />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/map" 
        element={
          <ProtectedRoute>
            <AppLayout healthStatus={healthStatus} onRefreshHealth={refreshHealth}>
              <MapView onReportFault={handleReportFaultOnSite} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/assets" 
        element={
          <ProtectedRoute>
            <AppLayout healthStatus={healthStatus} onRefreshHealth={refreshHealth}>
              <AssetsView 
                onNavigateToMap={handleNavigateToMapWithSite}
                onReportFault={handleReportFaultOnSite}
              />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/faults" 
        element={
          <ProtectedRoute>
            <AppLayout healthStatus={healthStatus} onRefreshHealth={refreshHealth}>
              <FaultsView 
                initialInstallationId={selectedInstForFault?.id}
                onOpenVerifyModal={handleOpenVerifyModal}
                onOpenAssignModal={() => navigate('/maintenance')}
              />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/maintenance" 
        element={
          <ProtectedRoute>
            <AppLayout healthStatus={healthStatus} onRefreshHealth={refreshHealth}>
              <MaintenanceView 
                verifyTargetFault={verifyTargetFault}
                onClearVerifyTarget={() => setVerifyTargetFault(null)}
              />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <AppLayout healthStatus={healthStatus} onRefreshHealth={refreshHealth}>
              <AnalyticsView />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Root Route: Redirect to /login if unauthenticated, or /dashboard if authenticated */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MainRoutes />
      </AuthProvider>
    </Router>
  );
}
