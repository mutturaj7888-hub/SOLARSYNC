import React, { useState } from 'react';
import { AlertCircle, UserCheck, Wrench, ShieldCheck, ArrowRight, Check, Clock, Camera } from 'lucide-react';

export default function MaintenanceSection({ onOpenMaintenance }) {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'Fault Reported',
      role: 'Installation Owner / Inverter Alert',
      desc: 'Owner captures photographic proof of panel cracking or thermal inverter shutdown. Ticket created with timestamp and GPS tags.',
      icon: AlertCircle,
      color: '#F43F5E',
      badge: 'Step 01 • Incident Triage',
      detail: 'Severity rating: CRITICAL (Inverter shutdown code E-04)'
    },
    {
      step: 2,
      title: 'Nearest Maintainer Dispatched',
      role: 'Admin / PostGIS Auto-Router',
      desc: 'System computes Haversine proximity across certified maintainers. Arun Kumar (3.2 km away) receives push notification & accepts order.',
      icon: UserCheck,
      color: '#38BDF8',
      badge: 'Step 02 • Proximity Dispatch',
      detail: 'Maintainer distance: 3.2 km | ETA: 24 mins'
    },
    {
      step: 3,
      title: 'Repair in Progress',
      role: 'Certified Field Maintainer',
      desc: 'Maintainer arrives on rooftop, initiates safety lockout, replaces DC surge protection device, and logs live labor timer.',
      icon: Wrench,
      color: '#F59E0B',
      badge: 'Step 03 • Work Execution',
      detail: 'Parts replaced: DC SPD Type II, MC4 Connector'
    },
    {
      step: 4,
      title: 'Evidence Verified',
      role: 'Admin & System Owner Sign-off',
      desc: 'Before & After photos compared side-by-side. Generation output tested at 98.4%. Work order officially closed & archived.',
      icon: ShieldCheck,
      color: '#10B981',
      badge: 'Step 04 • Cryptographic Proof',
      detail: 'Verified resolution: Generation restored (18.2 kWp)'
    }
  ];

  const current = steps[activeStep - 1];

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
          <Wrench size={14} />
          End-to-End Coordination Flow
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
          Smart Maintenance Lifecycle
        </h2>

        <p style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)', color: '#94A3B8', lineHeight: 1.6 }}>
          From initial incident detection to dual-verified resolution: see how SolarSync connects owners, administrators, and field maintainers in under 4 minutes.
        </p>
      </div>

      {/* Stepper Timeline Nav */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = s.step === activeStep;
          return (
            <div
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              style={{
                background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isActive ? '#10B981' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '16px',
                padding: '1.25rem 1rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: isActive ? '0 10px 25px -5px rgba(16, 185, 129, 0.25)' : 'none'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isActive ? '#10B981' : 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#FFF' : '#9CA3AF',
                flexShrink: 0
              }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: isActive ? '#34D399' : '#6B7280', fontWeight: 600 }}>
                  STEP 0{s.step}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? '#FFF' : '#CBD5E1' }}>
                  {s.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Step Deep-Dive Showcase Card */}
      <div style={{
        background: 'rgba(11, 20, 38, 0.85)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${current.color}40`,
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: `0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px ${current.color}15`,
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        gap: '2.5rem',
        alignItems: 'center'
      }}>
        <div>
          <span style={{
            fontSize: '0.725rem',
            fontFamily: 'var(--font-mono)',
            color: current.color,
            background: `${current.color}15`,
            border: `1px solid ${current.color}35`,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontWeight: 600,
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            {current.badge}
          </span>

          <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFF', margin: '0 0 0.5rem' }}>
            {current.title}
          </h3>

          <div style={{ fontSize: '0.9rem', color: '#38BDF8', fontWeight: 600, marginBottom: '1.25rem' }}>
            Primary Actor: {current.role}
          </div>

          <p style={{ fontSize: '1rem', color: '#94A3B8', lineHeight: 1.7, marginBottom: '2rem' }}>
            {current.desc}
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveStep(activeStep < 4 ? activeStep + 1 : 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFF',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              {activeStep < 4 ? 'Next Stage' : 'Restart Workflow'}
              <ArrowRight size={15} />
            </button>

            <button
              onClick={onOpenMaintenance}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#FFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Open Live Dispatch Center
            </button>
          </div>
        </div>

        {/* Visual Telemetry Terminal Preview */}
        <div style={{
          background: '#070C18',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: '#E2E8F0',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '0.7rem', color: '#6B7280', marginLeft: 'auto' }}>
              solarsync-pipeline-v1
            </span>
          </div>

          <div style={{ color: '#10B981', marginBottom: '0.75rem' }}>
            ✓ Status: [EVENT_PROPAGATED]
          </div>
          <div style={{ color: '#94A3B8', marginBottom: '0.5rem' }}>
            // Telemetry Metadata
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', color: current.color }}>
            {current.detail}
          </div>
          <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
            Celery task ID: 7f89b21a-45c1<br/>
            PostGIS radial distance: 3,240m<br/>
            Hash verification: sha256:d8a70f4...
          </div>
        </div>
      </div>
    </section>
  );
}

