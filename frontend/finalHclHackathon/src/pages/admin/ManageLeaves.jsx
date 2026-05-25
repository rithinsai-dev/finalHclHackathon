import { useState, useEffect } from 'react';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const ManageLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const response = await api.get('/leaves/pending');
      if (response.data.success) {
        setLeaves(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pending leaves", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/leaves/${id}/${action}`);
      fetchPendingLeaves(); // Refresh list
    } catch (error) {
      alert(`Failed to ${action} leave request`);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="main-content">
      <div className="flex items-center gap-3 mb-4">
        <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '50%', color: 'var(--primary)' }}>
          <Calendar size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Pending Leave Requests</h2>
          <p style={{ margin: 0, color: 'var(--text-light)' }}>Review and approve doctor leave requests</p>
        </div>
      </div>

      {leaves.length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem 0' }}>
          <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem auto' }} />
          <h3>All caught up!</h3>
          <p>There are no pending leave requests to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {leaves.map(leave => (
            <div key={leave.id} className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div className="flex justify-between items-start mb-3">
                <h4 style={{ margin: 0, color: 'var(--text)' }}>Dr. {leave.doctor.name}</h4>
                <span className="badge badge-warning">Pending</span>
              </div>
              
              <div className="mb-3" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Specialty:</strong> {leave.doctor.specialty.name}</p>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Dates:</strong> {leave.startDate} to {leave.endDate}</p>
                <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                  <strong>Reason:</strong> {leave.reason}
                </div>
              </div>
              
              <div className="flex gap-3 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <button 
                  className="btn btn-primary flex-1" 
                  onClick={() => handleAction(leave.id, 'approve')}
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button 
                  className="btn btn-outline flex-1" 
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={() => handleAction(leave.id, 'reject')}
                >
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageLeaves;
