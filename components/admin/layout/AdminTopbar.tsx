'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminTopbar() {
  return (
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
          href="/something/licenses/new"
          className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-3 fw-semibold rounded-pill"
          style={{ fontSize: '0.78rem' }}
        >
          <i className="fas fa-plus"></i>
          <span className="d-none d-sm-inline">New License Card</span>
        </Link>
      </div>
    </header>
  );
}
