import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Wrench, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', onSuccess = () => {} }) {
  const { login, register, quickSwitchRole } = useAuth();
  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('technician'); // 'admin' | 'technician' | 'installation_owner'
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await login(email, password);
        setSuccessMsg(`Welcome back, ${user.full_name || 'User'}!`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 600);
      } else {
        const user = await register({
          email,
          password,
          full_name: fullName,
          phone_number: phoneNumber || '+91 98000 00000',
          role
        });
        setSuccessMsg(`Account created successfully as ${role.replace('_', ' ').toUpperCase()}!`);
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 700);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Authentication failed. Please check credentials.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleKey) => {
    setLoading(true);
    try {
      await quickSwitchRole(roleKey);
      setSuccessMsg(`Logged in with demo ${roleKey.toUpperCase()} account.`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg("Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#0D1527',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        padding: '2rem',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.15)',
        position: 'relative',
        color: '#F9FAFB'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9CA3AF',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.75rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={24} color="#10B981" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            {mode === 'login' ? 'Sign in to SolarSync' : 'Create SolarSync Account'}
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#9CA3AF', marginTop: '0.35rem' }}>
            {mode === 'login' 
              ? 'Connect to manage assets, dispatch maintainers & report faults' 
              : 'Choose your role and join the decentralized solar maintenance grid'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '12px',
          padding: '0.25rem',
          marginBottom: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9px',
              border: 'none',
              background: mode === 'login' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
              color: mode === 'login' ? '#FFF' : '#9CA3AF',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '9px',
              border: 'none',
              background: mode === 'register' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
              color: mode === 'register' ? '#FFF' : '#9CA3AF',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#F87171',
            fontSize: '0.8rem',
            marginBottom: '1rem'
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
            padding: '0.65rem 0.85rem',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            color: '#34D399',
            fontSize: '0.8rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem', display: 'block' }}>
                  FULL NAME
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikramaditya Rao"
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
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
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem', display: 'block' }}>
                  SELECT SYSTEM ROLE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'admin', label: 'Admin', desc: 'Dispatch & Ops', icon: ShieldCheck },
                    { id: 'technician', label: 'Maintainer', desc: 'Field Repairs', icon: Wrench },
                    { id: 'installation_owner', label: 'Owner / User', desc: 'Report Faults', icon: User }
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSel = role === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        style={{
                          padding: '0.65rem 0.45rem',
                          borderRadius: '10px',
                          border: `1px solid ${isSel ? '#10B981' : 'rgba(255, 255, 255, 0.08)'}`,
                          background: isSel ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.18s'
                        }}
                      >
                        <Icon size={18} color={isSel ? '#10B981' : '#9CA3AF'} style={{ margin: '0 auto 0.25rem' }} />
                        <div style={{ fontSize: '0.775rem', fontWeight: 600, color: isSel ? '#34D399' : '#E5E7EB' }}>
                          {r.label}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>{r.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem', display: 'block' }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@solarsync.io"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
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
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '0.35rem', display: 'block' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
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

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Workspace' : 'Complete Registration'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Test Access */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.725rem', color: '#6B7280', textAlign: 'center', marginBottom: '0.65rem' }}>
            OR 1-CLICK INSTANT TEST LOGIN
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                background: 'rgba(16, 185, 129, 0.08)',
                color: '#34D399',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('technician')}
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                background: 'rgba(56, 189, 248, 0.08)',
                color: '#38BDF8',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🔧 Maintainer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('owner')}
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                background: 'rgba(245, 158, 11, 0.08)',
                color: '#FBBF24',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ☀️ Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

