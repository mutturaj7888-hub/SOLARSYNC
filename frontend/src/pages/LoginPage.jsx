import React, { useState } from 'react';
import { 
  Sun, 
  User, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Database,
  LogOut,
  Radio,
  Wrench,
  Home,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Solar3DCanvas from '../components/3d/Solar3DCanvas';

export default function LoginPage() {
  const { login, register, logout, isAuthenticated, currentUser, mongoStatus } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('distributor'); // 'distributor' | 'maintainer' | 'installation_owner'

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fast 1-click credential auto-fill & login
  const handleQuickLogin = async (id, pwd, label) => {
    setIdentifier(id);
    setPassword(pwd);
    setErrorMsg('');
    setSuccessMsg(`Authenticating as ${label}...`);
    setLoading(true);
    try {
      const user = await login(id, pwd);
      setSuccessMsg(`Welcome, ${user.full_name || id} (${(user.role || '').toUpperCase()})`);
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Authentication failed.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await login(identifier, password);
        setSuccessMsg(`Authenticated as ${user.full_name || 'User'} • ${(user.role || '').toUpperCase()}`);
        setTimeout(() => navigate('/dashboard'), 350);
      } else {
        const user = await register({
          name: name.trim(),
          full_name: name.trim(),
          username: name.trim(),
          password: password,
          role: role === 'maintainer' ? 'technician' : role
        });
        setSuccessMsg(`Account created for ${user.full_name}! Registered in MongoDB.`);
        setTimeout(() => navigate('/dashboard'), 400);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Authentication error occurred.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    setIdentifier('');
    setName('');
    setPassword('');
    setErrorMsg('');
    setSuccessMsg('Session closed. Ready for new authentication.');
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#000000',
      color: '#ffffff',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Background 3D Moving Glowing Sun Canvas */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.85
      }}>
        <Solar3DCanvas activeRole={role} />
      </div>

      {/* Scrim Gradient Overlays (ECHOID spec) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'linear-gradient(to right, transparent 0%, transparent 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.85) 100%)'
      }} />

      {/* Top Navbar */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px clamp(20px, 4vw, 56px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(16px)'
      }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'baseline', 
            gap: '12px' 
          }}
        >
          <span style={{
            fontFamily: 'var(--font-display, "Sora", sans-serif)',
            fontWeight: 200,
            fontSize: 'clamp(20px, 1.8vw, 26px)',
            letterSpacing: '0.18em',
            color: '#ffffff',
            textTransform: 'uppercase'
          }}>
            SOLARSYNC
          </span>
          <span style={{
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase'
          }}>
            // AUTH GATEWAY
          </span>
        </Link>
      </header>

      {/* Main Viewport Content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 'clamp(24px, 4vw, 64px)'
      }}>
        {/* ECHOID Auth Terminal Container */}
        <div style={{
          width: '100%',
          maxWidth: '540px',
          background: 'rgba(4, 4, 6, 0.88)',
          backdropFilter: 'blur(30px) saturate(140%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.95)',
          padding: 'clamp(24px, 3.2vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Chip */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            fontSize: '0.68rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#ffa200',
            alignSelf: 'flex-start'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#ffa200',
              borderRadius: '50%',
              boxShadow: '0 0 10px #ffa200'
            }} />
            IDENTITY // TERMINAL ACCESS
          </div>

          {/* Heading */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display, "Sora", sans-serif)',
              fontWeight: 200,
              fontSize: 'clamp(26px, 2.4vw, 36px)',
              letterSpacing: '0.06em',
              margin: '0 0 6px 0',
              color: '#ffffff',
              lineHeight: 1.15
            }}>
              {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontWeight: 300,
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              color: 'rgba(255, 255, 255, 0.55)',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              {mode === 'login' 
                ? 'ACCESS THE DISTRIBUTOR & MAINTAINER DISPATCH NETWORK'
                : 'ENROLL AS DISTRIBUTOR, MAINTAINER, OR RESIDENT'}
            </p>
          </div>

          {/* Active Session Notification (Non-blocking) */}
          {isAuthenticated && currentUser && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize: '0.7rem'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.55)' }}>
                  ACTIVE SESSION:
                </span>
                <span style={{ color: '#34d399', fontWeight: 500, letterSpacing: '0.08em' }}>
                  {currentUser.full_name || currentUser.username} • {(currentUser.role || '').toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Enter Console →
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  style={{
                    padding: '8px 12px',
                    background: 'transparent',
                    color: 'rgba(255, 255, 255, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Mode Switch Tabs (LOGIN vs REGISTER) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            border: '1px solid rgba(255, 255, 255, 0.16)'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                padding: '12px',
                background: mode === 'login' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: mode === 'login' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                borderRight: '1px solid rgba(255, 255, 255, 0.16)',
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize: '0.74rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: mode === 'login' ? 500 : 400,
                transition: 'all 0.2s'
              }}
            >
              01 // SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{
                padding: '12px',
                background: mode === 'register' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: mode === 'register' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize: '0.74rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontWeight: mode === 'register' ? 500 : 400,
                transition: 'all 0.2s'
              }}
            >
              02 // REGISTER
            </button>
          </div>

          {/* Notifications */}
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '0.72rem'
            }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fontSize: '0.72rem'
            }}>
              <CheckCircle2 size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1-Click Fast Presets (Only on Login mode) */}
          {mode === 'login' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize: '0.62rem',
                letterSpacing: '0.18em',
                color: 'rgba(255, 255, 255, 0.4)',
                textTransform: 'uppercase'
              }}>
                // 1-CLICK INSTANT DEMO ACCESS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('distributor@solarsync.io', 'SolarDist123!', 'Distributor')}
                  style={{
                    padding: '8px 6px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#93c5fd',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    textAlign: 'center',
                    lineHeight: 1.3
                  }}
                >
                  <Radio size={12} style={{ display: 'block', margin: '0 auto 4px' }} />
                  Distributor
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tech@solarsync.io', 'SolarTech123!', 'Maintainer')}
                  style={{
                    padding: '8px 6px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6ee7b7',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    textAlign: 'center',
                    lineHeight: 1.3
                  }}
                >
                  <Wrench size={12} style={{ display: 'block', margin: '0 auto 4px' }} />
                  Maintainer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('owner@solarsync.io', 'SolarOwner123!', 'Resident')}
                  style={{
                    padding: '8px 6px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#fcd34d',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    textAlign: 'center',
                    lineHeight: 1.3
                  }}
                >
                  <Home size={12} style={{ display: 'block', margin: '0 auto 4px' }} />
                  Resident
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' ? (
              <>
                {/* Username / Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.16em',
                    color: 'rgba(255, 255, 255, 0.65)',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>
                    FULL NAME / USERNAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Joshi"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 0,
                      color: '#ffffff',
                      fontFamily: 'var(--font-display, "Sora", sans-serif)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>

                {/* Role Selector (Strictly Distributor, Maintainer, Resident) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.16em',
                    color: 'rgba(255, 255, 255, 0.65)',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    SELECT ROLE IN SYSTEM *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                    {/* Option 1: Distributor */}
                    <div
                      onClick={() => setRole('distributor')}
                      style={{
                        padding: '12px',
                        border: role === 'distributor' ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: role === 'distributor' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                          fontSize: '0.74rem',
                          fontWeight: 500,
                          letterSpacing: '0.12em',
                          color: role === 'distributor' ? '#93c5fd' : '#ffffff'
                        }}>
                          📡 DISTRIBUTOR
                        </span>
                        <span style={{
                          fontSize: '0.6rem',
                          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                          color: '#3b82f6'
                        }}>
                          {role === 'distributor' ? 'ACTIVE' : ''}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.68rem',
                        color: 'rgba(255, 255, 255, 0.55)',
                        fontFamily: 'var(--font-display, "Sora", sans-serif)'
                      }}>
                        Assigns maintenance tasks to maintainers based on requests from people nearby.
                      </div>
                    </div>

                    {/* Option 2: Maintainer */}
                    <div
                      onClick={() => setRole('maintainer')}
                      style={{
                        padding: '12px',
                        border: role === 'maintainer' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: role === 'maintainer' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                          fontSize: '0.74rem',
                          fontWeight: 500,
                          letterSpacing: '0.12em',
                          color: role === 'maintainer' ? '#6ee7b7' : '#ffffff'
                        }}>
                          🔧 MAINTAINER
                        </span>
                        <span style={{
                          fontSize: '0.6rem',
                          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                          color: '#10b981'
                        }}>
                          {role === 'maintainer' ? 'ACTIVE' : ''}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.68rem',
                        color: 'rgba(255, 255, 255, 0.55)',
                        fontFamily: 'var(--font-display, "Sora", sans-serif)'
                      }}>
                        Field specialist who gets assigned tasks, inspects faults, and completes repairs.
                      </div>
                    </div>

                    {/* Option 3: Resident */}
                    <div
                      onClick={() => setRole('installation_owner')}
                      style={{
                        padding: '12px',
                        border: role === 'installation_owner' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: role === 'installation_owner' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                          fontSize: '0.74rem',
                          fontWeight: 500,
                          letterSpacing: '0.12em',
                          color: role === 'installation_owner' ? '#fcd34d' : '#ffffff'
                        }}>
                          🏡 NEARBY RESIDENT / SOLAR OWNER
                        </span>
                        <span style={{
                          fontSize: '0.6rem',
                          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                          color: '#f59e0b'
                        }}>
                          {role === 'installation_owner' ? 'ACTIVE' : ''}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.68rem',
                        color: 'rgba(255, 255, 255, 0.55)',
                        fontFamily: 'var(--font-display, "Sora", sans-serif)'
                      }}>
                        Local residents with rooftop solar arrays who report issues and submit repair requests.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.16em',
                    color: 'rgba(255, 255, 255, 0.65)',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>
                    SECURITY PASSWORD * (MIN 3 CHARS)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 0,
                      color: '#ffffff',
                      fontFamily: 'var(--font-display, "Sora", sans-serif)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Identifier */}
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.16em',
                    color: 'rgba(255, 255, 255, 0.65)',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>
                    USERNAME OR EMAIL *
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="distributor@solarsync.io or Rajesh Sharma"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 0,
                      color: '#ffffff',
                      fontFamily: 'var(--font-display, "Sora", sans-serif)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.16em',
                    color: 'rgba(255, 255, 255, 0.65)',
                    marginBottom: '6px',
                    textTransform: 'uppercase'
                  }}>
                    PASSWORD *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: 0,
                      color: '#ffffff',
                      fontFamily: 'var(--font-display, "Sora", sans-serif)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                padding: '14px 20px',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontWeight: 500,
                fontSize: '0.78rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.25s'
              }}
            >
              {loading ? (
                <span>PROCESSING...</span>
              ) : mode === 'login' ? (
                <>
                  <span>SIGN IN TO WORKSPACE</span>
                  <ArrowRight size={15} />
                </>
              ) : (
                <>
                  <span>REGISTER & INITIALIZE OS</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* MongoDB Storage & Connection Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            fontSize: '0.62rem',
            letterSpacing: '0.12em',
            color: 'rgba(255, 255, 255, 0.45)',
            textTransform: 'uppercase'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={11} color={mongoStatus.connected ? '#34d399' : '#fbbf24'} />
              <span>{mongoStatus.connected ? 'MongoDB Active' : 'SQLite Local'}</span>
            </div>
            <span>{mongoStatus.usersCount || 5} Credentials Registered</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '16px clamp(20px, 4vw, 56px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
        fontSize: '0.62rem',
        letterSpacing: '0.14em',
        color: 'rgba(255, 255, 255, 0.35)',
        textTransform: 'uppercase'
      }}>
        <div>SOLARSYNC DISTRIBUTED IDENTITY PROTOCOL · V2.4</div>
        <div>NO ADMIN · DISTRIBUTOR ↔ MAINTAINER ↔ RESIDENT</div>
      </footer>
    </div>
  );
}