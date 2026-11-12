import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Solar3DCanvas from '../components/3d/Solar3DCanvas';
import './SolarEchoidLanding.css';

/**
 * SolarEchoidLanding — SolarSync Cinematic 3D Dark Hero Landing
 * Implements the exact ECHOID aesthetic, design tokens, and typography:
 * - Pure Black (#000000)
 * - Sora (200, 300) & JetBrains Mono (300, 400)
 * - Real-time Interactive 3D Photovoltaic Grid & Energy Matrix (Three.js)
 * - Role-Scoped Architecture: Distributor (Assigner), Maintainer (Worker), Resident (Requester)
 */
export default function SolarEchoidLanding() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, currentUser } = useAuth();

  // Mode: '3d' or 'video'
  const [backdropMode, setBackdropMode] = useState('3d');
  const [menuOpen, setMenuOpen] = useState(false);

  // Selected Role: 'distributor' | 'technician' | 'installation_owner'
  const [selectedRole, setSelectedRole] = useState('distributor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const toggleBtnRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'SOLARSYNC — Smart Solar Asset & Maintenance Network';
    document.documentElement.lang = 'en';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        if (toggleBtnRef.current) toggleBtnRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.title = prevTitle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setStatusMsg('Please enter a username');
      return;
    }
    setLoading(true);
    setStatusMsg('');

    try {
      const pwd = password.trim() || 'solarsync123';
      if (isRegister) {
        await register({
          name: username,
          username: username,
          password: pwd,
          role: selectedRole
        });
      } else {
        await login(username, pwd);
      }
      navigate('/dashboard');
    } catch (err) {
      // If login failed, try quick auto-register or show error
      try {
        await register({
          name: username,
          username: username,
          password: password.trim() || 'solarsync123',
          role: selectedRole
        });
        navigate('/dashboard');
      } catch (regErr) {
        setStatusMsg(err.response?.data?.detail || err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="solar-echoid-page">
      <section className="solar-hero">
        {/* Background Layer: 3D Holographic Canvas OR Cinematic Video */}
        <div className="solar-hero__media">
          {backdropMode === '3d' ? (
            <Solar3DCanvas
              activeRole={selectedRole}
              onRequestClick={(r) => navigate('/faults')}
              onMaintainerClick={(m) => navigate('/maintenance')}
            />
          ) : (
            <video
              className="solar-hero__video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="https://motionsites.org/assets/prompt-media/6b2162f1b10315621d52.png"
            >
              <source
                src="https://motionsites.org/assets/prompt-media/5627e9874aa303843b2e.mp4"
                type="video/mp4"
              />
            </video>
          )}

          {/* Dual Gradient Scrim Overlay */}
          <div className="solar-hero__scrim" />
        </div>

        {/* Row 1: Navbar */}
        <header className="solar-hero__nav">
          <a href="#" className="solar-hero__logo" onClick={() => navigate('/dashboard')}>
            SOLARSYNC
          </a>

          <div className="solar-hero__nav-cluster">
            {/* Desktop Navigation Links */}
            <nav className="solar-hero__nav-links">
              <button 
                type="button" 
                onClick={() => setBackdropMode(backdropMode === '3d' ? 'video' : '3d')} 
                className="solar-hero__mode-switch"
              >
                [ VIEW: {backdropMode === '3d' ? '3D MATRIX' : 'CINEMATIC'} ]
              </button>
              <a href="/map" className="solar-hero__nav-link" onClick={(e) => { e.preventDefault(); navigate('/map'); }}>
                Map
              </a>
              <a href="/faults" className="solar-hero__nav-link" onClick={(e) => { e.preventDefault(); navigate('/faults'); }}>
                Requests
              </a>
              <a href="/maintenance" className="solar-hero__nav-link" onClick={(e) => { e.preventDefault(); navigate('/maintenance'); }}>
                Dispatch
              </a>
            </nav>

            {/* Desktop CTA */}
            {isAuthenticated ? (
              <a href="/dashboard" className="solar-hero__nav-cta" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
                CONSOLE ({currentUser?.role === 'distributor' ? 'DISTRIBUTOR' : currentUser?.role === 'technician' ? 'MAINTAINER' : 'RESIDENT'})
              </a>
            ) : (
              <a href="/login" className="solar-hero__nav-cta" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                ENTER OS
              </a>
            )}

            {/* Mobile Hamburger */}
            <button
              ref={toggleBtnRef}
              className="solar-hero__menu-toggle"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="solarMobileMenu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="solar-hero__menu-bar solar-hero__menu-bar--1" />
              <span className="solar-hero__menu-bar solar-hero__menu-bar--2" />
              <span className="solar-hero__menu-bar solar-hero__menu-bar--3" />
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <div
          id="solarMobileMenu"
          ref={mobileMenuRef}
          className="solar-mobile-menu"
          data-open={menuOpen ? 'true' : 'false'}
          role="dialog"
          aria-modal="true"
          aria-label="SolarSync Menu"
          aria-hidden={!menuOpen}
          inert={!menuOpen ? '' : undefined}
          onClick={(e) => {
            if (e.target === mobileMenuRef.current) setMenuOpen(false);
          }}
        >
          <a href="/dashboard" className="solar-mobile-menu__link" onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}>
            Console
          </a>
          <a href="/map" className="solar-mobile-menu__link" onClick={() => { setMenuOpen(false); navigate('/map'); }}>
            Geospatial Map
          </a>
          <a href="/faults" className="solar-mobile-menu__link" onClick={() => { setMenuOpen(false); navigate('/faults'); }}>
            Nearby Requests
          </a>
          <a href="/maintenance" className="solar-mobile-menu__link" onClick={() => { setMenuOpen(false); navigate('/maintenance'); }}>
            Task Dispatch
          </a>
          <button
            type="button"
            className="solar-hero__mode-switch"
            style={{ marginTop: '16px' }}
            onClick={() => { setBackdropMode(backdropMode === '3d' ? 'video' : '3d'); setMenuOpen(false); }}
          >
            TOGGLE {backdropMode === '3d' ? 'VIDEO BACKDROP' : '3D HOLOGRAPHIC GRID'}
          </button>
        </div>

        {/* Row 2: Right-Aligned Voice Entry / Terminal Access Form Body */}
        <div className="solar-hero__body">
          <div className="solar-panel">
            {/* 1) Chip */}
            <div className="solar-panel__chip">
              [ 3D SOLAR ASSET NETWORK ]
            </div>

            {/* 2) H1 */}
            <h1 className="solar-panel__h1">
              SOLARSYNC
            </h1>

            {/* 3) Tagline */}
            <p className="solar-panel__tagline">
              Autonomous task distribution & solar maintenance network.
            </p>

            {/* Role Selector Tabs (Distributor, Maintainer, Resident) */}
            <div className="solar-role-tabs">
              <button
                type="button"
                className={`solar-role-tab ${selectedRole === 'distributor' ? 'solar-role-tab--active' : ''}`}
                onClick={() => setSelectedRole('distributor')}
                title="Distributor: Assigns tasks to maintainers from nearby requests"
              >
                Distributor
              </button>
              <button
                type="button"
                className={`solar-role-tab ${selectedRole === 'technician' ? 'solar-role-tab--active' : ''}`}
                onClick={() => setSelectedRole('technician')}
                title="Maintainer: Gets assigned tasks"
              >
                Maintainer
              </button>
              <button
                type="button"
                className={`solar-role-tab ${selectedRole === 'installation_owner' ? 'solar-role-tab--active' : ''}`}
                onClick={() => setSelectedRole('installation_owner')}
                title="Resident: Requests help and reports problems nearby"
              >
                Resident
              </button>
            </div>

            {/* Dynamic Status / Role Description */}
            <div style={{
              marginTop: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.725rem',
              color: selectedRole === 'distributor' ? '#60A5FA' : selectedRole === 'technician' ? '#34D399' : '#FBBF24',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              ● {selectedRole === 'distributor'
                ? 'Distributor Mode: Assign tasks to maintainers from requests of people nearby'
                : selectedRole === 'technician'
                ? 'Maintainer Mode: View assigned work orders & submit photo proof'
                : 'Resident Mode: Report nearby solar issues & track assigned maintainer'}
            </div>

            {/* Status / Error Alert */}
            {statusMsg && (
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#FDA4AF',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem'
              }}>
                {statusMsg}
              </div>
            )}

            {/* 4) Form */}
            <form className="solar-panel__form" noValidate onSubmit={handleSubmit}>
              <div style={{ width: '100%', position: 'relative' }}>
                <input
                  type="text"
                  className="solar-panel__input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div style={{ width: '100%', position: 'relative' }}>
                <input
                  type="password"
                  className="solar-panel__input"
                  placeholder="Password (default: solarsync123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn--solid"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid var(--sol-line-strong)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.22em'
                }}
              >
                {loading ? 'Authenticating...' : isRegister ? 'Register & Enter Workspace' : 'Access Workspace'}
              </button>

              <button
                type="button"
                className="btn--ghost"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'Switch to Sign In' : 'First Time? Create Credentials'}
              </button>
            </form>

            {/* 5) Direct Demo / Explore Link */}
            <a
              href="/dashboard"
              className="panel__referral"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard');
              }}
              style={{ marginTop: '24px' }}
            >
              Skip to Live Console →
            </a>
          </div>
        </div>

        {/* Row 3: Legal Footer */}
        <footer className="solar-hero__footer">
          <p className="solar-hero__footer-text">
            SolarSync Autonomous Network connects nearby residents, task distributors, and field maintainers.{' '}
            <a href="#privacy-notice" className="solar-hero__footer-link">
              Privacy Notice
            </a>{' '}
            and{' '}
            <a href="#service-contract" className="solar-hero__footer-link">
              Service Contract
            </a>
            .
          </p>
        </footer>
      </section>
    </div>
  );
}

