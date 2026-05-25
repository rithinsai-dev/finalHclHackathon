import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (value) => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 4) return 'Password must be at least 4 characters';
    return '';
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const errors = { ...fieldErrors };
    if (field === 'email') errors.email = validateEmail(email);
    if (field === 'password') errors.password = validatePassword(password);
    setFieldErrors(errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    setTouched({ email: true, password: true });

    // Check if any errors
    if (Object.values(errors).some(err => err)) return;

    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      if (result.role === 'ADMIN') navigate('/admin/doctors');
      else if (result.role === 'DOCTOR') navigate('/doctor');
      else navigate('/patient');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', background: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--primary)' }}>
            <LogIn size={32} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your CareLink account</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className={`form-control ${touched.email && fieldErrors.email ? 'form-control-error' : ''}`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (touched.email) setFieldErrors({ ...fieldErrors, email: validateEmail(e.target.value) }); }}
              onBlur={() => handleBlur('email')}
            />
            {touched.email && fieldErrors.email && (
              <span className="field-error"><AlertCircle size={14} /> {fieldErrors.email}</span>
            )}
          </div>
          
          <div className="form-group mb-4">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${touched.password && fieldErrors.password ? 'form-control-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (touched.password) setFieldErrors({ ...fieldErrors, password: validatePassword(e.target.value) }); }}
                onBlur={() => handleBlur('password')}
                style={{ paddingRight: '3rem' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && fieldErrors.password && (
              <span className="field-error"><AlertCircle size={14} /> {fieldErrors.password}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '1rem' }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p style={{ fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Register as Patient</Link>
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Doctors: Please contact admin for your login credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
