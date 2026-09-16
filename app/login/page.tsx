'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f3f4f6', fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: '8px', padding: '36px 32px',
        width: '100%', maxWidth: '360px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <h4 style={{ margin: '0 0 24px', fontWeight: 700, color: '#111', textAlign: 'center' }}>Admin Login</h4>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dlims.gov"
              required
              autoFocus
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '10px', background: '#21a3f0',
              color: '#fff', border: 'none', borderRadius: '6px',
              fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
