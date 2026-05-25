import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import BrowseDoctors from './pages/patient/BrowseDoctors';
import BookAppointment from './pages/patient/BookAppointment';

// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import RequestLeave from './pages/doctor/RequestLeave';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageLeaves from './pages/admin/ManageLeaves';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Routes */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/browse" element={<ProtectedRoute allowedRoles={['PATIENT']}><BrowseDoctors /></ProtectedRoute>} />
            <Route path="/patient/book/:id" element={<ProtectedRoute allowedRoles={['PATIENT']}><BookAppointment /></ProtectedRoute>} />

            {/* Doctor Routes */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/leave" element={<ProtectedRoute allowedRoles={['DOCTOR']}><RequestLeave /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageDoctors /></ProtectedRoute>} />
            <Route path="/admin/leaves" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageLeaves /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
