'use client';

import React from 'react';
import Link from 'next/link';

export interface LicenseRecord {
  id: string;
  license_number: string;
  template?: string;
  name: string;
  relation?: string;
  dob?: string;
  blood_group?: string;
  organ_donor?: string;
  issue_date: string;
  validity_nt: string;
  validity_tr?: string;
  first_issue_date?: string;
  status: 'VALID' | 'EXPIRED' | 'SUSPENDED';
  address?: string;
  address_1?: string;
  address_2?: string;
  perm_address_1?: string;
  perm_address_2?: string;
  perm_address_3?: string;
  pres_address_1?: string;
  pres_address_2?: string;
  pres_address_3?: string;
  auth_office?: string;
  auth_title?: string;
  emergency_contact?: string;
  allowed_vehicles?: string;
  mcwg_issued_by?: string;
  mcwg_date?: string;
  mcwg_category?: string;
  lmv_issued_by?: string;
  lmv_date?: string;
  lmv_category?: string;
  photo_url?: string;
  signature_url?: string;
  auth_signature_url?: string;
  qr_data?: string;
  created_at: string;
}

interface LicenseDetailModalProps {
  selectedLicense: LicenseRecord | null;
  modalCardLoading: boolean;
  modalCardUri: string | null;
  modalCardError: string | null;
  modalDownloading: boolean;
  modalDownloadingPdf: boolean;
  onClose: () => void;
  onRetryPreview: (lic: LicenseRecord) => void;
  onDownload: (format: 'png' | 'pdf') => void;
}

