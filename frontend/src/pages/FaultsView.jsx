import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Camera, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck,
  X, 
  Wrench, 
  FileText, 
  MapPin, 
  Layers, 
  Sparkles, 
  Calendar 
} from 'lucide-react';
import { getFaults, createFault, uploadFaultPhoto, getInstallations, repairAllFaults, updateFaultStatus, confirmRepairByResident } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FaultsView({ onOpenAssignModal, onOpenVerifyModal, initialInstallationId = null }) {
  const navigate = useNavigate();
  const { userRole, currentUser } = useAuth();
  const [faults, setFaults] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Form State
  const [formInstId, setFormInstId] = useState(initialInstallationId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('inverter_failure');
  const [severity, setSeverity] = useState('high');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [repairingAll, setRepairingAll] = useState(false);

  const handleRepairAll = async () => {
    setRepairingAll(true);
    try {
      const res = await repairAllFaults();
      await loadData();
      alert(res.message || "All faults repaired and verified successfully!");
    } catch (err) {
      alert("Repair all failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setRepairingAll(false);
    }
  };

  const handleQuickRepairSingle = async (faultId) => {
    try {
      await updateFaultStatus(faultId, 'verified_closed');
      await loadData();
    } catch (err) {
      alert("Error repairing fault: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleConfirmByResident = async (faultId) => {
    try {
      await confirmRepairByResident(faultId);
      await loadData();
      alert("Confirmation sent to Distributor! The distributor can now verify and close the ticket.");
    } catch (err) {
      alert("Error confirming repair: " + (err.response?.data?.detail || err.message));
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [faultsData, instsData] = await Promise.all([
        getFaults(),
        getInstallations()
      ]);
      setFaults(faultsData);
      
      // Residents can only report faults for their own registered solar installations
      const filteredInsts = (userRole === 'installation_owner')
        ? instsData.filter(i => i.owner_id === currentUser?.id)
        : instsData;
      setInstallations(filteredInsts);

      if (filteredInsts.length > 0) {
        if (!formInstId || !filteredInsts.some(i => i.id === parseInt(formInstId))) {
          setFormInstId(filteredInsts[0].id);
        }
      } else {
        setFormInstId('');
      }
    } catch (err) {
      console.warn("Error loading faults:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFaultPhoto(file);
      setPhotoUrl(res.url);
    } catch (err) {
      alert("Photo upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!formInstId) {
      alert("Please select a solar installation");
      return;
    }
    try {
      await createFault({
        installation_id: parseInt(formInstId),
        title,
        description,
        category,
        severity,
        photo_url: photoUrl || "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80"
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setPhotoUrl('');
      loadData();
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  // Filtered
  const filtered = faults.filter((f) => {
    const matchesSearch = f.ticket_number.toLowerCase().includes(search.toLowerCase()) || 
                          f.title.toLowerCase().includes(search.toLowerCase()) ||
                          (f.installation_name && f.installation_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchesSev = severityFilter === 'all' || f.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSev;
  });

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Fault & Incident Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Submit equipment fault tickets with photographic proof, track response SLAs, and allocate field repairs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/map')} 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
          >
            <MapPin size={14} color="#10B981" />
            Solar Map
          </button>
          <button 
            onClick={() => navigate('/maintenance')} 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
          >
            <Wrench size={14} color="#38BDF8" />
            {userRole === 'installation_owner' ? 'Track Repairs' : 'Task Dispatch'}
          </button>
          {(userRole === 'distributor' || userRole === 'admin') && (
            <button 
              onClick={handleRepairAll}
              disabled={repairingAll}
              className="btn-primary" 
              style={{ 
                padding: '0.45rem 0.95rem', 
                fontSize: '0.775rem',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                fontWeight: 600,
                cursor: repairingAll ? 'not-allowed' : 'pointer'
              }}
            >
              <CheckCircle2 size={15} color="#000000" />
              {repairingAll ? 'REPAIRING ALL...' : 'REPAIR ALL FAULTS'}
            </button>
          )}
          <button onClick={() => setShowModal(true)} className="btn-secondary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.775rem' }}>
            <Plus size={16} />
            Report Problem Request
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        background: 'var(--bg-card)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by ticket #, issue, or site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: '#111827',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Ticket Statuses</option>
          <option value="reported">Reported (New)</option>
          <option value="assigned">Assigned to Tech</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved_pending_verification">Awaiting Verification</option>
          <option value="verified_closed">Verified & Closed</option>
          <option value="rejected_reopened">Rejected & Reopened</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: '#111827',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical (P1)</option>
          <option value="high">High (P2)</option>
          <option value="medium">Medium (P3)</option>
          <option value="low">Low (P4)</option>
        </select>
      </div>

      {/* Faults Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading incident reports...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          No incidents matching selected filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((f) => {
            const isResolved = f.status === 'verified_closed';
            const isPendingVerification = f.status === 'resolved_pending_verification';
            
            const sevColor = f.severity === 'critical' ? 'var(--rose-500)' :
                             f.severity === 'high' ? 'var(--amber-400)' :
                             f.severity === 'medium' ? 'var(--sky-400)' : 'var(--text-secondary)';

            return (
              <div
                key={f.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                {/* Photo Thumbnail */}
                <div style={{
                  width: '90px',
                  height: '75px',
                  borderRadius: 'var(--radius-md)',
                  background: '#070C18',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {f.photo_url ? (
                    <img 
                      src={f.photo_url} 
                      alt="Fault evidence" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <Camera size={22} color="var(--text-muted)" />
                  )}
                </div>

                {/* Ticket Details */}
                <div style={{ flex: '1 1 320px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--emerald-400)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: 'rgba(16, 185, 129, 0.15)'
                    }}>
                      {f.ticket_number}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: sevColor,
                      textTransform: 'uppercase'
                    }}>
                      ● {f.severity}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • Category: {f.category.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', lineClamp: 2 }}>
                    {f.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Site: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{f.installation_name || `Site #${f.installation_id}`}</span>
                  </div>
                </div>

                {/* Status & Action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.65rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    background: isResolved ? 'rgba(16, 185, 129, 0.15)' : (f.status === 'resolved_pending_verification' || f.status === 'resident_confirmed') ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isResolved ? 'var(--emerald-400)' : (f.status === 'resolved_pending_verification' || f.status === 'resident_confirmed') ? 'var(--sky-400)' : 'var(--amber-400)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {f.status === 'resolved_pending_verification' 
                      ? (userRole === 'installation_owner' ? 'ISSUE SOLVED (CONFIRMATION NEEDED)' : 'ISSUE SOLVED (AWAITING RESIDENT CONFIRMATION)')
                      : f.status === 'resident_confirmed'
                      ? (userRole === 'distributor' || userRole === 'admin' ? 'RESIDENT CONFIRMED — READY TO CLOSE' : 'CONFIRMED — AWAITING DISTRIBUTOR FINAL CLOSE')
                      : f.status.replace(/_/g, ' ').toUpperCase()}
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {/* Resident Confirms Solution to Distributor */}
                    {f.status === 'resolved_pending_verification' && userRole === 'installation_owner' && (
                      <button
                        onClick={() => handleConfirmByResident(f.id)}
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                        title="Confirm that the maintainer solved the issue and send to distributor to close"
                      >
                        <CheckCircle2 size={13} />
                        Confirm Repair to Distributor
                      </button>
                    )}

                    {/* Distributor or Admin Closes / Reviews Evidence */}
                    {(f.status === 'resolved_pending_verification' || f.status === 'resident_confirmed') && (userRole === 'distributor' || userRole === 'admin') && (
                      <button
                        onClick={() => onOpenVerifyModal && onOpenVerifyModal(f)}
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.775rem', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)' }}
                        title="Review maintainer repair evidence and close ticket"
                      >
                        <ShieldCheck size={13} />
                        {f.status === 'resident_confirmed' ? 'Verify & Close Issue' : 'Review Evidence & Close'}
                      </button>
                    )}

                    {!isResolved && (userRole === 'distributor' || userRole === 'admin') && (
                      <button
                        onClick={() => handleQuickRepairSingle(f.id)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.72rem', borderColor: 'rgba(52, 211, 153, 0.4)', color: '#34d399' }}
                        title="Quick repair and mark ticket closed"
                      >
                        <CheckCircle2 size={13} color="#34d399" />
                        Repair & Close
                      </button>
                    )}

                    <button
                      onClick={() => navigate('/map')}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                      title="Locate site on Map"
                    >
                      <MapPin size={13} color="#10B981" />
                      Map
                    </button>

                    {f.status === 'reported' && (userRole === 'distributor' || userRole === 'admin') && (
                      <button
                        onClick={() => onOpenAssignModal && onOpenAssignModal(f)}
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.775rem' }}
                      >
                        <Wrench size={13} />
                        Assign Maintainer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Fault Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '540px',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="var(--rose-500)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Report Solar Equipment Fault</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {userRole === 'installation_owner' && installations.length === 0 ? (
                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#FCA5A5',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: '#EF4444' }}>
                    No Registered Solar Installations Found
                  </div>
                  As a resident, you can only report faults for your own registered solar assets. Please register your rooftop solar under the <strong>Asset Registry</strong> tab first.
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Select Solar Installation {userRole === 'installation_owner' && '(Your Registered Rooftop Systems)'}
                  </label>
                  <select
                    value={formInstId}
                    onChange={(e) => setFormInstId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  >
                    {installations.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.capacity_kw} kW) — {inst.city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Issue Headline</label>
                <input
                  type="text" required
                  placeholder="e.g. Inverter Error E031: MPPT 2 Ground Isolation Fault"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  >
                    <option value="inverter_failure">Inverter Failure</option>
                    <option value="panel_damage">Panel Physical Damage</option>
                    <option value="wiring_ground_fault">Wiring / Ground Fault</option>
                    <option value="shading_soiling">Severe Soiling / Hotspot</option>
                    <option value="grid_tripping">Grid Synchronization Trip</option>
                    <option value="battery_degradation">Battery Storage Degradation</option>
                    <option value="other">Other Incident</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  >
                    <option value="critical">Critical (System Offline)</option>
                    <option value="high">High (Major Power Drop)</option>
                    <option value="medium">Medium (Partial Substring Issue)</option>
                    <option value="low">Low (Cosmetic / Minor Alert)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Technical Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail symptoms, inverter screen codes, visual burns, or anomalous readings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF', resize: 'vertical' }}
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Incident Photograph Evidence
                </label>
                <div style={{
                  padding: '1rem',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    id="fault-photo-input"
                  />
                  <label htmlFor="fault-photo-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <Camera size={24} color="var(--emerald-400)" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {uploading ? "Uploading image..." : photoUrl ? "Photo Attached ✓ (Click to change)" : "Upload site photo (JPG, PNG, WebP)"}
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  disabled={userRole === 'installation_owner' && installations.length === 0}
                  className="btn-primary" 
                  style={{ 
                    flex: 1, 
                    justifyContent: 'center',
                    opacity: (userRole === 'installation_owner' && installations.length === 0) ? 0.5 : 1,
                    cursor: (userRole === 'installation_owner' && installations.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Submit Incident Ticket
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

