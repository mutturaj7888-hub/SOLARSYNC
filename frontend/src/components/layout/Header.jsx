import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Bell, 
  Shield, 
  Sparkles, 
  Check, 
  X, 
  LogOut, 
  Database,
  LogIn,
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationRead } from '../../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Header({ 
  healthStatus, 
  onRefreshHealth
}) {
  const { currentUser, userRole, logout, mongoStatus } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const titles = {
    '/dashboard': userRole === 'technician' ? 'Maintainer Operations Center' : userRole === 'installation_owner' ? 'Rooftop System Telemetry' : 'Command & Fleet Analytics',
    '/map': 'Geospatial Installation Explorer',
    '/assets': 'Solar Rooftop & Farm Inventory',
    '/faults': 'Incident & Fault Management',
    '/maintenance': userRole === 'technician' ? 'My Assigned Work Orders' : userRole === 'installation_owner' ? 'Repair & Maintainer Tracking' : 'Technician Dispatch & Verification',
    '/analytics': 'Reliability & MTTR Analytics',
    '/experience': 'Cinematic 4K Interactive Story',
  };

  const loadNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (e) {}
  };

  useEffect(() => {
    loadNotifs();
    const intv = setInterval(loadNotifs, 20000);
    return () => clearInterval(intv);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="top-navbar" style={{ background: 'rgba(11, 17, 32, 0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="top-nav-left">
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F9FAFB', letterSpacing: '-0.01em', margin: 0 }}>
            {titles[location.pathname] || 'SolarSync Platform'}
          </h2>
          <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>
            {userRole === 'technician' 
              ? 'Field Technician Console • Proximity Dispatch Enabled' 
              : userRole === 'installation_owner' 
              ? 'Owner Portal • Rooftop Telemetry & Direct Triage' 
              : 'Enterprise Overseer • Fleet MTTR & Automated Dispatch'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Backend API Health Pill */}
        <div 
          onClick={onRefreshHealth}
          title="Click to ping API health"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.7rem',
            borderRadius: '9999px',
            background: healthStatus.online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${healthStatus.online ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            cursor: 'pointer'
          }}
        >
          <span 
            className="status-dot" 
            style={{ 
              background: healthStatus.online ? '#10B981' : '#F43F5E',
              boxShadow: healthStatus.online ? '0 0 8px #10B981' : '0 0 8px #F43F5E'
            }} 
          />
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: healthStatus.online ? '#34D399' : '#F43F5E',
            fontFamily: 'monospace'
          }}>
            {healthStatus.online ? 'API ONLINE' : 'API DISCONNECTED'}
          </span>
        </div>

        {/* MongoDB Sync Pill */}
        <div 
          title="MongoDB User Storage Active"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '9999px',
            background: mongoStatus?.connected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${mongoStatus?.connected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
            fontSize: '0.7rem',
            fontWeight: 600,
            color: mongoStatus?.connected ? '#34D399' : '#FBBF24'
          }}
        >
          <Database size={12} />
          <span>MONGO DB</span>
        </div>

        {/* Authentic User Role Badge */}
        {currentUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            background: userRole === 'admin' 
              ? 'rgba(59, 130, 246, 0.15)' 
              : userRole === 'technician' 
              ? 'rgba(16, 185, 129, 0.15)' 
              : 'rgba(245, 158, 11, 0.15)',
            border: userRole === 'admin' 
              ? '1px solid rgba(59, 130, 246, 0.4)' 
              : userRole === 'technician' 
              ? '1px solid rgba(16, 185, 129, 0.4)' 
              : '1px solid rgba(245, 158, 11, 0.4)',
            color: userRole === 'admin' ? '#93C5FD' : userRole === 'technician' ? '#6EE7B7' : '#FCD34D',
            fontSize: '0.725rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            <Shield size={12} />
            {userRole === 'admin' ? 'Administrator' : userRole === 'technician' ? 'Maintainer' : 'Asset Owner'}
          </div>
        )}

        {/* Cinematic Motion View Button */}
        <button
          onClick={() => navigate('/experience')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '9999px',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#34D399',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Switch to Fullscreen 4K Cinematic Scroll Video Experience"
        >
          <Sparkles size={14} />
          4K Interactive
        </button>

        {/* Notifications Icon & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
            title="Maintenance Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--rose-500)',
                color: '#FFF',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(244,63,94,0.6)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              width: '320px',
              background: '#0D1527',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
              padding: '1rem',
              zIndex: 100
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>System Notifications</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{notifications.length} alerts</span>
              </div>
              {notifications.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No active maintenance alerts.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        background: n.is_read ? 'transparent' : 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{n.title}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Avatar & Sign Out */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div 
              onClick={() => navigate('/login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)'
              }}
              title="Click to view Account / Switch User"
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: userRole === 'admin' 
                  ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                  : userRole === 'technician'
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 0 10px rgba(0,0,0,0.5)'
              }}>
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
              </div>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#F9FAFB', lineHeight: 1.2 }}>
                  {currentUser.full_name?.split(' ')[0] || 'User'}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', lineHeight: 1.2 }}>
                  {currentUser.email?.length > 18 ? currentUser.email.substring(0, 16) + '...' : currentUser.email}
                </span>
              </div>
            </div>

            {/* Direct Prominent Log Out Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                background: 'rgba(244, 63, 94, 0.1)',
                color: '#FDA4AF',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Log Out of SolarSync"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFF',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