export default function LicenseDetailModal({
  selectedLicense,
  modalCardLoading,
  modalCardUri,
  modalCardError,
  modalDownloading,
  modalDownloadingPdf,
  onClose,
  onRetryPreview,
  onDownload,
}: LicenseDetailModalProps) {
  if (!selectedLicense) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header border-bottom py-2 px-3 bg-light">
            <div className="d-flex align-items-center gap-2">
              <i className="fas fa-id-card text-success"></i>
              <h5 className="modal-title fs-6 fw-bold text-dark mb-0">Driver Record &amp; Card View</h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
              <div>
                <h4 className="fw-bold mb-0 text-dark fs-5">{selectedLicense.name}</h4>
                <span className="font-monospace text-muted small">{selectedLicense.license_number}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-secondary bg-opacity-10 text-dark border">
                  Template {selectedLicense.template || '1'}
                </span>
                <span className={selectedLicense.status === 'VALID' ? 'badge-status-valid' : 'badge-status-expired'}>
                  {selectedLicense.status}
                </span>
              </div>
            </div>

            {/* CARD PREVIEW SECTION */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>
                  <i className="fas fa-image me-1 text-primary"></i> Generated Card Preview
                </span>
                {modalCardLoading && (
                  <span className="badge bg-warning bg-opacity-10 text-warning small">
                    <i className="fas fa-spinner fa-spin me-1"></i> Rendering…
                  </span>
                )}
              </div>

              <div
                className="position-relative border rounded-3 bg-dark d-flex align-items-center justify-content-center overflow-hidden p-2 text-center"
                style={{ minHeight: 240, maxHeight: 420 }}
              >
                {modalCardLoading && (
                  <div className="text-white py-4">
                    <div className="spinner-border text-success mb-2" role="status"></div>
                    <p className="small mb-0">Rendering High-Res Driving Licence Card…</p>
                  </div>
                )}

                {!modalCardLoading && modalCardUri && (
                  <img
                    src={modalCardUri}
                    alt="License Card"
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: 380, width: '100%', objectFit: 'contain' }}
                  />
                )}

                {!modalCardLoading && !modalCardUri && (
                  <div className="text-danger py-4">
                    <i className="fas fa-triangle-exclamation fa-2x mb-2 opacity-50"></i>
                    <p className="small mb-2">{modalCardError || 'Could not load card preview.'}</p>
                    <button
                      type="button"
                      onClick={() => onRetryPreview(selectedLicense)}
                      className="btn btn-sm btn-outline-light"
                    >
                      <i className="fas fa-rotate me-1"></i> Retry Preview
                    </button>
                  </div>
                )}
              </div>

              <div className="d-flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => onDownload('png')}
                  disabled={modalDownloading || modalDownloadingPdf || modalCardLoading}
                  className="btn btn-sm btn-success flex-fill d-flex align-items-center justify-content-center gap-1 py-1 fw-semibold shadow-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <i className={`fas ${modalDownloading ? 'fa-spinner fa-spin' : 'fa-file-image'}`}></i>
                  <span>{modalDownloading ? 'Exporting…' : 'Download PNG'}</span>
                </button>
                <button
                  onClick={() => onDownload('pdf')}
                  disabled={modalDownloading || modalDownloadingPdf || modalCardLoading}
                  className="btn btn-sm btn-danger flex-fill d-flex align-items-center justify-content-center gap-1 py-1 fw-semibold shadow-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <i className={`fas ${modalDownloadingPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                  <span>{modalDownloadingPdf ? 'Exporting…' : 'Export PDF'}</span>
                </button>
                <Link
                  href={`/something/licenses/new?edit=${encodeURIComponent(selectedLicense.id)}&t=${selectedLicense.template || '1'}`}
                  className="btn btn-sm btn-primary flex-fill d-flex align-items-center justify-content-center gap-1 py-1 fw-semibold shadow-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <i className="fas fa-pen-to-square"></i>
                  <span>Edit Record</span>
                </Link>
              </div>
            </div>

            {/* DRIVER DETAILS PROFILE GRID */}
            <div className="border rounded-3 p-3 bg-light">
              <h6 className="fw-bold small text-secondary text-uppercase mb-2" style={{ fontSize: '0.72rem' }}>
                <i className="fas fa-address-card me-1 text-primary"></i> Profile Information
              </h6>
              <div className="row g-2 small">
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>GUARDIAN / RELATION</span>
                  <span className="fw-semibold text-dark">{selectedLicense.relation || '—'}</span>
                </div>
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>DATE OF BIRTH</span>
                  <span className="font-monospace text-dark">{selectedLicense.dob || '—'}</span>
                </div>
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>BLOOD GROUP</span>
                  <span className="fw-semibold text-dark">{selectedLicense.blood_group || '—'}</span>
                </div>
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>ORGAN DONOR</span>
                  <span className="fw-semibold text-dark">{selectedLicense.organ_donor || 'NO'}</span>
                </div>
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>ISSUE DATE</span>
                  <span className="font-monospace text-dark">{selectedLicense.issue_date || '—'}</span>
                </div>
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>VALIDITY (NT)</span>
                  <span className="font-monospace text-dark">{selectedLicense.validity_nt || '—'}</span>
                </div>
                {selectedLicense.validity_tr && (
                  <div className="col-6 col-md-4">
                    <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>VALIDITY (TR)</span>
                    <span className="font-monospace text-dark">{selectedLicense.validity_tr}</span>
                  </div>
                )}
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>VEHICLE CLASSES</span>
                  <span className="fw-semibold text-dark">{selectedLicense.allowed_vehicles || 'MCWG, LMV'}</span>
                </div>
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>RTO OFFICE</span>
                  <span className="fw-semibold text-dark">{selectedLicense.auth_office || '—'}</span>
                </div>
                <div className="col-12">
                  <span className="text-muted d-block" style={{ fontSize: '0.68rem' }}>ADDRESS</span>
                  <span className="fw-normal text-dark">
                    {selectedLicense.address ||
                      [selectedLicense.address_1, selectedLicense.address_2].filter(Boolean).join(', ') ||
                      [selectedLicense.perm_address_1, selectedLicense.perm_address_2, selectedLicense.perm_address_3].filter(Boolean).join(', ') ||
                      '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top py-2 px-3 d-flex justify-content-between align-items-center bg-light">
            <Link
              href={`/something/licenses/new?edit=${encodeURIComponent(selectedLicense.id)}&t=${selectedLicense.template || '1'}`}
              className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-semibold shadow-sm"
            >
              <i className="fas fa-pen-to-square"></i>
              <span>Edit in Form</span>
            </Link>
            <button type="button" className="btn btn-sm btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
