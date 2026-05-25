import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const BookAppointment = () => {
  const { id } = useParams(); // doctorId
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [description, setDescription] = useState('');
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  useEffect(() => {
    if (doctor) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctor]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await api.get(`/doctors/${id}`);
      if (response.data.success) {
        setDoctor(response.data.data);
      }
    } catch (error) {
      setError("Failed to load doctor details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const response = await api.get(`/slots/doctor/${id}?date=${selectedDate}&status=AVAILABLE`);
      if (response.data.success) {
        setSlots(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch slots", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    
    setBooking(true);
    setError('');
    
    try {
      const payload = {
        patientId: user.entityId,
        doctorId: doctor.id,
        slotId: selectedSlot.id,
        description: description
      };
      
      const response = await api.post('/appointments', payload);
      if (response.data.success) {
        // Redirect to dashboard on success
        navigate('/patient');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!doctor) return <div className="main-content"><h2>Doctor not found</h2></div>;

  return (
    <div className="main-content max-w-4xl mx-auto" style={{ maxWidth: '800px' }}>
      <div className="mb-4">
        <h2>Book Appointment</h2>
        <p>Complete your booking with Dr. {doctor.name}</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Doctor Summary */}
        <div className="card">
          <h4 className="mb-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Doctor Summary</h4>
          <p><strong>Name:</strong> Dr. {doctor.name}</p>
          <p><strong>Specialty:</strong> {doctor.specialty.name}</p>
          <p><strong>Fee:</strong> Rs. {doctor.consultationFee}</p>
          <p><strong>Mode:</strong> <span className="badge badge-accent">{doctor.mode}</span></p>
        </div>

        {/* Date Selection */}
        <div className="card">
          <h4 className="mb-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Select Date</h4>
          <div className="form-group">
            <label className="form-label flex items-center gap-2"><CalendarIcon size={16}/> Choose Date</label>
            <input 
              type="date" 
              className="form-control"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Slot Selection */}
      <div className="card mt-4">
        <h4 className="mb-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Available Slots</h4>
        
        {slotsLoading ? (
          <div className="text-center py-4"><LoadingSpinner /></div>
        ) : slots.length === 0 ? (
          <div className="text-center py-4" style={{ color: 'var(--text-light)' }}>
            No slots available on this date. Doctor might be on leave or fully booked.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
            {slots.map(slot => (
              <button
                key={slot.id}
                className={`btn ${selectedSlot?.id === slot.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.75rem 0.5rem', width: '100%' }}
                onClick={() => setSelectedSlot(slot)}
              >
                <Clock size={16} />
                {slot.startTime.substring(0,5)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Problem Description & Confirm */}
      {selectedSlot && (
        <div className="card mt-4" style={{ border: '2px solid var(--primary-light)', backgroundColor: '#fffdfc' }}>
          <h4 className="mb-3 flex items-center gap-2 text-primary">
            <CheckCircle size={20} /> Confirm Booking
          </h4>
          
          <div className="form-group mb-4">
            <label className="form-label">Reason for visit (Optional)</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Briefly describe your symptoms or reason for consultation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-4" style={{ background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>Selected Time: {selectedDate} at {selectedSlot.startTime.substring(0,5)}</p>
              <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>Total Fee: Rs. {doctor.consultationFee}</p>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
              onClick={handleBook}
              disabled={booking}
            >
              {booking ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
