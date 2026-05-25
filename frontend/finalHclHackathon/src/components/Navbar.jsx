import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin/doctors';
      case 'DOCTOR': return '/doctor';
      case 'PATIENT': return '/patient';
      default: return '/login';
    }
  };

  return (
    <nav className="navbar">
      <Link to={getDashboardLink()} className="nav-brand">
        <span style={{ fontSize: '1.8rem' }}>+</span> CareLink
      </Link>
      
      {user ? (
        <div className="nav-links">
          {user.role === 'PATIENT' && (
            <Link to="/patient/browse" className="nav-link">Find Doctors</Link>
          )}
          {user.role === 'DOCTOR' && (
            <Link to="/doctor/leave" className="nav-link">Request Leave</Link>
          )}
          {user.role === 'ADMIN' && (
            <>
              <Link to="/admin/doctors" className="nav-link">Doctors</Link>
              <Link to="/admin/leaves" className="nav-link">Leaves</Link>
            </>
          )}
          
          <div className="flex items-center gap-4" style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
            <div className="flex items-center gap-2">
              <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
                <UserIcon size={18} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>{user.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{user.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem' }} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
