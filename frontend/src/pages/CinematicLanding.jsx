import React, { useState, useEffect, useRef } from 'react';
import ScrollVideo from '../components/cinematic/ScrollVideo';
import HeroSection from '../components/cinematic/HeroSection';
import ProblemSection from '../components/cinematic/ProblemSection';
import SolutionSection from '../components/cinematic/SolutionSection';
import SolarMapSection from '../components/cinematic/SolarMapSection';
import MaintenanceSection from '../components/cinematic/MaintenanceSection';
import FeatureSection from '../components/cinematic/FeatureSection';
import FooterSection from '../components/cinematic/FooterSection';
import { 
  Sun, 
  Compass, 
  LogIn, 
  Layers, 
  User, 
  ShieldCheck, 
  Wrench, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CinematicLanding({ 
  onEnterApp, 
  onNavigate, 
  onOpenAuth 
}) {
  const { currentUser, userRole, logout } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  // Smooth scroll progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const totalScroll = el.scrollHeight - el.clientHeight;
      if (totalScroll > 0) {
        const current = window.scrollY || window.pageYOffset;
        const progress = Math.max(0, Math.min(1, current / totalScroll));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial measure

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', overflowX: 'hidden', background: '#0A0F1D' }}>
      {/* 1. Scroll-Driven Background Video */}
      <ScrollVideo scrollProgress={scrollProgress} videoSrc="/solarsync-hero.mp4" />

      {/* 2. Floating Top Glass Navigation HUD */}
      <nav style={{
        position: 'fixed',
        top: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2.5rem)',
        maxWidth: '1280px',
        zIndex: 100,
        background: 'rgba(11, 20, 38, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '9999px',
        padding: '0.6rem 1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.1)'
      }}>
        {/* Brand */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)'
          }}>
            <Sun size={18} />
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: '1.15rem',
            letterSpacing: '-0.025em',
            background: 'linear-gradient(120deg, #FFFFFF, #E2E8F0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SolarSync
          </span>

          {/* Timeline Scrub Progress Badge */}
          <span style={{
            marginLeft: '0.5rem',
            fontSize: '0.675rem',
            fontFamily: 'var(--font-mono)',
            color: '#34D399',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}>
            VIDEO SCRUB {Math.round(scrollProgress * 100)}%
          </span>
        </div>

        {/* Quick Nav Jump Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          fontSize: '0.825rem',
          fontWeight: 600,
          color: '#CBD5E1'
        }}>
          <span 
            onClick={() => scrollToSection('sec-problem')}
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#34D399'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
          >
            Problem
          </span>
          <span 
            onClick={() => scrollToSection('sec-solution')}
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#34D399'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
          >
            Solution
          </span>
          <span 
            onClick={() => scrollToSection('sec-map')}
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#34D399'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
          >
            Live Map
          </span>
          <span 
            onClick={() => scrollToSection('sec-maintenance')}
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#34D399'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
          >
            Workflow
          </span>
          <span 
            onClick={() => scrollToSection('sec-features')}
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#34D399'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
          >
            Modules
          </span>
        </div>

        {/* User Status / Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {currentUser ? (
            <>
              <div 
                onClick={onOpenAuth}
                title="Click to switch account"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '0.775rem',
                  cursor: 'pointer'
                }}
              >
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 6px #10B981'
                }} />
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
                  {currentUser.full_name?.split(' ')[0] || 'User'}
                </span>
                <span style={{ color: '#38BDF8', fontSize: '0.7rem', textTransform: 'capitalize' }}>
                  ({userRole?.replace('_', ' ') || 'member'})
                </span>
              </div>

              <button
                onClick={() => {
                  logout();
                  if (onOpenAuth) onOpenAuth();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  background: 'rgba(244, 63, 94, 0.1)',
                  color: '#FDA4AF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Sign out of current account"
              >
                <LogIn size={13} style={{ transform: 'rotate(180deg)' }} />
                Sign Out
              </button>

              <button
                onClick={() => onEnterApp('dashboard')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1.15rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Compass size={14} />
                Console
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1.15rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#34D399',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                <LogIn size={14} />
                Sign In / Login
              </button>

              <button
                onClick={() => onEnterApp('dashboard')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1.15rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Compass size={14} />
                Enter Platform
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 3. Seven Storytelling Sections */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Section 1: Hero */}
        <div id="sec-hero">
          <HeroSection 
            onExplore={() => scrollToSection('sec-problem')}
            onEnterApp={() => onEnterApp('dashboard')}
            onOpenMap={() => onNavigate('map')}
            onOpenAuth={onOpenAuth}
          />
        </div>

        {/* Section 2: The Problem */}
        <div id="sec-problem">
          <ProblemSection />
        </div>

        {/* Section 3: The Solution */}
        <div id="sec-solution">
          <SolutionSection 
            onNavigateToMap={() => onNavigate('map')}
          />
        </div>

        {/* Section 4: Interactive Solar Map */}
        <div id="sec-map">
          <SolarMapSection 
            onOpenFullMap={() => onNavigate('map')}
          />
        </div>

        {/* Section 5: Smart Maintenance Pipeline */}
        <div id="sec-maintenance">
          <MaintenanceSection 
            onOpenMaintenance={() => onNavigate('maintenance')}
          />
        </div>

        {/* Section 6: Platform Features */}
        <div id="sec-features">
          <FeatureSection 
            onSelectFeature={(featId) => onNavigate(featId)}
          />
        </div>

        {/* Section 7: Call to Action & Footer */}
        <div id="sec-footer">
          <FooterSection 
            onEnterApp={() => onEnterApp('dashboard')}
            onOpenAuth={onOpenAuth}
            onOpenMap={() => onNavigate('map')}
          />
        </div>
      </div>
    </div>
  );
}

