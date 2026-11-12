import React from 'react';
import { Sparkles, ArrowRight, ChevronDown, Compass, Play } from 'lucide-react';

export default function HeroSection({ onExplore, onEnterApp, onOpenMap, onOpenAuth }) {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      padding: '4rem 1.5rem 6rem',
      color: '#F9FAFB'
    }}>
      {/* Top Floating Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.45rem 1rem',
        borderRadius: '9999px',
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
        marginBottom: '1.75rem',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <Sparkles size={15} color="#10B981" />
        <span style={{ fontSize: '0.785rem', fontWeight: 600, letterSpacing: '0.06em', color: '#34D399', textTransform: 'uppercase' }}>
          Next-Gen Clean Energy Infrastructure
        </span>
      </div>

      {/* Main Brand Title */}
      <h1 style={{
        fontSize: 'clamp(2.75rem, 7vw, 5.75rem)',
        fontWeight: 800,
        letterSpacing: '-0.035em',
        lineHeight: 1.05,
        margin: '0 0 1rem',
        background: 'linear-gradient(135deg, #FFFFFF 20%, #E2E8F0 60%, #94A3B8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
        SOLARSYNC
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 'clamp(1.1rem, 2.4vw, 1.65rem)',
        fontWeight: 500,
        color: '#E2E8F0',
        maxWidth: '820px',
        margin: '0 auto 1.25rem',
        letterSpacing: '-0.015em',
        textShadow: '0 2px 10px rgba(0,0,0,0.7)'
      }}>
        Smart Solar Asset & Maintenance Network
      </p>

      {/* Editorial Tagline */}
      <div style={{
        maxWidth: '640px',
        margin: '0 auto 2.5rem',
        padding: '0 1rem',
        fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)',
        color: '#9CA3AF',
        fontStyle: 'italic',
        lineHeight: 1.6,
        textShadow: '0 2px 8px rgba(0,0,0,0.8)'
      }}>
        "Powering a smarter, more connected solar ecosystem — connecting installation owners, administrators, and field maintainers in real time."
      </div>

      {/* Connected Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.85rem',
        flexWrap: 'wrap',
        marginBottom: '4rem'
      }}>
        <button
          onClick={onEnterApp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.9rem 1.85rem',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4), 0 0 15px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Compass size={18} />
          Explore SolarSync
          <ArrowRight size={17} />
        </button>

        {onOpenMap && (
          <button
            onClick={onOpenMap}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.9rem 1.85rem',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              background: 'rgba(56, 189, 248, 0.12)',
              backdropFilter: 'blur(10px)',
              color: '#38BDF8',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.22)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Compass size={16} />
            Discover the Platform
          </button>
        )}

        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.9rem 1.6rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              color: '#F9FAFB',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
            }}
          >
            <Sparkles size={16} color="#34D399" />
            Sign In / Register
          </button>
        )}
      </div>

      {/* Animated Scroll Scrub Indicator */}
      <div 
        onClick={onExplore}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.45rem',
          cursor: 'pointer',
          color: '#9CA3AF',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#34D399'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
      >
        <span style={{ fontSize: '0.725rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
          Scroll to Scrub Video
        </span>
        <div style={{
          width: '24px',
          height: '38px',
          borderRadius: '14px',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          display: 'flex',
          justifyContent: 'center',
          padding: '6px 0'
        }}>
          <div style={{
            width: '4px',
            height: '8px',
            borderRadius: '2px',
            background: '#10B981',
            animation: 'scrollBob 1.8s ease-in-out infinite'
          }} />
        </div>
        <ChevronDown size={16} style={{ marginTop: '-4px' }} />
      </div>
    </section>
  );
}

