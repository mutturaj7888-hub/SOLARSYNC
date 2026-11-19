import React from 'react';
import { 
  Sun, 
  MapPin, 
  Layers, 
  AlertTriangle, 
  Wrench, 
  BarChart3, 
  ShieldCheck,
  Server,
  Sparkles,
  LogOut,
  User,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Role-based customized menu items
  const getMenuItems = () => {
    if (userRole === 'technician' || userRole === 'maintainer') {
      return [
        { path: '/dashboard', label: 'Maintainer Hub', icon: Wrench, badge: 'Active' },
        { path: '/maintenance', label: 'Assigned Tasks', icon: Calendar, badge: 'Queue' },
        { path: '/map', label: 'Service Territory Map', icon: MapPin, badge: 'GIS' },
        { path: '/faults', label: 'All Incidents', icon: AlertTriangle },
        { path: '/experience', label: 'Cinematic Story', icon: Sparkles, badge: 'Motion' },
      ];
    } else if (userRole === 'installation_owner') {
      return [
        { path: '/dashboard', label: 'Resident Portal', icon: Sun, badge: 'Owner' },
        { path: '/faults', label: 'Request Maintenance', icon: AlertTriangle, badge: 'Request' },
        { path: '/maintenance', label: 'Track Maintainer', icon: Wrench, badge: 'Live' },
        { path: '/assets', label: 'My Solar Panels', icon: Layers },
        { path: '/map', label: 'Local Solar Map', icon: MapPin },
        { path: '/experience', label: 'Cinematic Story', icon: Sparkles, badge: 'Motion' },
      ];
    } else {
      // Default: Distributor (Assigns tasks to maintainers from requests)
      return [
        { path: '/dashboard', label: 'Distributor Hub', icon: Layers },
        { path: '/faults', label: 'Nearby Requests', icon: AlertTriangle, badge: 'New' },
        { path: '/maintenance', label: 'Assign Maintainers', icon: Wrench, badge: 'Dispatch' },
        { path: '/map', label: 'Geospatial Grid', icon: MapPin, badge: 'PostGIS' },
        { path: '/assets', label: 'Solar Fleet Registry', icon: Sun },
        { path: '/analytics', label: 'Network Analytics', icon: BarChart3 },
        { path: '/experience', label: 'Cinematic Story', icon: Sparkles, badge: 'Motion' },
      ];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = getMenuItems();

  const roleLabel = (userRole === 'distributor' || userRole === 'admin')
    ? 'Distributor (Task Assigner)' 
    : (userRole === 'technician' || userRole === 'maintainer')
    ? 'Field Maintainer (Assigned Tasks)' 
    : 'Nearby Resident / Owner';

  return (
    <aside className="sidebar" style={{ background: 'rgba(11, 17, 32, 0.95)', backdropFilter: 'blur(20px)' }}>
      <div className="sidebar-header" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <div className="brand-badge">
          <Sun size={22} className="text-white" />
        </div>
        <div>
          <h1 className="brand-name">SolarSync</h1>
          <span style={{ fontSize: '0.675rem', color: '#10B981', letterSpacing: '0.06em', fontWeight: 600 }}>
            {roleLabel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Role Context Pill */}
      <div style={{
        margin: '0.75rem 0.85rem 0.25rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '10px',
        background: (userRole === 'distributor' || userRole === 'admin')
          ? 'rgba(59, 130, 246, 0.12)' 
          : (userRole === 'technician' || userRole === 'maintainer')
          ? 'rgba(56, 189, 248, 0.08)' 
          : 'rgba(245, 158, 11, 0.08)',
        border: `1px solid ${(userRole === 'distributor' || userRole === 'admin') ? 'rgba(59, 130, 246, 0.3)' : (userRole === 'technician' || userRole === 'maintainer') ? 'rgba(56, 189, 248, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: (userRole === 'distributor' || userRole === 'admin') ? '#2563EB' : (userRole === 'technician' || userRole === 'maintainer') ? '#0284C7' : '#D97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#F9FAFB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser?.full_name || 'Active User'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser?.email || 'Logged In'}
          </div>
        </div>
      </div>

      {/* Dynamic Nav Links */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.7rem 0.85rem',
                borderRadius: '10px',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                background: isActive ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                color: isActive ? '#34D399' : '#94A3B8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.18s'
              }}
            >
              <Icon size={18} color={isActive ? '#10B981' : '#94A3B8'} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer with Session Control */}
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.55rem',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#F87171',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
        >
          <LogOut size={15} />
          Sign Out of Grid
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.65rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.675rem',
          color: '#64748B'
        }}>
          <Server size={14} color="#10B981" />
          <span style={{ flex: 1, fontFamily: 'var(--font-mono)' }}>PostGIS • Celery • 4K</span>
          <ShieldCheck size={13} color="#10B981" />
        </div>
      </div>
    </aside>
  );
}
