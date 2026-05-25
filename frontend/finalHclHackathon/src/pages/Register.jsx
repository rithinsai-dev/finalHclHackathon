import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validators = {
    name: (value) => {
      if (!value.trim()) return 'Full name is required';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Name can only contain letters, spaces, dots, hyphens';
      return '';
    },
    email: (value) => {
      if (!value.trim()) return 'Email is required';
      if (/^\d/.test(value.trim())) return 'Email cannot start with a number';
      const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email (e.g. name@gmail.com)';
      const domain = value.split('@')[1];
      if (!domain || domain.split('.').some(part => part.length === 0)) return 'Invalid domain in email';
      const tld = domain.split('.').pop();
      if (tld.length < 2 || tld.length > 6) return 'Email domain has an invalid extension';
      return '';
    },
    password: (value) => {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
      if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
      if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
      if (!/[0-9]/.test(value)) return 'Must contain at least one number';
      return '';
    },
    phone: (value) => {
      if (!value.trim()) return 'Phone number is required';
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 10) return 'Phone number must be exactly 10 digits';
      return '';
    },
    dateOfBirth: (value) => {
      if (!value) return 'Date of birth is required';
      const dob = new Date(value);
      const today = new Date();
      if (dob >= today) return 'Date of birth cannot be in the future';
      const age = today.getFullYear() - dob.getFullYear();
      if (age > 120) return 'Please enter a valid date of birth';
      return '';
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: 33, label: 'Weak', color: 'var(--danger)' };
    if (score <= 4) return { strength: 66, label: 'Medium', color: 'var(--warning)' };
    return { strength: 100, label: 'Strong', color: 'var(--success)' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setFieldErrors({ ...fieldErrors, [name]: validators[name](value) });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setFieldErrors({ ...fieldErrors, [field]: validators[field](formData[field]) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors = {};
    Object.keys(validators).forEach(field => {
      errors[field] = validators[field](formData[field]);
    });
    setFieldErrors(errors);
    setTouched({ name: true, email: true, password: true, phone: true, dateOfBirth: true });

    // Check if any errors
    if (Object.values(errors).some(err => err)) return;

    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/patient');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const renderField = (name, label, type = 'text', placeholder = '') => {
    const hasError = touched[name] && fieldErrors[name];
    const isValid = touched[name] && !fieldErrors[name] && formData[name];
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div style={{ position: 'relative' }}>
          <input
            type={name === 'password' ? (showPassword ? 'text' : 'password') : type}
            className={`form-control ${hasError ? 'form-control-error' : ''} ${isValid ? 'form-control-valid' : ''}`}
            name={name}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            style={name === 'password' ? { paddingRight: '3rem' } : {}}
          />
          {name === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {isValid && name !== 'password' && (
            <CheckCircle size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--success)' }} />
          )}
        </div>
        {name === 'password' && formData.password && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--border)' }}>
                <div style={{ width: `${passwordStrength.strength}%`, height: '100%', borderRadius: '2px', background: passwordStrength.color, transition: 'width 0.3s ease' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: passwordStrength.color }}>{passwordStrength.label}</span>
            </div>
          </div>
        )}
        {hasError && (
          <span className="field-error"><AlertCircle size={14} /> {fieldErrors[name]}</span>
        )}
      </div>
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <div style={{ display: 'inline-flex', background: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--primary)' }}>
            <UserPlus size={32} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join CareLink as a Patient</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2">
            {renderField('name', 'Full Name', 'text', 'e.g. Karthik Reddy')}
            {renderField('email', 'Email Address', 'email', 'e.g. karthik@gmail.com')}
          </div>
          
          {renderField('password', 'Password', 'password', 'Min 6 chars, uppercase, lowercase, number')}

          <div className="grid grid-cols-2">
            {renderField('phone', 'Phone Number', 'tel', '10-digit number')}
            {renderField('dateOfBirth', 'Date of Birth', 'date')}
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ padding: '1rem' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p style={{ fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
