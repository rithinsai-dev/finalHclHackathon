import { useState, useEffect } from 'react';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Activity, Users, Calendar, DollarSign, Video as VideoIcon, MapPin as MapPinIcon } from 'lucide-react';

const AdminDashboard = () => {
  const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [summaryDate]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/summary/daily?date=${summaryDate}`);
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch summary", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Daily hospital summary and statistics</p>
        </div>
        <div className="form-group mb-0" style={{ minWidth: '200px' }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Select Date</label>
          <input 
            type="date" 
            className="form-control"
            value={summaryDate}
            onChange={(e) => setSummaryDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : summary ? (
        <>
          {/* Top Cards */}
          <div className="grid grid-cols-4 mb-4">
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="flex items-center gap-3">
                <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>Total Appointments</p>
                  <h2 style={{ margin: 0 }}>{summary.totalAppointments}</h2>
                </div>
              </div>
            </div>
            
            <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
              <div className="flex items-center gap-3">
                <div style={{ background: 'var(--accent-light)', padding: '1rem', borderRadius: '50%', color: 'var(--accent)' }}>
                  <VideoIcon size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>Online Appts</p>
                  <h2 style={{ margin: 0 }}>{summary.appointmentsByMode.ONLINE || 0}</h2>
                </div>
              </div>
            </div>
            
            <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div className="flex items-center gap-3">
                <div style={{ background: '#fffcf0', padding: '1rem', borderRadius: '50%', color: '#e6b800' }}>
                  <MapPinIcon size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>Offline Appts</p>
                  <h2 style={{ margin: 0 }}>{summary.appointmentsByMode.OFFLINE || 0}</h2>
                </div>
              </div>
            </div>
            
            <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
              <div className="flex items-center gap-3">
                <div style={{ background: '#e8f8f0', padding: '1rem', borderRadius: '50%', color: 'var(--success)' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>Total Revenue</p>
                  <h2 style={{ margin: 0 }}>Rs. {summary.totalRevenue}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="card">
              <h4 className="mb-4" style={{ color: 'var(--text)' }}><Activity size={18} className="inline mr-2 text-primary" /> Revenue by Mode</h4>
              <div className="flex justify-around items-center" style={{ padding: '2rem 0' }}>
                <div className="text-center">
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                    Rs. {summary.revenueByMode.ONLINE || 0}
                  </div>
                  <span className="badge badge-accent mt-2">ONLINE REVENUE</span>
                </div>
                <div style={{ width: '1px', height: '60px', background: 'var(--border)' }}></div>
                <div className="text-center">
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e6b800' }}>
                    Rs. {summary.revenueByMode.OFFLINE || 0}
                  </div>
                  <span className="badge badge-warning mt-2">OFFLINE REVENUE</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="mb-4" style={{ color: 'var(--text)' }}><Users size={18} className="inline mr-2 text-primary" /> Activity by Specialty</h4>
              {Object.keys(summary.appointmentsBySpecialty).length === 0 ? (
                <p className="text-center text-muted" style={{ padding: '2rem 0' }}>No data for this date.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {Object.entries(summary.appointmentsBySpecialty).map(([spec, count]) => (
                    <li key={spec} className="flex justify-between items-center mb-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{spec}</span>
                      <span className="badge badge-primary">{count} appointments</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center text-muted p-5">No summary data available.</div>
      )}
    </div>
  );
};

export default AdminDashboard;
