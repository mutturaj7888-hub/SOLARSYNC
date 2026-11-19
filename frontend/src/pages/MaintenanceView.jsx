import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Plus, 
  Camera, 
  FileText,
  ShieldCheck,
  X,
  ArrowRight,
  Layers,
  MapPin,
  AlertTriangle,
  Sparkles,
  Sun
} from 'lucide-react';
import { 
  getAssignments, 
  assignTechnician, 
  updateAssignmentProgress, 
  getSchedules, 
  createSchedule,
  submitRepairEvidence,
  verifyRepair,
  getTechnicians,
  getFaults,
  uploadFaultPhoto
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MaintenanceView({ 
  preselectedTicket = null,
  verifyTargetFault = null,
  onClearVerifyTarget = () => {}
}) {
  const navigate = useNavigate();
  const { userRole, currentUser } = useAuth();
  const [tab, setTab] = useState('orders'); // 'orders' | 'schedules'
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFaultId, setSelectedFaultId] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [priority, setPriority] = useState('routine');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Submit Evidence Modal (Technician)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [beforePhoto, setBeforePhoto] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [workSummary, setWorkSummary] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [hoursSpent, setHoursSpent] = useState(2);

  // Review & Verify Modal (Owner / Admin)
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [evidenceToReview, setEvidenceToReview] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignData, schedData, techData, faultData] = await Promise.all([
        getAssignments(),
        getSchedules(),
        getTechnicians().catch(() => []),
        getFaults({ status: 'reported' }).catch(() => [])
      ]);
      setAssignments(assignData);
      setSchedules(schedData);
      setTechnicians(techData);
      setFaults(faultData);

      if (faultData.length > 0 && !selectedFaultId) {
        setSelectedFaultId(faultData[0].id);
      }
      if (techData.length > 0 && !selectedTechId) {
        setSelectedTechId(techData[0].id);
      }
    } catch (err) {
      console.warn("Error loading maintenance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle preselected verification modal request from other tabs
  useEffect(() => {
    if (verifyTargetFault) {
      setEvidenceToReview({
        fault: verifyTargetFault,
        before_photo_url: verifyTargetFault.photo_url || "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80",
        after_photo_url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
        work_summary: "Replaced faulty inverter MPPT boards and cleaned solar string terminals.",
        parts_replaced: "Sungrow 50kW MPPT replacement kit",
        id: 1
      });
      setShowVerifyModal(true);
    }
  }, [verifyTargetFault]);

  // Handle Start Job
  const handleStartJob = async (assignmentId) => {
    try {
      await updateAssignmentProgress(assignmentId, 'started');
      loadData();
      alert("Job marked as IN PROGRESS. Technician timer started.");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  // Open Evidence Submission modal
  const handleOpenEvidence = (assign) => {
    setActiveAssignment(assign);
    setShowEvidenceModal(true);
  };

  // Submit Evidence
  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (!activeAssignment) return;
    try {
      await submitRepairEvidence({
        fault_report_id: activeAssignment.fault_report_id,
        before_photo_url: beforePhoto || "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80",
        after_photo_url: afterPhoto || "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80",
        work_summary: workSummary,
        parts_replaced: partsReplaced,
        repair_duration_hours: parseInt(hoursSpent) || 2
      });
      setShowEvidenceModal(false);
      loadData();
      alert("Repair evidence submitted! Awaiting owner/administrator verification.");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  // Assign Tech Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (userRole !== 'distributor' && userRole !== 'admin') {
      alert("Access Denied: Only Distributors have permission to assign maintainers.");
      return;
    }
    try {
      await assignTechnician({
        fault_report_id: parseInt(selectedFaultId),
        technician_id: parseInt(selectedTechId),
        priority,
        dispatch_notes: dispatchNotes
      });
      setShowAssignModal(false);
      loadData();
      alert("Technician dispatched! Work order created & notification sent.");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  // Verify Repair Decision
  const handleVerifyDecision = async (approved) => {
    if (!evidenceToReview) return;
    try {
      await verifyRepair(evidenceToReview.id || 1, approved, verifyNotes || "Inspected and confirmed.");
      setShowVerifyModal(false);
      onClearVerifyTarget();
      loadData();
      alert(approved ? "Repair APPROVED & Ticket Closed! Installation restored to Operational." : "Repair REJECTED & Reopened with technician feedback.");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {(userRole === 'distributor' || userRole === 'admin')
              ? 'Distributor Task Dispatch & Verification' 
              : (userRole === 'technician' || userRole === 'maintainer')
              ? 'Maintainer Work Orders & Repair Queue' 
              : 'Nearby Maintenance Requests & Tracking'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {(userRole === 'distributor' || userRole === 'admin')
              ? 'Distributors assign tasks to maintainers from problem requests reported by nearby residents.'
              : (userRole === 'technician' || userRole === 'maintainer')
              ? 'Active maintenance jobs assigned to you by distributors. Update progress and submit before/after photo evidence.'
              : 'Track the status and assigned maintainer for your registered solar installations.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/map')} 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
          >
            <MapPin size={14} color="#10B981" />
            Solar Fleet Map
          </button>
          <button 
            onClick={() => navigate('/faults')} 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
          >
            <AlertTriangle size={14} color="#F59E0B" />
            Nearby Requests
          </button>
          <button 
            onClick={() => navigate('/assets')} 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
          >
            <Sun size={14} color="#38BDF8" />
            Asset Registry
          </button>
          {(userRole === 'distributor' || userRole === 'admin') && (
            <button onClick={() => setShowAssignModal(true)} className="btn-primary">
              <Plus size={16} />
              Assign Task to Maintainer
            </button>
          )}
        </div>
      </div>

      {/* ECHOID Terminal Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setTab('orders')}
          className={tab === 'orders' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.75rem' }}
        >
          Active Work Orders ({assignments.length})
        </button>
        <button
          onClick={() => setTab('schedules')}
          className={tab === 'schedules' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.45rem 1rem', fontSize: '0.75rem' }}
        >
          Preventive Schedules ({schedules.length})
        </button>
      </div>

      {/* Work Orders List */}
      {tab === 'orders' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading technician assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
              No active maintenance assignments.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignments.map((assign) => (
                <div
                  key={assign.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: '1 1 300px' }}>
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
                        {assign.ticket_number || `WO-#${assign.id}`}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: assign.priority === 'emergency' ? 'var(--rose-500)' : 'var(--amber-400)',
                        textTransform: 'uppercase'
                      }}>
                        ● {assign.priority} Priority
                      </span>
                    </div>

                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Technician Assigned: <span style={{ color: 'var(--sky-400)' }}>{assign.technician_name}</span>
                    </div>

                    {assign.dispatch_notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Notes: {assign.dispatch_notes}
                      </p>
                    )}

                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                      <span>Assigned: {new Date(assign.assigned_at).toLocaleDateString()}</span>
                      {assign.started_at && <span>Started: {new Date(assign.started_at).toLocaleTimeString()}</span>}
                      {assign.completed_at && <span>Completed: {new Date(assign.completed_at).toLocaleTimeString()}</span>}
                    </div>
                  </div>

                  {/* Technician & Admin Workflow Actions */}
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <button
                      onClick={() => navigate('/map')}
                      className="btn-secondary"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                      title="View Installation on Geospatial Map"
                    >
                      <MapPin size={14} color="#10B981" />
                      Map
                    </button>

                    {(userRole === 'technician' || userRole === 'maintainer' || userRole === 'admin') && !assign.started_at && (
                      <button
                        onClick={() => handleStartJob(assign.id)}
                        className="btn-primary"
                        style={{ padding: '0.55rem 1rem', fontSize: '0.825rem' }}
                      >
                        <Wrench size={15} />
                        Start Maintenance
                      </button>
                    )}

                    {(userRole === 'technician' || userRole === 'maintainer' || userRole === 'admin') && assign.started_at && !assign.completed_at && (
                      <button
                        onClick={() => handleOpenEvidence(assign)}
                        className="btn-primary"
                        style={{ padding: '0.55rem 1rem', fontSize: '0.825rem', background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)' }}
                      >
                        <Camera size={15} />
                        Submit Repair Evidence
                      </button>
                    )}

                    {userRole === 'installation_owner' && !assign.completed_at && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: assign.started_at ? 'rgba(56, 189, 248, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: assign.started_at ? 'var(--sky-400)' : 'var(--amber-400)',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        <Clock size={15} />
                        {assign.started_at ? 'Maintainer On Site (In Progress)' : 'Maintainer Dispatched (Queued)'}
                      </div>
                    )}

                    {assign.completed_at && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--emerald-400)',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        <CheckCircle2 size={16} />
                        Repair Completed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preventive Schedules */}
      {tab === 'schedules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {schedules.map((s) => (
            <div key={s.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.35rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--sky-400)', textTransform: 'uppercase' }}>
                  {s.frequency}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Due: {new Date(s.scheduled_date).toLocaleDateString()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Checklist: Inverter DC switch contactor check, thermographic IR scan of strings, array earthing test.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--emerald-400)',
                fontWeight: 600
              }}>
                <CheckCircle2 size={14} />
                Automated Reminder Set
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Dispatch Maintainer (Distributor Only) */}
      {showAssignModal && (userRole === 'distributor' || userRole === 'admin') && (
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
            maxWidth: '520px',
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Assign Request to Nearby Maintainer</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Select Problem Request</label>
                <select
                  value={selectedFaultId}
                  onChange={(e) => setSelectedFaultId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                >
                  {faults.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.ticket_number}: {f.title} ({f.severity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Available Field Maintainer</label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.phone_number || t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Priority SLA</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                >
                  <option value="routine">Routine (48h response)</option>
                  <option value="expedited">Expedited (12h response)</option>
                  <option value="emergency">Emergency (4h critical response)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Dispatch Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Specific safety protocols, component serials, or roof access instructions..."
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Assign Task to Maintainer
                </button>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Repair Evidence (Technician) */}
      {showEvidenceModal && (
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
            maxWidth: '560px',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={20} color="var(--sky-400)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Submit Repair Evidence</h3>
              </div>
              <button onClick={() => setShowEvidenceModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Work Performed Summary</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Replaced burnt DC fuse block, calibrated MPPT tracker, and verified AC output at 48.5 kW."
                  value={workSummary}
                  onChange={(e) => setWorkSummary(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Parts Replaced</label>
                  <input
                    type="text"
                    placeholder="e.g. 1000V 32A Fuse, 2x MC4"
                    value={partsReplaced}
                    onChange={(e) => setPartsReplaced(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Duration (Hours)</label>
                  <input
                    type="number" min="1" max="24"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
              </div>

              {/* Side by side Before/After photo placeholders */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Before Repair Photo</label>
                  <input
                    type="text"
                    placeholder="URL or Upload"
                    value={beforePhoto}
                    onChange={(e) => setBeforePhoto(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>After Repair Photo *</label>
                  <input
                    type="text" required
                    placeholder="URL or Upload"
                    value={afterPhoto}
                    onChange={(e) => setAfterPhoto(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Submit Evidence for Sign-off
                </button>
                <button type="button" onClick={() => setShowEvidenceModal(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Repair Verification (Owner / Admin) */}
      {showVerifyModal && evidenceToReview && (
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
            maxWidth: '680px',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="var(--emerald-400)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Verify Completed Repair</h3>
              </div>
              <button onClick={() => setShowVerifyModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Before vs After Side-by-Side Photos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rose-500)', marginBottom: '0.35rem' }}>
                  BEFORE REPAIR (FAULT STATE)
                </div>
                <div style={{ height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', border: '1px solid var(--border-subtle)' }}>
                  <img
                    src={evidenceToReview.before_photo_url || "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80"}
                    alt="Before repair"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)', marginBottom: '0.35rem' }}>
                  AFTER REPAIR (COMPLETED WORK)
                </div>
                <div style={{ height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', border: '1px solid var(--border-subtle)' }}>
                  <img
                    src={evidenceToReview.after_photo_url || "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80"}
                    alt="After repair"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>TECHNICIAN WORK SUMMARY:</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{evidenceToReview.work_summary}</p>
              {evidenceToReview.parts_replaced && (
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Parts replaced: <span style={{ color: 'var(--text-main)' }}>{evidenceToReview.parts_replaced}</span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Verification Feedback / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Confirmed with live inverter telemetry. Generating normally."
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: '#1F2937', border: '1px solid var(--border-subtle)', color: '#FFF' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => handleVerifyDecision(true)}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <CheckCircle2 size={16} />
                Approve & Close Ticket
              </button>
              <button
                onClick={() => handleVerifyDecision(false)}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--rose-500)',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  padding: '0.75rem'
                }}
              >
                <X size={16} />
                Reject & Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

