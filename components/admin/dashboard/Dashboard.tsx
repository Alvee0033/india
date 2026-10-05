'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  metrics: {
    totalLicenses: number;
    validLicenses: number;
    expiredLicenses: number;
    suspendedLicenses: number;
    totalVerifications: number;
  };
  categories: {
    motorCycleCount: number;
    motorCarCount: number;
    ltvCount: number;
    htvCount: number;
  };
  recentLicenses: Array<{
    id: string;
    license_number: string;
    name: string;
    template?: string;
    allowed_vehicles: string;
    status: string;
    created_at: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Telemetry error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const { metrics, categories, recentLicenses } = data || {
    metrics: { totalLicenses: 0, validLicenses: 0, expiredLicenses: 0, suspendedLicenses: 0, totalVerifications: 0 },
    categories: { motorCycleCount: 0, motorCarCount: 0, ltvCount: 0, htvCount: 0 },
    recentLicenses: [],
  };

  return (
    <div className="container-fluid p-0">
      {/* Mobile-First Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="admin-page-title mb-0">Authority Dashboard</h2>
          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
            DL Central Management &amp; Record Telemetry
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href="/admin/licenses/new" className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-3 fw-semibold rounded-pill">
            <i className="fas fa-plus me-1"></i>
            <span>Generate Card</span>
          </Link>
          <button onClick={fetchStats} className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: 34, height: 34 }} title="Refresh">
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* 2x2 Metric Grid on Mobile, 4-col on Desktop */}
      <div className="row g-2 g-md-3 mb-3">
        <div className="col-6 col-lg-3">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Total</span>
              <div className="metric-icon-box bg-primary bg-opacity-10 text-primary">
                <i className="fas fa-id-card"></i>
              </div>
            </div>
            <div className="metric-value">{metrics.totalLicenses}</div>
            <div className="metric-subtitle">Active Directory</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Valid</span>
              <div className="metric-icon-box bg-success bg-opacity-10 text-success">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <div className="metric-value text-success">{metrics.validLicenses}</div>
            <div className="metric-subtitle">Authorized Drivers</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Expired</span>
              <div className="metric-icon-box bg-danger bg-opacity-10 text-danger">
                <i className="fas fa-calendar-xmark"></i>
              </div>
            </div>
            <div className="metric-value text-danger">{metrics.expiredLicenses}</div>
            <div className="metric-subtitle">Requires Renewal</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Queries</span>
              <div className="metric-icon-box bg-info bg-opacity-10 text-info">
                <i className="fas fa-magnifying-glass"></i>
              </div>
            </div>
            <div className="metric-value text-info">{metrics.totalVerifications}</div>
            <div className="metric-subtitle">System Queries</div>
          </div>
        </div>
      </div>

      {/* Category Distribution Bar */}
      <div className="admin-card p-2 p-md-3 mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="fw-bold small text-secondary">VEHICLE CLASSIFICATIONS</span>
        </div>
        <div className="row g-2">
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
              <i className="fas fa-motorcycle text-primary"></i>
              <div>
                <div className="fw-bold fs-6">{categories.motorCycleCount}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Motor Cycle (MCWG)</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
              <i className="fas fa-car text-success"></i>
              <div>
                <div className="fw-bold fs-6">{categories.motorCarCount}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Motor Car (LMV)</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
              <i className="fas fa-truck-pickup text-warning"></i>
              <div>
                <div className="fw-bold fs-6">{categories.ltvCount}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Transport (TR)</div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
              <i className="fas fa-truck-moving text-danger"></i>
              <div>
                <div className="fw-bold fs-6">{categories.htvCount}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Heavy / Commercial</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Licenses Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="d-flex align-items-center gap-2">
            <i className="fas fa-address-card text-success"></i>
            <h3 className="admin-card-title">Recent Registrations</h3>
          </div>
          <Link href="/admin/licenses" className="btn btn-sm btn-outline-primary py-1 px-2" style={{ fontSize: '0.75rem' }}>
            All Directory
          </Link>
        </div>

        {/* Desktop Table for >= 768px */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>License #</th>
                <th>Template</th>
                <th>Class</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentLicenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">No licenses found.</td>
                </tr>
              ) : (
                recentLicenses.map((lic) => (
                  <tr key={lic.id}>
                    <td className="fw-bold text-dark">{lic.name}</td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-dark font-monospace">
                        {lic.license_number}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-muted border">
                        Template {lic.template || '1'}
                      </span>
                    </td>
                    <td className="small">{lic.allowed_vehicles || 'MCWG, LMV'}</td>
                    <td>
                      <span className={lic.status === 'VALID' ? 'badge-status-valid' : lic.status === 'EXPIRED' ? 'badge-status-expired' : 'badge-status-suspended'}>
                        {lic.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/licenses?search=${encodeURIComponent(lic.license_number)}`}
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                        style={{ fontSize: '0.72rem' }}
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
