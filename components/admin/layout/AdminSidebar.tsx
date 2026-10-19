'use client';

import React from 'react';

interface NavLink {
  href: string;
  label: string;
  desktopLabel?: string;
  icon: string;
  isAdd?: boolean;
}

interface AdminSidebarProps {
  pathname: string;
  navLinks: NavLink[];
  onLogout: () => void;
}

export default function AdminSidebar({ pathname, navLinks, onLogout }: AdminSidebarProps) {
  const handleNav = (url: string) => {
    window.location.href = url;
  };

  return (
    <aside className="admin-sidebar">
      <div
        className="admin-sidebar-brand"
        onClick={() => handleNav('/something')}
        style={{ cursor: 'pointer' }}
      >
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
          const isActive =
            link.href === '/something'
              ? pathname === '/something'
              : pathname.startsWith(link.href);
          return (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNav(link.href)}
              className={`admin-nav-item border-0 w-100 text-start bg-transparent ${
                isActive ? 'active' : ''
              }`}
              style={{ cursor: 'pointer' }}
            >
              <i className={`fas ${link.icon}`}></i>
              <span>{link.desktopLabel || link.label}</span>
            </button>
          );
        })}

        <div className="my-3 border-top border-secondary border-opacity-25" />

        <button
          type="button"
          onClick={() => handleNav('/something/licenses/new')}
          className="admin-nav-item text-success border-0 w-100 text-start bg-transparent"
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-id-card"></i>
          <span>3-Template Generator</span>
        </button>
        <button
          type="button"
          onClick={() => handleNav('/something/templates')}
          className="admin-nav-item text-info border-0 w-100 text-start bg-transparent"
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-layer-group"></i>
          <span>Card Templates</span>
        </button>
        <button
          type="button"
          onClick={() => handleNav('/something/analytics')}
          className="admin-nav-item text-warning border-0 w-100 text-start bg-transparent"
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-chart-line"></i>
          <span>Analytics &amp; Telemetry</span>
        </button>
        <button
          type="button"
          onClick={() => handleNav('/something/logs')}
          className="admin-nav-item text-light border-0 w-100 text-start bg-transparent"
          style={{ cursor: 'pointer' }}
        >
          <i className="fas fa-list-check"></i>
          <span>Verification Logs</span>
        </button>
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
          onClick={onLogout}
          title="Logout"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#f87171',
            fontSize: '16px',
            padding: '4px 8px',
          }}
        >
          <i className="fas fa-right-from-bracket"></i>
        </button>
      </div>
    </aside>
  );
}
