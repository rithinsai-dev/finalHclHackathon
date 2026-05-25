import { useState, useEffect } from 'react';
import api from '../../api/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Trash2, Tag } from 'lucide-react';

const ManageSpecialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/specialties');
      if (response.data.success) {
        setSpecialties(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSpecialty.trim()) return;
    
    try {
      await api.post('/specialties', { name: newSpecialty });
      setNewSpecialty('');
      fetchSpecialties();
    } catch (error) {
      alert('Failed to add specialty');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This might affect doctors with this specialty.')) {
      try {
        await api.delete(`/specialties/${id}`);
        fetchSpecialties();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete specialty');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="main-content max-w-4xl mx-auto">
      <div className="mb-4">
        <h2>Manage Specialties</h2>
        <p>Add or remove doctor specialties</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card h-fit-content">
          <h4 className="mb-3">Add New Specialty</h4>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g., Cardiology"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={18} /> Add
            </button>
          </form>
        </div>

        <div className="card">
          <h4 className="mb-3">Existing Specialties</h4>
          {specialties.length === 0 ? (
            <p className="text-muted">No specialties added yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {specialties.map(spec => (
                <li key={spec.id} className="flex justify-between items-center mb-2" style={{ background: 'var(--bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div className="flex items-center gap-2 font-medium">
                    <Tag size={16} className="text-primary" /> {spec.name}
                  </div>
                  <button 
                    className="btn btn-outline" 
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                    onClick={() => handleDelete(spec.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSpecialties;
