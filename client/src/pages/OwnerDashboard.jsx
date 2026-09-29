import React, { useState, useEffect } from 'react';
import API from '../api';

export default function OwnerDashboard() {
  const [data, setData] = useState({ storeName: '', overallRating: '0.0', raters: [] });

  useEffect(() => {
    API.get('/owner/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: 25, maxWidth: 850, margin: 'auto' }}>
      <h2>Store Owner Dashboard</h2>
      <div style={{ background: '#f8f9fa', padding: 20, border: '1px solid #ddd', borderRadius: 8, marginBottom: 25 }}>
        <h3>Store: {data.storeName}</h3>
        <p style={{ fontSize: 18 }}>Average Rating: <strong>⭐ {data.overallRating} / 5</strong></p>
      </div>

      <h4>Customer Ratings Received</h4>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f0f0f0' }}>
          <tr>
            <th>Customer Name</th>
            <th>Customer Email</th>
            <th>Rating Given</th>
          </tr>
        </thead>
        <tbody>
          {data.raters.map((r, idx) => (
            <tr key={idx}>
              <td>{r.userName}</td>
              <td>{r.email}</td>
              <td>⭐ {r.rating} / 5</td>
            </tr>
          ))}
          {data.raters.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: 15 }}>No reviews submitted yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}