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
  const [backdropMode] = useState('3d');

  // Selected Role: 'distributor' | 'technician' | 'installation_owner'
  const [selectedRole, setSelectedRole] = useState('distributor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'SOLARSYNC — Smart Solar Asset & Maintenance Network';
    document.documentElement.lang = 'en';

    return () => {
      document.title = prevTitle;
    };
  }, []);

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
        </header>

        {/* Row 2: Right-Aligned Voice Entry / Terminal Access Form Body */}
        <div className="solar-hero__body">
          <div className="solar-panel">
            {/* 1) H1 */}
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
              color: selectedRole === 'distributor' ? '#EF4444' : selectedRole === 'technician' ? '#34D399' : '#FBBF24',
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

