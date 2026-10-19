'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import AdminMobileNav from '@/components/admin/layout/AdminMobileNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check actual auth status from server
    fetch('/api/admin/auth')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, [pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        router.refresh();
      } else {
        setLoginError(data.error || 'Invalid email or password.');
      }
    } catch {
      setLoginError('Network error connecting to authorization server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    router.push('/something');
    router.refresh();
  };

  const navLinks = [
    { href: '/something', label: 'Dashboard', desktopLabel: 'Dashboard', icon: 'fa-chart-pie' },
    { href: '/something/licenses', label: 'Directory', desktopLabel: 'Directory', icon: 'fa-address-card' },
    { href: '/something/licenses/new', label: 'Generator', desktopLabel: 'Card Generator', icon: 'fa-circle-plus', isAdd: true },
    { href: '/something/settings', label: 'Settings', desktopLabel: 'Settings', icon: 'fa-gear' },
  ];

  // 1. Loading check
  if (isAuthenticated === null) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a1726',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-info mb-3" style={{ width: 44, height: 44 }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8', letterSpacing: '0.5px' }}>
            Verifying Admin Authorization...
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render standalone login screen (no broken sidebars/navbars)
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a1726',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px',
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '36px 30px',
          width: '100%',
          maxWidth: '390px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '26px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '24px',
              marginBottom: '14px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
            }}>
              <i className="fas fa-shield-halved"></i>
            </div>
            <h4 style={{ margin: '0 0 6px', fontWeight: 800, color: '#0f172a', fontSize: '20px' }}>
              DLIMS Admin Console
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Enter administrator credentials to proceed
            </p>
          </div>

          {loginError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '11px 14px',
              marginBottom: '18px',
              color: '#dc2626',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
            }}>
              <i className="fas fa-circle-exclamation" style={{ flexShrink: 0 }}></i>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dlims.gov"
                required
                autoFocus
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '8px 14px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '8px 14px',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '46px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14.5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Authenticated: Render full application with topbar, sidebar, mobile nav
  return (
    <div className="admin-body">
      <AdminSidebar pathname={pathname} navLinks={navLinks} onLogout={handleLogout} />
      <div className="admin-main-wrapper">
        <AdminTopbar onLogout={handleLogout} navLinks={navLinks} pathname={pathname} />
        <main className="admin-content">{children}</main>
      </div>
      <AdminMobileNav pathname={pathname} navLinks={navLinks} />
    </div>
  );
}
