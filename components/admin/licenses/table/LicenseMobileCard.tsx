'use client';

import React from 'react';
import Link from 'next/link';
import { LicenseRecord } from '../modal/LicenseDetailModal';

interface LicenseMobileCardProps {
  lic: LicenseRecord;
  deletingId: string | null;
  onOpenDetails: (lic: LicenseRecord) => void;
  onDelete: (id: string, name: string, licNo: string) => void;
}

export default function LicenseMobileCard({
  lic,
  deletingId,
  onOpenDetails,
  onDelete,
}: LicenseMobileCardProps) {
  return (
    <div key={lic.id} className="mobile-license-card">
      <div className="d-flex justify-content-between align-items-start mb-1">
        <div>
          <div className="fw-bold fs-6 text-dark">{lic.name}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
            {lic.relation ? `S/D/W: ${lic.relation}` : lic.auth_office || 'General'}
          </div>
        </div>
        <span className={lic.status === 'VALID' ? 'badge-status-valid' : lic.status === 'EXPIRED' ? 'badge-status-expired' : 'badge-status-suspended'}>
          {lic.status}
        </span>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 my-2 pb-1 border-bottom">
        <span className="badge bg-secondary bg-opacity-10 text-dark font-monospace" style={{ fontSize: '0.72rem' }}>
          {lic.license_number}
        </span>
        <span className="badge bg-light text-muted border" style={{ fontSize: '0.68rem' }}>
          Template {lic.template || '1'}
        </span>
        <span className="text-muted small ms-auto" style={{ fontSize: '0.7rem' }}>
          Exp: {lic.validity_nt || '—'}
        </span>
      </div>

      <div className="d-flex gap-2 pt-1">
        <button
          onClick={() => onOpenDetails(lic)}
          className="btn btn-sm btn-outline-secondary flex-fill fw-semibold"
          style={{ fontSize: '0.76rem' }}
        >
          <i className="fas fa-eye me-1"></i> Details
        </button>
        <Link
          href={`/something/licenses/new?edit=${encodeURIComponent(lic.id)}&t=${lic.template || '1'}`}
          className="btn btn-sm btn-primary flex-fill fw-semibold shadow-sm"
          style={{ fontSize: '0.76rem' }}
        >
          <i className="fas fa-pen-to-square me-1"></i> Edit
        </Link>
        <button
          onClick={() => onDelete(lic.id, lic.name, lic.license_number)}
          disabled={deletingId === lic.id}
          className="btn btn-sm btn-outline-danger px-3"
          style={{ fontSize: '0.76rem' }}
          title="Delete Record"
        >
          <i className={`fas ${deletingId === lic.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
        </button>
      </div>
    </div>
  );
}
