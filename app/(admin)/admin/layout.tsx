'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const navLinks = [
    { href: '/admin', label: 'Dashboard', desktopLabel: 'Dashboard', icon: 'fa-chart-pie' },
    { href: '/admin/licenses', label: 'Directory', desktopLabel: 'Directory', icon: 'fa-address-card' },
    { href: '/admin/licenses/new', label: 'Generator', desktopLabel: 'Card Generator', icon: 'fa-circle-plus', isAdd: true },
    { href: '/admin/settings', label: 'Settings', desktopLabel: 'Settings', icon: 'fa-gear' },
  ];

  return (
    <div className="admin-body">
      {/* Desktop Left Sidebar (>= 992px) */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-logo-badge">
            <i className="fas fa-shield-halved"></i>
          </div>
          <div>
            <div className="admin-brand-title">DLIMS Engine</div>
            <div className="admin-brand-subtitle">License Control Portal</div>
          </div>
        </div>

        <div className="admin-nav-links">
          {navLinks.map((link) => {
            const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <i className={`fas ${link.icon}`}></i>
                <span>{link.desktopLabel || link.label}</span>
              </Link>
            );
          })}

          <div className="my-3 border-top border-secondary border-opacity-25" />

          <Link href="/admin/licenses/new" className="admin-nav-item text-success">
            <i className="fas fa-id-card"></i>
            <span>3-Template Generator</span>
          </Link>
        </div>

        <div className="admin-sidebar-footer d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div
              className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
              style={{ width: 32, height: 32, fontSize: '0.8rem' }}
            >
              A
            </div>
            <div className="text-truncate">
              <div className="text-white text-truncate fw-semibold" style={{ fontSize: '0.8rem' }}>
                Administrator
              </div>
              <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                Local Console
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: '16px', padding: '4px 8px' }}
          >
            <i className="fas fa-right-from-bracket"></i>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="d-flex align-items-center gap-2">
            <div className="d-lg-none d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-2 bg-success text-white shadow-sm"
                style={{ width: 28, height: 28, fontSize: '0.85rem' }}
              >
                <i className="fas fa-shield-halved"></i>
              </div>
              <span className="fw-bold fs-6 text-dark">DLIMS</span>
            </div>
            <span className="status-pill online">Engine Ready</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link
              href="/admin/licenses/new"
              className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-3 fw-semibold rounded-pill"
              style={{ fontSize: '0.78rem' }}
            >
              <i className="fas fa-plus"></i>
              <span className="d-none d-sm-inline">New License Card</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="admin-content">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="admin-mobile-nav">
        {navLinks.map((link) => {
          const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={`mobile-nav-link ${isActive ? 'active' : ''} ${link.isAdd ? 'mobile-nav-add' : ''}`}
            >
              <i className={`fas ${link.icon}`}></i>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
