import React from 'react';
import { Network, Cpu, Wrench, ShieldCheck, MapPin, Zap, ArrowRight } from 'lucide-react';

export default function SolutionSection({ onNavigateToMap }) {
  const pillars = [
    {
      title: 'Geospatial Asset Registry',
      desc: 'Rooftops, inverters, and strings registered with PostGIS spatial coordinates and real-time operational status.',
      icon: MapPin,
      tag: 'PostGIS Spatial Engine'
    },
    {
      title: 'Nearest Maintainer Dispatch',
      desc: 'Automatic Haversine radius calculations find the closest certified technician with availability and matching skills.',
      icon: Wrench,
      tag: 'Automated Dispatch'
    },
    {
      title: 'One-Tap Fault Reporting',
      desc: 'Installation owners capture photos and descriptions. Incident tickets are triaged with instant priority weighting.',
      icon: Zap,
      tag: 'Smart Incident Triage'
    },
    {
      title: 'Cryptographic Proof of Repair',
      desc: 'Field maintainers upload verified before-and-after photographs. Owners and admins inspect evidence before sign-off.',
      icon: ShieldCheck,
      tag: 'Dual-Signoff Loop'
    }
  ];

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '6rem 2rem',
      position: 'relative',
      zIndex: 10,
      maxWidth: '1280px',
      margin: '0 auto',
      color: '#F9FAFB'
    }}>
      {/* Section Tag */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.85rem',
        borderRadius: '9999px',
        background: 'rgba(16, 185, 129, 0.12)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        color: '#34D399',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '1.25rem',
        alignSelf: 'flex-start'
      }}>
        <Network size={14} />
        The SolarSync Solution
      </div>

      {/* Main Headline */}
      <h2 style={{
        fontSize: 'clamp(2rem, 4.5vw, 3.75rem)',
        fontWeight: 800,
        letterSpacing: '-0.025em',
        lineHeight: 1.15,
        maxWidth: '920px',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #FFFFFF 20%, #A7F3D0 80%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        A unified intelligence grid for every solar asset, owner, and maintainer.
      </h2>

      {/* Subtext */}
      <p style={{
        fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
        color: '#94A3B8',
        maxWidth: '800px',
        lineHeight: 1.6,
        marginBottom: '3.5rem'
      }}>
        SolarSync replaces fragmented communication with automated dispatching, photographic verification, and real-time geospatial discovery — turning solar maintenance into an organized, trackable workflow.
      </p>

      {/* 4 Core Pillars Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'rgba(11, 20, 38, 0.75)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(16, 185, 129, 0.18)',
                borderRadius: '20px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.45)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.18)';
                e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.5)';
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} color="#10B981" />
                  </div>
                  <span style={{
                    fontSize: '0.675rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#34D399',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    {item.tag}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F9FAFB', marginBottom: '0.65rem' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

