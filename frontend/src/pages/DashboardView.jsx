import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  MapPin,
  Sparkles,
  UserCheck,
  ArrowRight,
  Shield,
  Layers,
  Activity
} from 'lucide-react';
import { getAnalytics, getFaults } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardView() {
  const { userRole, currentUser } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    total_installations: 7,
    total_capacity_kw: 184.5,
    operational_count: 5,
    under_maintenance_count: 2,
    fleet_health_percentage: 85.7,
    open_fault_tickets: 2,
    verified_repairs_count: 1,
    average_mttr_hours: 6.5
  });

  const [recentFaults, setRecentFaults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsData, faultsData] = await Promise.all([
          getAnalytics(),
          getFaults()
        ]);
        setMetrics(analyticsData);
        setRecentFaults(faultsData.slice(0, 4));
      } catch (err) {
        console.warn("Failed loading dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isDistributor = !userRole || userRole === 'distributor' || userRole === 'admin';
  const isMaintainer = userRole === 'technician' || userRole === 'maintainer';
  const isResident = userRole === 'installation_owner';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1360px', margin: '0 auto' }}>

      {/* ECHOID Editorial Header */}
      <div>
        {/* Chip */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          fontSize: 'clamp(11px, 0.72vw, 13px)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          background: 'var(--fill-solid)',
          border: '1px solid var(--line)',
          padding: '8px 14px',
          display: 'inline-block',
          marginBottom: '1rem',
          color: '#FFFFFF'
        }}>
          [ {isDistributor ? 'DISTRIBUTOR OPERATIONS' : isMaintainer ? 'FIELD MAINTAINER' : 'RESIDENT ROOFTOP'} ]
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 200,
          fontSize: 'clamp(44px, 5.2vw, 84px)',
          letterSpacing: '0.02em',
          lineHeight: 0.98,
          margin: '0 0 1rem 0',
          color: '#FFFFFF',
          textTransform: 'uppercase'
        }}>
          {isDistributor ? 'Task Dispatch' : isMaintainer ? 'Active Queue' : 'Rooftop System'}
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 300,
          fontSize: 'clamp(11px, 0.88vw, 15px)',
          letterSpacing: '0.14em',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          margin: 0,
          maxWidth: '780px',
          lineHeight: 1.5
        }}>
          {isDistributor
            ? 'Assign incoming problem requests from nearby residents to certified local maintainers.'
            : isMaintainer
              ? 'Active service orders dispatched to you. Execute repairs, update progress, and upload dual photo proof.'
              : 'Live telemetry for your registered photovoltaic installations. Request maintainer dispatch for equipment faults.'}
        </p>
      </div>

      {/* ECHOID 4-Cell Data Ribbon (Sharp Terminal Numbers) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        border: '1px solid var(--line)',
        background: 'rgba(0, 0, 0, 0.8)'
      }}>
        <div style={{ padding: '1.5rem', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>
            01 // Total Fleet Sites
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 200, color: '#FFFFFF', lineHeight: 1 }}>
            {metrics.total_installations}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {metrics.total_capacity_kw} kWp PostGIS Network
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>
            02 // Fleet Availability
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 200, color: '#FFFFFF', lineHeight: 1 }}>
            {metrics.fleet_health_percentage}%
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {metrics.operational_count} of {metrics.total_installations} Operational
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>
            03 // Active Requests
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 200, color: '#FFFFFF', lineHeight: 1 }}>
            {metrics.open_fault_tickets}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Awaiting Maintainer Allocation
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px' }}>
            04 // Mean Time To Repair
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 200, color: '#FFFFFF', lineHeight: 1 }}>
            {metrics.average_mttr_hours}h
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Dual-Verified Resolution Rate
          </div>
        </div>
      </div>

      {/* ECHOID Action Cluster */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        padding: '1.25rem',
        border: '1px solid var(--line-strong)',
        background: 'var(--fill-ghost)'
      }}>
        {isDistributor && (
          <>
            <button
              onClick={() => navigate('/maintenance')}
              className="btn-primary"
            >
              Assign Tasks to Maintainers
            </button>
            <button
              onClick={() => navigate('/faults')}
              className="btn-secondary"
            >
              Nearby Requests ({recentFaults.length})
            </button>
            <button
              onClick={() => navigate('/map')}
              className="btn-secondary"
            >
              Geospatial Map
            </button>
            <button
              onClick={() => navigate('/assets')}
              className="btn-secondary"
            >
              Asset Registry
            </button>
          </>
        )}

        {isMaintainer && (
          <>
            <button
              onClick={() => navigate('/maintenance')}
              className="btn-primary"
            >
              My Assigned Work Orders
            </button>
            <button
              onClick={() => navigate('/map')}
              className="btn-secondary"
            >
              Service Area Map
            </button>
          </>
        )}

        {isResident && (
          <>
            <button
              onClick={() => navigate('/faults')}
              className="btn-primary"
            >
              Report Problem to Maintainers
            </button>
            <button
              onClick={() => navigate('/assets')}
              className="btn-secondary"
            >
              My Solar Panels
            </button>
            <button
              onClick={() => navigate('/map')}
              className="btn-secondary"
            >
              Local Solar Map
            </button>
          </>
        )}
      </div>

      {/* Terminal Stream: Nearby Incident Requests & Maintenance Orders */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#FFFFFF'
          }}>
            [ LIVE INCIDENT & TASK STREAM ]
          </div>
          <button
            onClick={() => navigate(isDistributor ? '/maintenance' : '/faults')}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.725rem' }}
          >
            View All ({recentFaults.length}) →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recentFaults.map((f) => (
            <div
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                border: '1px solid var(--line)',
                background: 'rgba(5, 5, 8, 0.9)',
                flexWrap: 'wrap',
                gap: '1rem',
                transition: 'border-color 0.25s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: f.severity === 'critical' ? '#F43F5E' : f.severity === 'high' ? '#F59E0B' : '#60A5FA',
                  background: 'var(--fill-ghost)',
                  border: '1px solid var(--line)',
                  padding: '4px 8px'
                }}>
                  {f.ticket_number}
                </span>

                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 300, color: '#FFFFFF', marginBottom: '4px' }}>
                    {f.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                    Site: {f.installation_name || 'Registered Installation'} • Severity: {f.severity.toUpperCase()} • Status: {f.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                {isDistributor && f.status === 'reported' && (
                  <button
                    onClick={() => navigate('/maintenance')}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                  >
                    Assign Maintainer
                  </button>
                )}

                {isMaintainer && (
                  <button
                    onClick={() => navigate('/maintenance')}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                  >
                    Work Order
                  </button>
                )}

                <button
                  onClick={() => navigate('/map')}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.75rem' }}
                >
                  Locate on Map
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
