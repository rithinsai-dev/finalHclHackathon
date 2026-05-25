import { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      // Get today's date in YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/appointments/doctor/${user.entityId}?date=${today}`);
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch today's appointments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const endpoint = status === 'COMPLETED' ? 'complete' : 'no-show';
      await api.patch(`/appointments/${appointmentId}/${endpoint}`);
      fetchTodayAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="main-content">
      <div className="mb-4">
        <h2>Doctor Dashboard</h2>
        <p>Today's Schedule ({new Date().toLocaleDateString()})</p>
      </div>

      <div className="table-container">
        {appointments.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ display: 'inline-flex', background: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
              <Calendar size={32} />
            </div>
            <h4 style={{ color: 'var(--text-light)' }}>No appointments scheduled for today</h4>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient Name</th>
                <th>Problem Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td style={{ fontWeight: 600 }}>{appt.startTime.substring(0,5)}</td>
                  <td>{appt.patient.name}</td>
                  <td style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    {appt.description || 'No description provided'}
                  </td>
                  <td>
                    <span className={`badge ${
                      appt.status === 'CONFIRMED' ? 'badge-success' : 
                      appt.status === 'COMPLETED' ? 'badge-primary' : 
                      appt.status === 'NO_SHOW' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>
                    {appt.status === 'CONFIRMED' && (
                      <div className="flex gap-2 flex-wrap items-center">
                        <button 
                          onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                          className="btn btn-outline" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                        >
                          <CheckCircle size={14} /> Complete
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(appt.id, 'NO_SHOW')}
                          className="btn btn-outline" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#e6b800', borderColor: '#e6b800' }}
                        >
                          <XCircle size={14} /> No Show
                        </button>
                        {appt.mode === 'ONLINE' && appt.meetingLink && (
                          <a 
                            href={appt.meetingLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-primary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          >
                            Join Meeting
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
