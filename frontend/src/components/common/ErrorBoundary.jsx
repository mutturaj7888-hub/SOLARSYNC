import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SolarSync UI Component Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2.5rem',
          margin: '2rem auto',
          maxWidth: '720px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          color: '#F9FAFB',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            padding: '1rem',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            marginBottom: '1rem'
          }}>
            <AlertTriangle size={36} color="#EF4444" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {this.props.fallbackTitle || 'Component Rendering Error'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected rendering error occurred in this view.'}
          </p>
          <div style={{
            background: '#070C18',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#F87171',
            maxHeight: '160px',
            overflowY: 'auto',
            marginBottom: '1.5rem'
          }}>
            {this.state.error?.stack || String(this.state.error)}
          </div>
          <button
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: '#10B981',
              color: '#FFFFFF',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
            Reload View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

