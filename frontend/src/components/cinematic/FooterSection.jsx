import React from 'react';
import { ArrowRight, Compass, LogIn, MapPin, Sparkles, Sun } from 'lucide-react';

export default function FooterSection({ onEnterApp, onOpenAuth, onOpenMap }) {
  return (
    <footer style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '6rem 2rem 4rem',
      position: 'relative',
      zIndex: 10,
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#F9FAFB'
    }}>
      {/* Glow Backdrop */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main CTA Container */}
      <div style={{
        background: 'rgba(11, 20, 38, 0.85)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '32px',
        padding: 'clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
        width: '100%',
        boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.9), 0 0 50px rgba(16, 185, 129, 0.15)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34D399',
          fontSize: '0.785rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '1.5rem'
        }}>
          <Sun size={15} />
          Decentralized Clean Energy Operations
        </div>

        <h2 style={{
          fontSize: 'clamp(2.25rem, 5vw, 4rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          maxWidth: '820px',
          margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, #FFFFFF 20%, #A7F3D0 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Make every solar installation smarter.
        </h2>

        <p style={{
          fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
          color: '#94A3B8',
          maxWidth: '650px',
          margin: '0 auto 2.75rem',
          lineHeight: 1.6
        }}>
          Connect your rooftop assets, coordinate dispatch with certified field maintainers, and maintain zero-friction verified repairs.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '3.5rem'
        }}>
          <button
            onClick={onEnterApp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.95rem 2.25rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.45)',
              transition: 'all 0.25s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Compass size={18} />
            Explore Dashboard
            <ArrowRight size={17} />
          </button>

          <button
            onClick={onOpenAuth}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.95rem 2rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(10px)',
              color: '#FFF',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
          >
            <LogIn size={17} />
            Sign In / Register
          </button>

          <button
            onClick={onOpenMap}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.95rem 1.85rem',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              background: 'rgba(56, 189, 248, 0.08)',
              color: '#38BDF8',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.16)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'}
          >
            <MapPin size={17} />
            Geospatial Explorer
          </button>
        </div>

        {/* Tech Stack Badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {['FastAPI 0.111', 'PostgreSQL 16 + PostGIS', 'Leaflet Geospatial', 'Celery & Redis', 'React 18 & Vite'].map((tech, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.75rem',
                color: '#94A3B8',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', color: '#64748B', fontSize: '0.75rem' }}>
        SolarSync © 2026 • Intelligent Clean Energy Asset & Maintenance Platform • Production Build v1.0.0
      </div>
    </footer>
  );
}

