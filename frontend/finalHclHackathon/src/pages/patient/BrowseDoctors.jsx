import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Search, Filter, Stethoscope, Video, MapPin, ChevronRight } from 'lucide-react';

const BrowseDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedMode, setSelectedMode] = useState('');

  useEffect(() => {
    fetchSpecialties();
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedMode]);

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      if (response.data.success) {
        setSpecialties(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch specialties", error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let url = '/doctors?';
      if (selectedSpecialty) url += `specialtyId=${selectedSpecialty}&`;
      if (selectedMode) url += `mode=${selectedMode}`;
      
      const response = await api.get(url);
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch doctors", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="mb-4 text-center">
        <h2>Find a Doctor</h2>
        <p>Book an online or offline consultation with our specialists</p>
      </div>

      {/* Filter Section */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-primary" />
          <h4 style={{ margin: 0 }}>Filters</h4>
        </div>
        <div className="grid grid-cols-2">
          <div>
            <label className="form-label">Specialty</label>
            <select 
              className="form-control" 
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="">All Specialties</option>
              {specialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Consultation Mode</label>
            <div className="flex gap-2">
              <button 
                className={`btn flex-1 ${selectedMode === '' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedMode('')}
              >
                All
              </button>
              <button 
                className={`btn flex-1 ${selectedMode === 'ONLINE' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedMode('ONLINE')}
              >
                <Video size={16} /> Online
              </button>
              <button 
                className={`btn flex-1 ${selectedMode === 'OFFLINE' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedMode('OFFLINE')}
              >
                <MapPin size={16} /> In-Clinic
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      {loading ? (
        <LoadingSpinner />
      ) : doctors.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <Search size={48} className="text-muted mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <h3>No doctors found</h3>
          <p>Try adjusting your filters to see more results.</p>
          <button className="btn btn-outline mt-2" onClick={() => { setSelectedMode(''); setSelectedSpecialty(''); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {doctors.map(doctor => (
            <div key={doctor.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '50%', color: 'var(--primary)' }}>
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Dr. {doctor.name}</h4>
                      <span className="badge badge-accent mt-1">{doctor.specialty.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 mb-4" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  <p style={{ marginBottom: '0.5rem' }}><strong>Qual:</strong> {doctor.qualification}</p>
                  <p style={{ marginBottom: '0.5rem' }}><strong>Fee:</strong> Rs. {doctor.consultationFee}</p>
                  
                  <div className="flex items-center gap-1 mt-2 font-medium" style={{ color: doctor.mode === 'ONLINE' ? 'var(--accent)' : 'var(--text)' }}>
                    {doctor.mode === 'ONLINE' ? <Video size={16} /> : <MapPin size={16} />}
                    {doctor.mode} Consultation
                  </div>
                </div>
              </div>
              
              <Link to={`/patient/book/${doctor.id}`} className="btn btn-primary w-full justify-between">
                <span>View Availability</span>
                <ChevronRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseDoctors;
