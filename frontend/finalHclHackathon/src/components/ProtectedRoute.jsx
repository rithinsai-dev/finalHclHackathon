import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have the right role, send to their dashboard
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin/doctors" replace />;
      case 'DOCTOR': return <Navigate to="/doctor" replace />;
      case 'PATIENT': return <Navigate to="/patient" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
