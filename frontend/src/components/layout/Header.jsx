import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

/**
 * Header — ECHOID Ultra-Minimal Top Navigation Bar
 * Sora 200 Logo, JetBrains Mono uppercase links, and crisp rectangular controls.
 */
export default function Header({ healthStatus, onRefreshHealth }) {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDistributor = !userRole || userRole === 'distributor' || userRole === 'admin';
  const isMaintainer = userRole === 'technician' || userRole === 'maintainer';
  const isResident = userRole === 'installation_owner';

  const getNavLinks = () => {
    if (isResident) {
      return [
        { path: '/dashboard', label: 'Console' },
        { path: '/faults', label: 'Report Issue' },
        { path: '/maintenance', label: 'Track Repairs' },
        { path: '/assets', label: 'My Solar Panels' },
        { path: '/map', label: 'Solar Map' },
      ];
    }
    if (isMaintainer) {
      return [
        { path: '/dashboard', label: 'Console' },
        { path: '/maintenance', label: 'Work Orders' },
        { path: '/faults', label: 'Faults' },
        { path: '/map', label: 'Territory Map' },
      ];
    }
    return [
      { path: '/dashboard', label: 'Console' },
      { path: '/maintenance', label: 'Dispatch & Assign' },
      { path: '/faults', label: 'Incident Requests' },
      { path: '/map', label: 'Geospatial Grid' },
      { path: '/assets', label: 'Asset Fleet' },
      { path: '/analytics', label: 'Analytics' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="top-navbar" style={{
      height: '68px',
      background: 'rgba(0, 0, 0, 0.94)',
      backdropFilter: 'blur(28px)',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 clamp(20px, 3.5vw, 48px)',
      position: 'sticky',
      top: 0,
      zIndex: 60
    }}>
      {/* Left: ECHOID Sora 200 Logo */}
      <a
        href="/"
        onClick={(e) => { e.preventDefault(); navigate('/'); }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 200,
          fontSize: 'clamp(20px, 1.6vw, 26px)',
          letterSpacing: '0.16em',
          color: '#FFFFFF',
          textDecoration: 'none',
          lineHeight: 1
        }}
      >
        SOLARSYNC
      </a>

      {/* Center: Desktop Navigation Cluster */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(12px, 1.8vw, 28px)'
      }}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              type="button"
              onClick={() => navigate(link.path)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(11px, 0.76vw, 13px)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                borderBottom: isActive ? '1px solid #FFFFFF' : '1px solid transparent',
                transition: 'color 0.2s, border-color 0.2s'
              }}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Right: Role Chip & Sign Out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {currentUser ? (
          <>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '6px 12px',
              border: '1px solid var(--line-strong)',
              background: 'var(--fill-solid)',
              color: isDistributor ? '#93C5FD' : isMaintainer ? '#6EE7B7' : '#FCD34D'
            }}>
              ● {isDistributor ? 'DISTRIBUTOR' : isMaintainer ? 'MAINTAINER' : 'RESIDENT'}
            </div>

            <button
              type="button"
              onClick={() => { logout(); navigate('/login'); }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '6px 12px',
                border: '1px solid var(--line)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-primary"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.75rem' }}
          >
            Enter OS
          </button>
        )}
      </div>
    </header>
  );
}
