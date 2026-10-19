'use client';

import React from 'react';
import Link from 'next/link';
import { LicenseRecord } from '../modal/LicenseDetailModal';

interface LicenseTableRowProps {
  lic: LicenseRecord;
  deletingId: string | null;
  onOpenDetails: (lic: LicenseRecord) => void;
  onDelete: (id: string, name: string, licNo: string) => void;
}

export default function LicenseTableRow({
  lic,
  deletingId,
  onOpenDetails,
  onDelete,
}: LicenseTableRowProps) {
  return (
    <tr key={lic.id}>
      <td>
        <div className="fw-bold text-dark">{lic.name}</div>
        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
          {lic.relation ? `S/D/W: ${lic.relation}` : lic.auth_office || 'General Authority'}
        </div>
      </td>
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
      <td>
        <span className={lic.status === 'VALID' ? 'badge-status-valid' : lic.status === 'EXPIRED' ? 'badge-status-expired' : 'badge-status-suspended'}>
          {lic.status}
        </span>
      </td>
      <td className="small font-monospace">{lic.validity_nt || '—'}</td>
      <td className="small text-muted">{lic.auth_office || '—'}</td>
      <td>
        <div className="d-flex align-items-center gap-1">
          <button
            onClick={() => onOpenDetails(lic)}
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            style={{ fontSize: '0.72rem' }}
            title="Inspect Details"
          >
            <i className="fas fa-eye me-1"></i> View
          </button>
          <Link
            href={`/something/licenses/new?edit=${encodeURIComponent(lic.id)}&t=${lic.template || '1'}`}
            className="btn btn-sm btn-outline-primary py-1 px-2"
            style={{ fontSize: '0.72rem' }}
            title="Edit Record in Form"
          >
            <i className="fas fa-pen-to-square me-1"></i> Edit
          </Link>
          <button
            onClick={() => onDelete(lic.id, lic.name, lic.license_number)}
            disabled={deletingId === lic.id}
            className="btn btn-sm btn-outline-danger py-1 px-2"
            style={{ fontSize: '0.72rem' }}
            title="Delete Record"
          >
            <i className={`fas ${deletingId === lic.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
          </button>
        </div>
      </td>
    </tr>
  );
}
