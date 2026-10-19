'use client';

import React from 'react';
import Link from 'next/link';

interface LicenseTableFiltersProps {
  total: number;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  onExportCSV: () => void;
}

export default function LicenseTableFilters({
  total,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onExportCSV,
}: LicenseTableFiltersProps) {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2 mb-md-3">
        <div>
          <h2 className="admin-page-title mb-0 fs-5">License Directory</h2>
          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
            {total} Active Driver Records
          </div>
        </div>
        <div className="d-flex gap-2">
          <button onClick={onExportCSV} className="btn btn-sm btn-outline-secondary d-none d-sm-inline-flex align-items-center gap-1">
            <i className="fas fa-file-csv"></i>
            <span>Export CSV</span>
          </button>
          <Link href="/something/licenses/new" className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-3 fw-semibold rounded-pill shadow-sm">
            <i className="fas fa-plus"></i>
            <span>Add New</span>
          </Link>
        </div>
      </div>

      <div className="admin-card p-2 p-md-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by License #, Name, Office..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearch('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-12 col-md-6 d-flex gap-1 overflow-x-auto justify-content-md-end pb-1 pb-md-0 no-scrollbar">
            {['ALL', 'VALID', 'EXPIRED', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm px-2 py-1 ${
                  statusFilter === st ? 'btn-success fw-bold' : 'btn-outline-secondary'
                }`}
                style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
