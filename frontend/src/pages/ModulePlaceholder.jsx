import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';

export default function ModulePlaceholder({ title, description, phase, features = [] }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      padding: '2.5rem',
      minHeight: '480px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <div style={{
        padding: '0.35rem 0.85rem',
        borderRadius: '9999px',
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        color: 'var(--sky-400)',
        fontSize: '0.75rem',
        fontWeight: 600,
        marginBottom: '1.25rem',
        fontFamily: 'var(--font-mono)'
      }}>
        SCHEDULED FOR {phase}
      </div>
      <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.75rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2rem', fontSize: '0.95rem' }}>
        {description}
      </p>

      {features.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          maxWidth: '750px',
          width: '100%',
          textAlign: 'left'
        }}>
          {features.map((feat, idx) => (
            <div key={idx} style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <span style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>✓</span>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
