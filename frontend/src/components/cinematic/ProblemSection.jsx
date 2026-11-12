import React from 'react';
import { AlertTriangle, Clock, TrendingDown, EyeOff, ShieldAlert } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      stat: '38%',
      title: 'Undetected String Faults',
      desc: 'Micro-inverter trip events and diode failures often remain unnoticed on rooftops for weeks without real-time telemetry.',
      icon: EyeOff,
      color: '#F59E0B'
    },
    {
      stat: '14+ Days',
      title: 'Manual Dispatch Lag',
      desc: 'Traditional email and spreadsheet dispatch causes severe delays in finding and assigning the nearest qualified maintainer.',
      icon: Clock,
      color: '#F43F5E'
    },
    {
      stat: '22.4%',
      title: 'Energy Yield Loss',
      desc: 'Cumulative generation downtime directly degrades solar asset ROI and voids manufacturer warranty compliance.',
      icon: TrendingDown,
      color: '#EF4444'
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
        background: 'rgba(244, 63, 94, 0.12)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        color: '#FB7185',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '1.25rem',
        alignSelf: 'flex-start'
      }}>
        <ShieldAlert size={14} />
        The Operational Bottleneck
      </div>

      {/* Main Headline */}
      <h2 style={{
        fontSize: 'clamp(2rem, 4.5vw, 3.75rem)',
        fontWeight: 800,
        letterSpacing: '-0.025em',
        lineHeight: 1.15,
        maxWidth: '920px',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #FFFFFF 30%, #CBD5E1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Solar infrastructure is growing exponentially. <br />
        <span style={{ color: '#F43F5E', WebkitTextFillColor: '#FB7185' }}>Is maintenance keeping up?</span>
      </h2>

      {/* Subtext */}
      <p style={{
        fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
        color: '#94A3B8',
        maxWidth: '780px',
        lineHeight: 1.6,
        marginBottom: '3.5rem'
      }}>
        Distributed solar installations are spread across cities, rooftops, and remote acres. Without centralized geospatial dispatch and proof-of-work verification, systems stay offline for days while repair teams lack clear dispatch routing.
      </p>

      {/* Problem Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.75rem'
      }}>
        {problems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '2rem 1.75rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.6)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = `${item.color}60`;
                e.currentTarget.style.boxShadow = `0 20px 40px -10px ${item.color}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.6)';
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `${item.color}15`,
                border: `1px solid ${item.color}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Icon size={22} color={item.color} />
              </div>

              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#FFF',
                letterSpacing: '-0.03em',
                marginBottom: '0.4rem',
                fontFamily: 'var(--font-mono)'
              }}>
                {item.stat}
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.65rem' }}>
                {item.title}
              </div>

              <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

