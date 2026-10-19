'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface AdminTopbarProps {
  onLogout?: () => void;
  navLinks?: { href: string; label: string; icon: string }[];
  pathname?: string;
}

export default function AdminTopbar({ onLogout, navLinks = [], pathname = '' }: AdminTopbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="admin-topbar">
        <div className="d-flex align-items-center gap-2">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="d-lg-none btn btn-sm btn-dark p-1 px-2 border-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{ background: '#1e293b', color: '#fff', fontSize: '1rem' }}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>

          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-2 bg-success text-white shadow-sm"
              style={{ width: 28, height: 28, fontSize: '0.85rem' }}
            >
              <i className="fas fa-shield-halved"></i>
            </div>
            <span className="fw-bold fs-6 text-dark">DLIMS</span>
          </div>
          <span className="status-pill online d-none d-sm-inline-flex">Engine Ready</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link
            href="/something/licenses/new"
            className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-2 px-sm-3 fw-semibold rounded-pill"
            style={{ fontSize: '0.78rem' }}
          >
            <i className="fas fa-plus"></i>
            <span className="d-none d-sm-inline">New License Card</span>
          </Link>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="btn btn-sm btn-outline-danger py-1 px-2 rounded"
              title="Logout"
              style={{ fontSize: '0.75rem' }}
            >
              <i className="fas fa-right-from-bracket"></i>
            </button>
          )}
        </div>
      </header>

      {/* Slide-down mobile drawer menu */}
      {mobileMenuOpen && (
        <div
          className="d-lg-none bg-dark text-white border-bottom border-secondary border-opacity-25 shadow-lg position-sticky top-60"
          style={{ zIndex: 1025 }}
        >
          <div className="p-3 d-flex flex-column gap-2">
            {navLinks.map((link) => {
              const isActive = link.href === '/something' ? pathname === '/something' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none ${
                    isActive ? 'bg-success text-white fw-bold' : 'text-light bg-secondary bg-opacity-25'
                  }`}
                  style={{ fontSize: '0.9rem' }}
                >
                  <i className={`fas ${link.icon}`} style={{ width: 20 }}></i>
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <div className="border-top border-secondary border-opacity-25 my-1" />
            
            <Link
              href="/something/templates"
              onClick={() => setMobileMenuOpen(false)}
              className="d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none text-info bg-secondary bg-opacity-10"
              style={{ fontSize: '0.85rem' }}
            >
              <i className="fas fa-layer-group" style={{ width: 20 }}></i>
              <span>Card Templates</span>
            </Link>
            <Link
              href="/something/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none text-warning bg-secondary bg-opacity-10"
              style={{ fontSize: '0.85rem' }}
            >
              <i className="fas fa-chart-line" style={{ width: 20 }}></i>
              <span>Analytics</span>
            </Link>
            <Link
              href="/something/logs"
              onClick={() => setMobileMenuOpen(false)}
              className="d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none text-light bg-secondary bg-opacity-10"
              style={{ fontSize: '0.85rem' }}
            >
              <i className="fas fa-list-check" style={{ width: 20 }}></i>
              <span>Verification Logs</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
