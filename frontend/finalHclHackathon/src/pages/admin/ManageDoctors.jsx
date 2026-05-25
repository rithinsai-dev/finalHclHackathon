import { useState, useEffect } from 'react';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { UserPlus, Trash2, Search, MapPin, Video } from 'lucide-react';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New Doctor Form State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', qualification: '', 
    consultationFee: '', mode: 'ONLINE', meetingLink: '', specialtyId: ''
  });

  useEffect(() => {
    fetchSpecialties();
    fetchDoctors();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      if (response.data.success) setSpecialties(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/doctors');
      if (response.data.success) setDoctors(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctors', formData);
      setIsAdding(false);
      fetchDoctors();
      setFormData({
        name: '', email: '', password: '', phone: '', qualification: '', 
        consultationFee: '', mode: 'ONLINE', meetingLink: '', specialtyId: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this doctor?')) {
      try {
        await api.delete(`/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete doctor');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="main-content">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2>Manage Doctors</h2>
          <p>Add new doctors or remove existing ones</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : <><UserPlus size={18} /> Add Doctor</>}
        </button>
      </div>

      {isAdding && (
        <div className="card mb-4" style={{ background: 'linear-gradient(to right, var(--card), var(--bg))' }}>
          <h4 className="mb-3">Add New Doctor</h4>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              <div className="form-group"><label className="form-label">Name</label><input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Login Password</label><input type="text" className="form-control" name="password" value={formData.password} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Qualification</label><input type="text" className="form-control" name="qualification" value={formData.qualification} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Fee (Rs)</label><input type="number" className="form-control" name="consultationFee" value={formData.consultationFee} onChange={handleChange} required /></div>
              
              <div className="form-group">
                <label className="form-label">Specialty</label>
                <select className="form-control" name="specialtyId" value={formData.specialtyId} onChange={handleChange} required>
                  <option value="">Select Specialty</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Mode</label>
                <select className="form-control" name="mode" value={formData.mode} onChange={handleChange} required>
                  <option value="ONLINE">ONLINE</option>
                  <option value="OFFLINE">OFFLINE</option>
                </select>
              </div>

              {formData.mode === 'ONLINE' && (
                <div className="form-group col-span-2">
                  <label className="form-label">Meeting Link</label>
                  <input type="url" className="form-control" name="meetingLink" value={formData.meetingLink} onChange={handleChange} required />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary mt-2">Create Doctor Account</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialty</th>
              <th>Mode</th>
              <th>Fee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map(doctor => (
              <tr key={doctor.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>Dr. {doctor.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{doctor.email}</div>
                </td>
                <td><span className="badge badge-primary">{doctor.specialty.name}</span></td>
                <td>
                  <div className="flex items-center gap-1 font-medium" style={{ color: doctor.mode === 'ONLINE' ? 'var(--accent)' : 'var(--text)' }}>
                    {doctor.mode === 'ONLINE' ? <Video size={14} /> : <MapPin size={14} />}
                    {doctor.mode}
                  </div>
                </td>
                <td>Rs. {doctor.consultationFee}</td>
                <td>
                  <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.4rem 0.8rem' }} onClick={() => handleDelete(doctor.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageDoctors;
