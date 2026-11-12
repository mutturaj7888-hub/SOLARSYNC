import React, { useState } from 'react';
import { 
  Sun, 
  ShieldCheck, 
  Wrench, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Database,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import GlobalScrollBackground from '../components/cinematic/GlobalScrollBackground';

export default function LoginPage() {
  const { login, register, logout, isAuthenticated, currentUser, mongoStatus } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState(''); // Name, Username, or Email
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('admin'); // 'admin' | 'technician' | 'installation_owner'

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await login(identifier, password);
        setSuccessMsg(`Welcome back, ${user.full_name || 'User'} (${user.role.toUpperCase()})`);
        setTimeout(() => navigate('/dashboard'), 300);
      } else {
        const user = await register({
          name: name,
          full_name: name,
          username: name,
          password: password,
          role: role
        });
        setSuccessMsg(`Account registered for ${user.full_name}! Saved to MongoDB.`);
        setTimeout(() => navigate('/dashboard'), 400);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Authentication failed. Please verify credentials.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAndSwitch = () => {
    logout();
    setIdentifier('');
    setName('');
    setPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2.5rem 1.25rem',
      position: 'relative',
      color: '#F9FAFB'
    }}>
      {/* 4K Global Scroll-Scrubbing Background Video */}
      <GlobalScrollBackground opacity={0.65} />

      {/* Floating Top Header */}
      <header style={{
        position: 'absolute',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 3rem)',
        maxWidth: '1200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.45)'
          }}>
            <Sun size={20} />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#FFF' }}>
              SolarSync
            </span>
            <span style={{ display: 'block', fontSize: '0.675rem', color: '#34D399', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              ENTERPRISE ASSET OS
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/experience"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#E2E8F0',
              textDecoration: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={14} color="#34D399" />
            4K Interactive Story
          </Link>
        </div>
      </header>

      {/* Main Glassmorphic Auth Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(11, 20, 38, 0.85)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: '2.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.1)',
        zIndex: 10,
        marginTop: '2rem'
      }}>

        {/* Database Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 0.85rem',
          borderRadius: '9999px',
          background: mongoStatus.connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${mongoStatus.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          marginBottom: '1.25rem',
          fontSize: '0.725rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Database size={13} color={mongoStatus.connected ? '#10B981' : '#F59E0B'} />
            <span style={{ fontWeight: 600, color: mongoStatus.connected ? '#34D399' : '#FBBF24' }}>
              {mongoStatus.connected ? 'MongoDB Active' : 'MongoDB Storage'}
            </span>
          </div>
          <span style={{ color: '#94A3B8', fontFamily: 'monospace' }}>
            {mongoStatus.usersCount} Stored Credentials
          </span>
        </div>

        {/* If user is already authenticated, show active session switcher */}
        {isAuthenticated && currentUser ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: currentUser.role === 'admin' 
                ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' 
                : currentUser.role === 'technician' 
                ? 'linear-gradient(135deg, #10B981, #059669)' 
                : 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
            }}>
              {currentUser.full_name?.charAt(0) || 'U'}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', marginBottom: '0.25rem' }}>
              {currentUser.full_name}
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
              {currentUser.email}
            </p>

            <div style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: currentUser.role === 'admin' 
                ? 'rgba(59, 130, 246, 0.2)' 
                : currentUser.role === 'technician' 
                ? 'rgba(16, 185, 129, 0.2)' 
                : 'rgba(245, 158, 11, 0.2)',
              color: currentUser.role === 'admin' 
                ? '#60A5FA' 
                : currentUser.role === 'technician' 
                ? '#34D399' 
                : '#FBBF24',
              marginBottom: '1.75rem'
            }}>
              ● {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'technician' ? 'Maintainer / Technician' : 'Solar Asset Owner'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
                }}
              >
                Go to Workspace Console
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={handleSignOutAndSwitch}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#E2E8F0',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <LogOut size={15} />
                Sign In with Another Account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mode Switch Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              padding: '0.3rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              marginBottom: '1.5rem'
            }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '0.6rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: mode === 'login' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
                  color: mode === 'login' ? '#FFF' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: mode === 'login' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  padding: '0.6rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: mode === 'register' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
                  color: mode === 'register' ? '#FFF' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: mode === 'register' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                Register Account
              </button>
            </div>

            {/* Error & Success Alerts */}
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#FDA4AF',
                fontSize: '0.8rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6EE7B7',
                fontSize: '0.8rem',
                marginBottom: '1.25rem'
              }}>
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mode === 'register' ? (
                <>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem', display: 'block' }}>
                      YOUR NAME OR USERNAME
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748B' }} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name (e.g. Nagaraj)"
                        style={{
                          width: '100%',
                          padding: '0.7rem 1rem 0.7rem 2.4rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          color: '#FFF',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem', display: 'block' }}>
                      SELECT YOUR ROLE
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        style={{
                          padding: '0.6rem 0.4rem',
                          borderRadius: '8px',
                          border: role === 'admin' ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: role === 'admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          color: role === 'admin' ? '#93C5FD' : '#94A3B8',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        👑 Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('technician')}
                        style={{
                          padding: '0.6rem 0.4rem',
                          borderRadius: '8px',
                          border: role === 'technician' ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: role === 'technician' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          color: role === 'technician' ? '#6EE7B7' : '#94A3B8',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        🔧 Maintainer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('installation_owner')}
                        style={{
                          padding: '0.6rem 0.4rem',
                          borderRadius: '8px',
                          border: role === 'installation_owner' ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: role === 'installation_owner' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          color: role === 'installation_owner' ? '#FCD34D' : '#94A3B8',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ☀️ Owner
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem', display: 'block' }}>
                      PASSWORD
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748B' }} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        style={{
                          width: '100%',
                          padding: '0.7rem 1rem 0.7rem 2.4rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          color: '#FFF',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem', display: 'block' }}>
                      NAME, USERNAME OR EMAIL
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748B' }} />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter your registered name or email"
                        style={{
                          width: '100%',
                          padding: '0.7rem 1rem 0.7rem 2.4rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          color: '#FFF',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem', display: 'block' }}>
                      PASSWORD
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748B' }} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        style={{
                          width: '100%',
                          padding: '0.7rem 1rem 0.7rem 2.4rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          color: '#FFF',
                          fontSize: '0.85rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Workspace' : 'Complete Registration & Store in MongoDB'}
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
