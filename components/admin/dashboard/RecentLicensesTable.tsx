'use client';

import React from 'react';
import Link from 'next/link';

interface RecentLicense {
  id: string;
  license_number: string;
  name: string;
  template?: string;
  allowed_vehicles: string;
  status: string;
  created_at: string;
}

export default function RecentLicensesTable({ recentLicenses }: { recentLicenses: RecentLicense[] }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-address-card text-success"></i>
          <h3 className="admin-card-title">Recent Registrations</h3>
        </div>
        <Link href="/something/licenses" className="btn btn-sm btn-outline-primary py-1 px-2" style={{ fontSize: '0.75rem' }}>
          All Directory
        </Link>
      </div>

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
                      href={`/something/licenses?search=${encodeURIComponent(lic.license_number)}`}
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
  );
}
