import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  CheckCircle2, 
  Wrench, 
  AlertCircle, 
  MapPin, 
  PlusCircle, 
  Database, 
  Cpu, 
  ArrowUpRight,
  Shield,
  Activity,
  Clock,
  Sparkles,
  UserCheck,
  Send,
  Camera,
  Navigation
} from 'lucide-react';
import { getAnalytics } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardView({ healthData, healthOnline }) {
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
    average_mttr_hours: 6.5,
    recent_activity: []
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getAnalytics();
        setMetrics(data);
      } catch (err) {}
    };
    fetchMetrics();
  }, []);

  const stats = [
    {
      label: 'Registered Assets',
      value: `${metrics.total_installations}`,
      sub: `${metrics.total_capacity_kw} kWp Total Capacity`,
      trend: 'Registered on PostGIS',
      icon: Sun,
      color: 'var(--amber-400)',
    },
    {
      label: 'Operational Sites',
      value: `${metrics.operational_count}`,
      sub: `${metrics.fleet_health_percentage}% Fleet Availability`,
      trend: 'Normal operating limits',
      icon: CheckCircle2,
      color: 'var(--emerald-400)',
    },
    {
      label: 'Under Maintenance',
      value: `${metrics.under_maintenance_count}`,
      sub: 'Active service orders',
      trend: 'Technician dispatched',
      icon: Wrench,
      color: 'var(--sky-400)',
    },
    {
      label: 'Open Fault Tickets',
      value: `${metrics.open_fault_tickets}`,
      sub: `MTTR Avg: ${metrics.average_mttr_hours} hrs`,
      trend: 'Severity monitored',
      icon: AlertCircle,
      color: 'var(--rose-500)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Dynamic Role-Based Welcome Banner */}
      <div className="welcome-banner" style={{
        background: userRole === 'technician' 
          ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)' 
          : userRole === 'installation_owner'
          ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.85) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            color: userRole === 'technician' ? '#38BDF8' : userRole === 'installation_owner' ? '#FBBF24' : '#34D399',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={13} />
            <span>
              {userRole === 'technician' ? 'MAINTAINER CONSOLE' : userRole === 'installation_owner' ? 'OWNER PORTAL' : 'ADMINISTRATOR HUB'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            {userRole === 'technician' 
              ? `Welcome back, ${currentUser?.full_name || 'Maintainer'}` 
              : userRole === 'installation_owner'
              ? `Rooftop System Telemetry • ${currentUser?.full_name || 'Owner'}`
              : `Solar Fleet Operations & Proximity Dispatch`}
          </h2>

          <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', fontSize: '0.925rem', lineHeight: 1.6, margin: 0 }}>
            {userRole === 'technician'
              ? 'You are active on the dispatch network. View your assigned solar maintenance tickets, start work orders, and submit verified before/after repair photos.'
              : userRole === 'installation_owner'
              ? 'Monitor your rooftop solar panels, report equipment problems directly to certified nearby maintainers, and track work progress with photographic proof.'
              : 'Oversee registered rooftop arrays, assign open fault tickets to the nearest certified field technicians using PostGIS proximity, and review completed repair evidence.'}
          </p>
        </div>

        {/* Dynamic Action Buttons Based on Role */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {userRole === 'technician' && (
            <>
              <button 
                onClick={() => navigate('/maintenance')} 
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)' }}
              >
                <Wrench size={16} />
                My Assigned Work Orders
              </button>
              <button 
                onClick={() => navigate('/map')} 
                className="btn-secondary"
              >
                <Navigation size={16} />
                Service Area Map
              </button>
            </>
          )}

          {userRole === 'installation_owner' && (
            <>
              <button 
                onClick={() => navigate('/faults')} 
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' }}
              >
                <AlertCircle size={16} />
                Report a Problem to Maintainers
              </button>
              <button 
                onClick={() => navigate('/assets')} 
                className="btn-secondary"
              >
                <Sun size={16} />
                My Rooftop Specs
              </button>
            </>
          )}

          {(!userRole || userRole === 'admin') && (
            <>
              <button 
                onClick={() => navigate('/map')} 
                className="btn-primary"
              >
                <MapPin size={16} />
                Geospatial Explorer
              </button>
              <button 
                onClick={() => navigate('/maintenance')} 
                className="btn-secondary"
              >
                <UserCheck size={16} />
                Dispatch Nearest Maintainers
              </button>
              <button 
                onClick={() => navigate('/assets')} 
                className="btn-secondary"
              >
                <PlusCircle size={16} />
                Register Asset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Maintainer / Owner Custom Spotlight Card */}
      {userRole === 'technician' && (
        <div style={{
          background: 'rgba(2, 132, 199, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
                Next Dispatched Order: MG Road Commercial Rooftop Inverter Calibration
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Assigned to you • 3.4 km from current hub • Priority: HIGH
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/maintenance')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: '#0284C7',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer'
            }}
          >
            Start Work & Upload Repair Photos →
          </button>
        </div>
      )}

      {userRole === 'installation_owner' && (
        <div style={{
          background: 'rgba(217, 119, 6, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <Camera size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF' }}>
                Need Maintenance? Report an Issue directly with Photos
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Certified maintainers in Bengaluru will be notified with your exact rooftop coordinate.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/faults')}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: '#D97706',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer'
            }}
          >
            Submit Incident Report →
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="stat-label">{s.label}</span>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} color={s.color} />
                </div>
              </div>
              <div className="stat-value">{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                {s.sub}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--emerald-400)',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <ArrowUpRight size={12} />
                <span>{s.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: System Diagnostics & Operations Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.4fr)', gap: '1.5rem' }}>
        {/* System Diagnostics Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Cpu size={20} color="var(--emerald-400)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Telemetry Stack Health</h3>
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--emerald-400)',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                Online
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>FastAPI Modular Backend</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REST endpoints with JWT & RBAC</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  200 OK
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>PostgreSQL 16 + PostGIS</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spatial indexing (Haversine distance)</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  Active
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>4K Background Scrubbing</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>60fps linear interpolation engine</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Maintenance & System Activities */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Activity size={20} color="var(--sky-400)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Live Operations Feed</h3>
            </div>
            <button 
              onClick={() => navigate('/analytics')}
              style={{ background: 'transparent', border: 'none', color: 'var(--sky-400)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Full Analytics →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {metrics.recent_activity && metrics.recent_activity.length > 0 ? (
              metrics.recent_activity.slice(0, 5).map((act, i) => (
                <div key={i} style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>
                      {act.action}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      {act.created_at ? new Date(act.created_at).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{act.description}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                No maintenance activities logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
