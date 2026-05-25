import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, Gift } from 'lucide-react';

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

  // Follow-up state
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState('');

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  useEffect(() => {
    if (doctor) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctor]);

  useEffect(() => {
    if (doctor && user?.entityId && selectedDate) {
      checkFollowUpEligibility();
    }
  }, [doctor, user, selectedDate]);

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

  const checkFollowUpEligibility = async () => {
    try {
      const response = await api.get(`/appointments/follow-up-check?patientId=${user.entityId}&doctorId=${id}&date=${selectedDate}`);
      if (response.data.success) {
        setIsFollowUp(response.data.data.eligible);
        setFollowUpMessage(response.data.data.message);
      }
    } catch (error) {
      console.error("Failed to check follow-up eligibility", error);
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
        navigate('/patient');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to book appointment';
      setError(errorMessage);
      
      // Explicitly prompt the user with a popup alert as requested
      if (errorMessage.includes("already have an appointment")) {
        window.alert(errorMessage);
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!doctor) return <div className="main-content"><h2>Doctor not found</h2></div>;

  const displayFee = isFollowUp ? 0 : doctor.consultationFee;

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

      {/* Follow-up Banner */}
      {isFollowUp && (
        <div style={{
          background: 'linear-gradient(135deg, #e8f8f0, #d1fae5)',
          border: '1px solid var(--success)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ background: 'var(--success)', padding: '0.6rem', borderRadius: '50%', color: 'white', display: 'flex' }}>
            <Gift size={22} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--success)', fontSize: '1rem' }}>
              🎉 Free Follow-Up Appointment!
            </p>
            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.85rem' }}>
              {followUpMessage}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Doctor Summary */}
        <div className="card">
          <h4 className="mb-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Doctor Summary</h4>
          <p><strong>Name:</strong> Dr. {doctor.name}</p>
          <p><strong>Specialty:</strong> {doctor.specialty.name}</p>
          <p>
            <strong>Fee:</strong>{' '}
            {isFollowUp ? (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                  Rs. {doctor.consultationFee}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.1rem' }}>
                  Rs. 0 (Follow-Up)
                </span>
              </>
            ) : (
              <span>Rs. {doctor.consultationFee}</span>
            )}
          </p>
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
        <div className="card mt-4" style={{ border: '2px solid var(--primary-light)', backgroundColor: '#f8fafc' }}>
          <h4 className="mb-3 flex items-center gap-2 text-primary">
            <CheckCircle size={20} /> {isFollowUp ? 'Confirm Follow-Up Booking' : 'Confirm Booking'}
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
              <p style={{ margin: 0, color: isFollowUp ? 'var(--success)' : 'var(--text-light)', fontSize: '0.9rem', fontWeight: isFollowUp ? 700 : 400 }}>
                Total Fee: Rs. {displayFee}
                {isFollowUp && <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>FREE FOLLOW-UP</span>}
              </p>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
              onClick={handleBook}
              disabled={booking}
            >
              {booking ? 'Booking...' : isFollowUp ? 'Book Follow-Up (Free)' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
