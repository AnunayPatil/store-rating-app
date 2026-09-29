import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      onLogin(res.data);

      if (res.data.role === 'ADMIN') navigate('/admin');
      else if (res.data.role === 'STORE_OWNER') navigate('/owner');
      else navigate('/stores');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 25, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Sign In</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
          <input
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Password</label>
          <input
            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button style={{ width: '100%', padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} type="submit">
          Log In
        </button>
      </form>
      <p style={{ marginTop: 15, textAlign: 'center' }}>
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}