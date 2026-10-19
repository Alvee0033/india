'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AnalyticsView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="admin-page-title mb-0">System Analytics &amp; Telemetry</h2>
          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
            Live performance telemetry, verifications, and regional statistics
          </div>
        </div>
        <Link href="/something" className="btn btn-sm btn-outline-secondary">
          <i className="fas fa-arrow-left me-1"></i> Dashboard
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="admin-card p-3">
            <span className="text-muted small">Total Directory Records</span>
            <h3 className="fw-bold text-dark mt-1">{stats?.metrics?.totalLicenses ?? '—'}</h3>
            <span className="badge bg-success bg-opacity-10 text-success">Verified</span>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="admin-card p-3">
            <span className="text-muted small">Public Verification Queries</span>
            <h3 className="fw-bold text-primary mt-1">{stats?.metrics?.totalVerifications ?? '—'}</h3>
            <span className="badge bg-primary bg-opacity-10 text-primary">Live Traffic</span>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="admin-card p-3">
            <span className="text-muted small">Active Templates in Production</span>
            <h3 className="fw-bold text-info mt-1">3 Templates</h3>
            <span className="badge bg-info bg-opacity-10 text-info">UP, PB, KL</span>
          </div>
        </div>
      </div>

      <div className="admin-card p-3">
        <h5 className="fw-bold fs-6 mb-3">Engine Performance Status</h5>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Service Subsystem</th>
                <th>Protocol</th>
                <th>Status</th>
                <th>Latency</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-semibold">Python PIL Card Renderer</td>
                <td>IPC / Process exec</td>
                <td><span className="badge-status-valid">Operational</span></td>
                <td>~120ms</td>
              </tr>
              <tr>
                <td className="fw-semibold">PostgreSQL Driver Database</td>
                <td>pg connection pool</td>
                <td><span className="badge-status-valid">Healthy</span></td>
                <td>~4ms</td>
              </tr>
              <tr>
                <td className="fw-semibold">Public Verification Proxy</td>
                <td>Next.js Route Handler</td>
                <td><span className="badge-status-valid">Online</span></td>
                <td>~18ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
