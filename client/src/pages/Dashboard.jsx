import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('devpulse_token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome to DevPulse! You are authenticated.</p>
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px' }}>
        Logout
      </button>
    </div>
  );
}
