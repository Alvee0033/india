'use client';

import React, { useState } from 'react';

interface AdminTopbarProps {
  onLogout?: () => void;
  navLinks?: { href: string; label: string; icon: string }[];
  pathname?: string;
}

export default function AdminTopbar({ onLogout, navLinks = [], pathname = '' }: AdminTopbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (url: string) => {
    setMobileMenuOpen(false);
    window.location.href = url;
  };

  return (
    <>
      <header
        className="admin-topbar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1040,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div className="d-flex align-items-center gap-2">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="d-lg-none btn btn-sm p-1 px-2 border-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '1.1rem',
              borderRadius: '6px',
            }}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>

          <div
            className="d-flex align-items-center gap-2"
            onClick={() => handleNav('/something')}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-2 bg-success text-white shadow-sm"
              style={{ width: 30, height: 30, fontSize: '0.9rem' }}
            >
              <i className="fas fa-shield-halved"></i>
            </div>
            <span className="fw-bold fs-6 text-dark">DLIMS</span>
          </div>
          <span className="status-pill online d-none d-sm-inline-flex">Online</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={() => handleNav('/something/licenses/new')}
            className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-3 fw-semibold rounded-pill"
            style={{ fontSize: '0.8rem' }}
          >
            <i className="fas fa-plus"></i>
            <span>New License</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="btn btn-sm btn-outline-danger py-1 px-2 rounded"
              title="Logout"
              style={{ fontSize: '0.8rem' }}
            >
              <i className="fas fa-right-from-bracket"></i>
            </button>
          )}
        </div>
      </header>

      {/* Slide-down mobile drawer menu */}
      {mobileMenuOpen && (
        <div
          className="d-lg-none bg-dark text-white border-bottom border-secondary border-opacity-25 shadow-lg position-sticky"
          style={{ top: '60px', zIndex: 1035 }}
        >
          <div className="p-3 d-flex flex-column gap-2">
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
                  className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-start border-0 ${
                    isActive ? 'bg-success text-white fw-bold' : 'text-light bg-secondary bg-opacity-25'
                  }`}
                  style={{ fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  <i className={`fas ${link.icon}`} style={{ width: 22 }}></i>
                  <span>{link.label}</span>
                </button>
              );
            })}

            <div className="border-top border-secondary border-opacity-25 my-1" />

            <button
              type="button"
              onClick={() => handleNav('/something/templates')}
              className="d-flex align-items-center gap-3 px-3 py-2 rounded text-start border-0 text-info bg-secondary bg-opacity-10"
              style={{ fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <i className="fas fa-layer-group" style={{ width: 22 }}></i>
              <span>Card Templates</span>
            </button>
            <button
              type="button"
              onClick={() => handleNav('/something/analytics')}
              className="d-flex align-items-center gap-3 px-3 py-2 rounded text-start border-0 text-warning bg-secondary bg-opacity-10"
              style={{ fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <i className="fas fa-chart-line" style={{ width: 22 }}></i>
              <span>Analytics &amp; Telemetry</span>
            </button>
            <button
              type="button"
              onClick={() => handleNav('/something/logs')}
              className="d-flex align-items-center gap-3 px-3 py-2 rounded text-start border-0 text-light bg-secondary bg-opacity-10"
              style={{ fontSize: '0.9rem', cursor: 'pointer' }}
            >
              <i className="fas fa-list-check" style={{ width: 22 }}></i>
              <span>Verification Logs</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="d-flex align-items-center gap-3 px-3 py-2 rounded text-start border-0 text-danger bg-danger bg-opacity-10 mt-1"
                style={{ fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <i className="fas fa-right-from-bracket" style={{ width: 22 }}></i>
                <span>Sign Out Console</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
