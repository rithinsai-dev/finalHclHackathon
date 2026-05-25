import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar, Clock, Video, MapPin, XCircle, RefreshCw } from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/appointments/patient/${user.entityId}`);
      if (response.data.success) {
        // Sort by date/time (newest first)
        const sorted = response.data.data.sort((a, b) => {
          const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
          const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
          return dateB - dateA;
        });
        setAppointments(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.patch(`/appointments/${appointmentId}/cancel`);
        fetchAppointments(); // refresh list
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel appointment');
      }
    }
  };

  const isWithin15Days = (dateStr) => {
    const appointmentDate = new Date(dateStr);
    const today = new Date();
    const diffInDays = Math.floor((today - appointmentDate) / (1000 * 60 * 60 * 24));
    return diffInDays >= 0 && diffInDays <= 15;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED': return <span className="badge badge-success">Confirmed</span>;
      case 'COMPLETED': return <span className="badge badge-primary">Completed</span>;
      case 'CANCELLED': return <span className="badge badge-danger">Cancelled</span>;
      case 'NO_SHOW': return <span className="badge badge-warning">No Show</span>;
      default: return <span className="badge badge-accent">{status}</span>;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="main-content">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2>My Appointments</h2>
          <p>Manage your upcoming and past doctor visits</p>
        </div>
        <Link to="/patient/browse" className="btn btn-primary">
          <Calendar size={18} /> Book New Appointment
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="card text-center" style={{ padding: '4rem 2rem' }}>
          <div style={{ display: 'inline-flex', background: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Calendar size={48} />
          </div>
          <h3>No appointments yet</h3>
          <p>You haven't booked any appointments. Find a doctor to get started.</p>
          <Link to="/patient/browse" className="btn btn-primary mt-3">Find a Doctor</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {appointments.map(appt => (
            <div key={appt.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>
                    Dr. {appt.doctor.name}
                  </span>
                </div>
                {getStatusBadge(appt.status)}
              </div>
              
              <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {appt.doctor.specialty.name} • {appt.mode} Consultation
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  <Calendar size={16} className="text-primary" /> {appt.appointmentDate}
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                  <Clock size={16} className="text-primary" /> {appt.startTime}
                </div>
              </div>

              {appt.mode === 'ONLINE' && appt.meetingLink && appt.status === 'CONFIRMED' && (
                <div style={{ background: 'var(--accent-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Video size={18} className="text-accent" />
                  <a href={appt.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--accent-hover)' }}>Join Meeting</a>
                </div>
              )}

              {appt.description && (
                <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                  <strong>Notes:</strong> {appt.description}
                </div>
              )}

              {appt.status === 'CONFIRMED' && (
                <div className="flex justify-between items-center mt-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>Fee: Rs. {appt.fee}</span>
                  <button onClick={() => handleCancel(appt.id)} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.5rem 1rem' }}>
                    <XCircle size={16} /> Cancel
                  </button>
                </div>
              )}

              {/* Follow-Up Button for completed appointments within 15 days */}
              {appt.status === 'COMPLETED' && isWithin15Days(appt.appointmentDate) && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ background: 'linear-gradient(135deg, #e8f8f0, #d1fae5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 500 }}>
                    🎉 Free follow-up available for 15 days from your last visit
                  </div>
                  <Link 
                    to={`/patient/book/${appt.doctor.id}`} 
                    className="btn btn-primary w-full"
                    style={{ background: 'var(--success)', padding: '0.75rem' }}
                  >
                    <RefreshCw size={16} /> Book Follow-Up Appointment (Free)
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
