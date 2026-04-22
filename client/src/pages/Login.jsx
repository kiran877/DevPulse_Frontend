import React from 'react';

export default function Login() {
  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'https://devpulse-frontend-kg5k.onrender.com'}/auth/github`;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Welcome to DevPulse</h1>
        <p>Real-time DORA metrics dashboard</p>
        <button
          onClick={handleLogin}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '20px' }}
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}
