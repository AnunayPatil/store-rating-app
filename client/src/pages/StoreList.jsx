import React, { useState, useEffect } from 'react';
import API from '../api';

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchStores = async () => {
    try {
      const res = await API.get(`/stores?search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      setStores(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const handleRate = async (storeId, rating) => {
    try {
      await API.post('/ratings', { storeId, rating });
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  return (
    <div style={{ padding: 25, maxWidth: 950, margin: 'auto' }}>
      <h2>Available Stores</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <input
          type="text"
          placeholder="Search by store name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
      </div>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>
              Store Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => toggleSort('address')} style={{ cursor: 'pointer' }}>
              Address {sortBy === 'address' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Overall Rating</th>
            <th>My Submitted Rating</th>
            <th>Rate / Modify</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.address}</td>
              <td>⭐ {s.overallRating} / 5</td>
              <td>{s.userRating ? `⭐ ${s.userRating}` : 'Not rated'}</td>
              <td>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(s.id, star)}
                    style={{
                      marginRight: 4,
                      padding: '4px 8px',
                      background: s.userRating === star ? '#ffc107' : '#e0e0e0',
                      border: '1px solid #ccc',
                      cursor: 'pointer',
                    }}
                  >
                    {star} ★
                  </button>
                ))}
              </td>
            </tr>
          ))}
          {stores.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>No stores found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}