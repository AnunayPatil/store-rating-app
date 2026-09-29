import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { validateAuth } from '../utils';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validateAuth(form, true);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await API.post('/auth/register', form);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '40px auto', padding: 25, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Register Normal User</h2>
      {serverError && <div style={{ color: 'red', marginBottom: 12 }}>{serverError}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block' }}>Name (20–60 chars)</label>
          <input
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          {errors.name && <small style={{ color: 'red' }}>{errors.name}</small>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block' }}>Email</label>
          <input
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          {errors.email && <small style={{ color: 'red' }}>{errors.email}</small>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block' }}>Password (8-16 chars, 1 uppercase, 1 special)</label>
          <input
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {errors.password && <small style={{ color: 'red' }}>{errors.password}</small>}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block' }}>Address (max 400 chars)</label>
          <textarea
            rows="3"
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          {errors.address && <small style={{ color: 'red' }}>{errors.address}</small>}
        </div>
        <button style={{ width: '100%', padding: 10, background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} type="submit">
          Sign Up
        </button>
      </form>
      <p style={{ marginTop: 15, textAlign: 'center' }}>
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}