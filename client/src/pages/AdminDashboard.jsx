import React, { useState, useEffect } from 'react';
import API from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userSort, setUserSort] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');

  // Add store form
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '' });

  const loadAll = async () => {
    try {
      const [statsRes, usersRes, storesRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get(`/admin/users?search=${userSearch}&role=${roleFilter}&sortBy=${userSort}&sortOrder=${userSortOrder}`),
        API.get('/admin/stores'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAll();
  }, [userSearch, roleFilter, userSort, userSortOrder]);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/stores', newStore);
      setNewStore({ name: '', email: '', address: '' });
      loadAll();
      alert('Store created successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create store');
    }
  };

  return (
    <div style={{ padding: 25, maxWidth: 1050, margin: 'auto' }}>
      <h2>System Administrator Dashboard</h2>

      {/* Overview Stat Counters */}
      <div style={{ display: 'flex', gap: 15, marginBottom: 25 }}>
        <div style={{ flex: 1, padding: 15, background: '#e3f2fd', borderRadius: 6 }}>
          <h4>Total Users</h4>
          <h2 style={{ margin: '8px 0 0' }}>{stats.totalUsers}</h2>
        </div>
        <div style={{ flex: 1, padding: 15, background: '#e8f5e9', borderRadius: 6 }}>
          <h4>Total Stores</h4>
          <h2 style={{ margin: '8px 0 0' }}>{stats.totalStores}</h2>
        </div>
        <div style={{ flex: 1, padding: 15, background: '#fff3e0', borderRadius: 6 }}>
          <h4>Total Ratings</h4>
          <h2 style={{ margin: '8px 0 0' }}>{stats.totalRatings}</h2>
        </div>
      </div>

      {/* Add New Store */}
      <div style={{ border: '1px solid #ccc', padding: 15, borderRadius: 6, marginBottom: 25 }}>
        <h3>Add New Store</h3>
        <form onSubmit={handleCreateStore} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10 }}>
          <input
            placeholder="Store Name (20-60 chars)"
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            required
            style={{ padding: 8 }}
          />
          <input
            placeholder="Store Email"
            type="email"
            value={newStore.email}
            onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
            required
            style={{ padding: 8 }}
          />
          <input
            placeholder="Store Address (max 400 chars)"
            value={newStore.address}
            onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
            required
            style={{ padding: 8 }}
          />
          <button type="submit" style={{ padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Add Store
          </button>
        </form>
      </div>

      {/* Users Table */}
      <h3>Platform Users</h3>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input
          placeholder="Filter users by name, email, or address..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: 8 }}>
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="NORMAL_USER">NORMAL_USER</option>
          <option value="STORE_OWNER">STORE_OWNER</option>
        </select>
      </div>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 35 }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th onClick={() => { setUserSort('name'); setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc'); }} style={{ cursor: 'pointer' }}>
              Name {userSort === 'name' ? (userSortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => { setUserSort('email'); setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc'); }} style={{ cursor: 'pointer' }}>
              Email {userSort === 'email' ? (userSortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Address</th>
            <th>Role</th>
            <th>Store Rating (if Store Owner)</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.address}</td>
              <td>{u.role}</td>
              <td>{u.role === 'STORE_OWNER' ? (u.rating ? `⭐ ${u.rating}` : 'No ratings yet') : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Stores List */}
      <h3>Platform Stores</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th>Store Name</th>
            <th>Store Email</th>
            <th>Address</th>
            <th>Overall Rating</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.address}</td>
              <td>⭐ {s.rating} / 5</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}