import React from 'react';
import { 
  Sun, 
  AlertTriangle, 
  UserCheck, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';

export default function FeatureSection({ onSelectFeature }) {
  const features = [
    {
      id: 'assets',
      title: 'Solar Asset Management',
      desc: 'Centralized registry of rooftop installations, capacity ratings, inverter models, panel specs, and PostGIS geo-coordinates.',
      icon: Sun,
      color: '#FBBF24',
      badge: 'Inventory'
    },
    {
      id: 'faults',
      title: 'Fault Detection & Reporting',
      desc: 'Incident ticketing with high-res photo capture, automatic severity classification (Critical, Major, Minor), and audit trails.',
      icon: AlertTriangle,
      color: '#F43F5E',
      badge: 'Incident Log'
    },
    {
      id: 'maintenance',
      title: 'Smart Maintainer Dispatch',
      desc: 'Geographic proximity routing matches open work orders to the nearest certified maintainers with workload balancing.',
      icon: UserCheck,
      color: '#38BDF8',
      badge: 'Dispatching'
    },
    {
      id: 'maintenance',
      title: 'Preventive Maintenance',
      desc: 'Automated periodic inspection schedules with Celery background alerts preventing unexpected generation degradation.',
      icon: Calendar,
      color: '#A78BFA',
      badge: 'Automation'
    },
    {
      id: 'maintenance',
      title: 'Proof-of-Repair Verification',
      desc: 'Field maintainers upload side-by-side Before & After photographic evidence with dual sign-off before closing tickets.',
      icon: ShieldCheck,
      color: '#10B981',
      badge: 'Verification'
    },
    {
      id: 'analytics',
      title: 'Reliability & MTTR Analytics',
      desc: 'Deep analytics on Mean Time To Repair, frequent inverter failure modes, and fleet availability percentages.',
      icon: Activity,
      color: '#34D399',
      badge: 'Intelligence'
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
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 3.5rem' }}>
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
          marginBottom: '1rem'
        }}>
          <Layers size={14} />
          Complete Capability Suite
        </div>

        <h2 style={{
          fontSize: 'clamp(2rem, 4.2vw, 3.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          lineHeight: 1.15,
          margin: '0 0 1rem',
          background: 'linear-gradient(135deg, #FFFFFF 20%, #A7F3D0 80%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Engineered for Clean Energy Scale
        </h2>

        <p style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)', color: '#94A3B8', lineHeight: 1.6 }}>
          Six purpose-built modules working in harmony across owners, operators, and maintainers to maximize solar availability.
        </p>
      </div>

      {/* 6 Feature Motion Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              onClick={() => onSelectFeature(feat.id)}
              style={{
                background: 'rgba(11, 20, 38, 0.75)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '2rem 1.75rem',
                cursor: 'pointer',
                transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = `${feat.color}60`;
                e.currentTarget.style.boxShadow = `0 20px 40px -10px ${feat.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `${feat.color}15`,
                    border: `1px solid ${feat.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={22} color={feat.color} />
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: feat.color,
                    background: `${feat.color}12`,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontWeight: 600
                  }}>
                    {feat.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F9FAFB', marginBottom: '0.5rem' }}>
                  {feat.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                  {feat.desc}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: feat.color
              }}>
                <span>Launch in Platform</span>
                <ArrowUpRight size={15} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

