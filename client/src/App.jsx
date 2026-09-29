import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StoreList from './pages/StoreList';
import OwnerDashboard from './pages/OwnerDashboard';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <header style={{ background: '#222', color: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Store Rating Portal</h3>
        <nav style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
          {user ? (
            <>
              <span>{user.name} ({user.role})</span>
              <button onClick={logout} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/stores" element={user?.role === 'NORMAL_USER' || user?.role === 'ADMIN' ? <StoreList /> : <Navigate to="/login" />} />
          <Route path="/owner" element={user?.role === 'STORE_OWNER' ? <OwnerDashboard /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : user.role === 'STORE_OWNER' ? '/owner' : '/stores') : '/login'} />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}