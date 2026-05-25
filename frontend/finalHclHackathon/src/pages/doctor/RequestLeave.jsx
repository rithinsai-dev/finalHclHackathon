import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const RequestLeave = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await api.get(`/leaves/doctor/${user.entityId}`);
      if (response.data.success) {
        setLeaves(response.data.data.sort((a,b) => new Date(b.startDate) - new Date(a.startDate)));
      }
    } catch (error) {
      console.error("Failed to fetch leaves", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        doctorId: user.entityId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      };
      
      const response = await api.post('/leaves', payload);
      if (response.data.success) {
        setSuccessMsg('Leave request submitted successfully. Waiting for admin approval.');
        setFormData({ startDate: '', endDate: '', reason: '' });
        fetchMyLeaves();
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div className="card">
          <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--primary)' }}>
            <Calendar size={24} />
            <h3 style={{ margin: 0 }}>Request Leave</h3>
          </div>
          
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Submit a leave request. Once approved by the admin, patients will not be able to book appointments for these dates.
          </p>

          {successMsg && (
            <div style={{ background: 'var(--success)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="error-message">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="startDate"
                  value={formData.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Reason</label>
              <textarea 
                className="form-control" 
                name="reason"
                rows="4"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Briefly explain the reason for your leave..."
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </form>
        </div>
      </div>

      <div>
        <div className="card h-full">
          <h3 className="mb-4 text-primary" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            My Leave History
          </h3>
          
          {leaves.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem 0' }}>No leave requests found.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {leaves.map(leave => (
                <div key={leave.id} style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span style={{ fontWeight: 600 }}>{leave.startDate} to {leave.endDate}</span>
                    <span className={`badge ${
                      leave.status === 'APPROVED' ? 'badge-success' : 
                      leave.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    <strong>Reason:</strong> {leave.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestLeave;
