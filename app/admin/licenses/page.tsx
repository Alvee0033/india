'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface LicenseRecord {
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
  qr_data?: string;
  created_at: string;
}

export default function LicenseDirectoryPage() {
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLicense, setSelectedLicense] = useState<LicenseRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal Card Preview & Download states
  const [modalCardUri, setModalCardUri] = useState<string | null>(null);
  const [modalCardLoading, setModalCardLoading] = useState<boolean>(false);
  const [modalCardError, setModalCardError] = useState<string | null>(null);
  const [modalDownloading, setModalDownloading] = useState<boolean>(false);
  const [modalDownloadingPdf, setModalDownloadingPdf] = useState<boolean>(false);
  const modalAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (modalAbortRef.current) {
        modalAbortRef.current.abort();
      }
    };
  }, []);

  const closeModal = () => {
    if (modalAbortRef.current) {
      modalAbortRef.current.abort();
      modalAbortRef.current = null;
    }
    setSelectedLicense(null);
    setModalCardUri(null);
    setModalCardError(null);
    setModalCardLoading(false);
  };

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
      params.append('limit', '100');

      const res = await fetch(`/api/admin/licenses?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLicenses(json.licenses || []);
        setTotal(json.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchLicenses, 200);
    return () => clearTimeout(delay);
  }, [search, statusFilter]);

  const handleDelete = async (id: string, name: string, licNo: string) => {
    if (!confirm(`Permanently delete record ${licNo} (${name})?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLicenses((prev) => prev.filter((l) => l.id !== id));
        setTotal((prev) => prev - 1);
        if (selectedLicense?.id === id) closeModal();
      }
    } catch {
      alert('Error deleting record');
    } finally {
      setDeletingId(null);
    }
  };

  const openDetailsModal = (lic: LicenseRecord) => {
    if (modalAbortRef.current) {
      modalAbortRef.current.abort();
    }
    const controller = new AbortController();
    modalAbortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    setSelectedLicense(lic);
    setModalCardUri(null);
    setModalCardError(null);
    setModalCardLoading(true);

    const t = lic.template || '1';
    const payloadData: Record<string, any> = {
      dl_no: lic.license_number || '',
      name: lic.name || '',
      relation: lic.relation || '',
      dob: lic.dob || '',
      blood_group: lic.blood_group || '',
      organ_donor: lic.organ_donor || 'N',
      issue_date: lic.issue_date || '',
      validity_nt: lic.validity_nt || '',
      validity_tr: lic.validity_tr || '',
      first_issue_date: lic.first_issue_date || lic.issue_date || '',
      auth_office: lic.auth_office || '',
      auth_title: lic.auth_title || 'Licensing Authority',
      emergency_contact: lic.emergency_contact || '',
      allowed_vehicles: lic.allowed_vehicles || 'MCWG, LMV',
      mcwg_code: 'MCWG',
      mcwg_issued_by: lic.mcwg_issued_by || '',
      mcwg_date: lic.mcwg_date || lic.issue_date || '',
      mcwg_category: lic.mcwg_category || 'NT',
      lmv_code: 'LMV',
      lmv_issued_by: lic.lmv_issued_by || '',
      lmv_date: lic.lmv_date || lic.issue_date || '',
      lmv_category: lic.lmv_category || 'NT',
    };

    if (t === '1') {
      payloadData.state = 'Uttar Pradesh';
      payloadData.state_code = 'UP';
      payloadData.address = lic.address || lic.address_1 || '';
    } else if (t === '2') {
      payloadData.address_1 = lic.address_1 || lic.address || '';
      payloadData.address_2 = lic.address_2 || '';
    } else if (t === '3') {
      payloadData.perm_address_1 = lic.perm_address_1 || lic.address_1 || lic.address || '';
      payloadData.perm_address_2 = lic.perm_address_2 || lic.address_2 || '';
      payloadData.perm_address_3 = lic.perm_address_3 || '';
      payloadData.pres_address_1 = lic.pres_address_1 || lic.address_1 || lic.address || '';
      payloadData.pres_address_2 = lic.pres_address_2 || lic.address_2 || '';
      payloadData.pres_address_3 = lic.pres_address_3 || '';
    }

    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        template: t,
        data: payloadData,
        photo_base64: lic.photo_url || null,
        holder_sig_base64: lic.signature_url || null,
        preview: true,
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        clearTimeout(timeoutId);
        if (json.success && json.imageBase64) {
          setModalCardUri(json.imageBase64);
        } else {
          setModalCardError(json.error || 'Failed to render card preview');
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') return;
        console.error('Modal card preview error:', err);
        setModalCardError('Error generating card preview');
      })
      .finally(() => {
        if (modalAbortRef.current === controller) {
          setModalCardLoading(false);
        }
      });
  };

  const handleModalDownload = async (format: 'png' | 'pdf' = 'png') => {
    if (!selectedLicense) return;
    if (format === 'pdf') setModalDownloadingPdf(true);
    else setModalDownloading(true);

    const t = selectedLicense.template || '1';
    const payloadData: Record<string, any> = {
      dl_no: selectedLicense.license_number || '',
      name: selectedLicense.name || '',
      relation: selectedLicense.relation || '',
      dob: selectedLicense.dob || '',
      blood_group: selectedLicense.blood_group || '',
      organ_donor: selectedLicense.organ_donor || 'N',
      issue_date: selectedLicense.issue_date || '',
      validity_nt: selectedLicense.validity_nt || '',
      validity_tr: selectedLicense.validity_tr || '',
      first_issue_date: selectedLicense.first_issue_date || selectedLicense.issue_date || '',
      auth_office: selectedLicense.auth_office || '',
      auth_title: selectedLicense.auth_title || 'Licensing Authority',
      emergency_contact: selectedLicense.emergency_contact || '',
      allowed_vehicles: selectedLicense.allowed_vehicles || 'MCWG, LMV',
      mcwg_code: 'MCWG',
      mcwg_issued_by: selectedLicense.mcwg_issued_by || '',
      mcwg_date: selectedLicense.mcwg_date || selectedLicense.issue_date || '',
      mcwg_category: selectedLicense.mcwg_category || 'NT',
      lmv_code: 'LMV',
      lmv_issued_by: selectedLicense.lmv_issued_by || '',
      lmv_date: selectedLicense.lmv_date || selectedLicense.issue_date || '',
      lmv_category: selectedLicense.lmv_category || 'NT',
    };

    if (t === '1') {
      payloadData.state = 'Uttar Pradesh';
      payloadData.state_code = 'UP';
      payloadData.address = selectedLicense.address || selectedLicense.address_1 || '';
    } else if (t === '2') {
      payloadData.address_1 = selectedLicense.address_1 || selectedLicense.address || '';
      payloadData.address_2 = selectedLicense.address_2 || '';
    } else if (t === '3') {
      payloadData.perm_address_1 = selectedLicense.perm_address_1 || selectedLicense.address_1 || selectedLicense.address || '';
      payloadData.perm_address_2 = selectedLicense.perm_address_2 || selectedLicense.address_2 || '';
      payloadData.perm_address_3 = selectedLicense.perm_address_3 || '';
      payloadData.pres_address_1 = selectedLicense.pres_address_1 || selectedLicense.address_1 || selectedLicense.address || '';
      payloadData.pres_address_2 = selectedLicense.pres_address_2 || selectedLicense.address_2 || '';
      payloadData.pres_address_3 = selectedLicense.pres_address_3 || '';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          template: t,
          data: payloadData,
          photo_base64: selectedLicense.photo_url || null,
          holder_sig_base64: selectedLicense.signature_url || null,
          download: true,
          format,
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to download card');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dlNo = (selectedLicense.license_number || 'DL').replace(/\s+/g, '_');
      a.href = url;
      a.download = `DL_${dlNo}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        alert('Download timed out. Please try again.');
      } else {
        alert(err.message || 'Download error');
      }
    } finally {
      if (format === 'pdf') setModalDownloadingPdf(false);
      else setModalDownloading(false);
    }
  };

  const exportCSV = () => {
    if (licenses.length === 0) return;
    const headers = ['License No', 'Name', 'Relation', 'DOB', 'Allowed Vehicles', 'Issue Date', 'Validity NT', 'Status', 'Auth Office'];
    const rows = licenses.map((l) => [
      `"${l.license_number}"`,
      `"${l.name}"`,
      `"${l.relation || ''}"`,
      `"${l.dob || ''}"`,
      `"${l.allowed_vehicles || ''}"`,
      `"${l.issue_date || ''}"`,
      `"${l.validity_nt || ''}"`,
      `"${l.status}"`,
      `"${l.auth_office || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `licenses_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2 mb-md-3">
        <div>
          <h2 className="admin-page-title mb-0 fs-5">License Directory</h2>
          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
            {total} Active Driver Records
          </div>
        </div>
        <div className="d-flex gap-2">
          <button onClick={exportCSV} className="btn btn-sm btn-outline-secondary d-none d-sm-inline-flex align-items-center gap-1">
            <i className="fas fa-file-csv"></i>
            <span>Export CSV</span>
          </button>
          <Link href="/admin/licenses/new" className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-3 fw-semibold rounded-pill shadow-sm">
            <i className="fas fa-plus"></i>
            <span>Add New</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
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

      {/* ── MOBILE CARD VIEW (< 768px) ── */}
      <div className="d-md-none">
        {loading ? (
          <div className="text-center py-4 text-muted">
            <div className="spinner-border spinner-border-sm text-success me-2" role="status" />
            Loading records…
          </div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-4 text-muted small admin-card p-4">
            No matching records found.
          </div>
        ) : (
          licenses.map((lic) => (
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
                  onClick={() => openDetailsModal(lic)}
                  className="btn btn-sm btn-outline-secondary flex-fill fw-semibold"
                  style={{ fontSize: '0.76rem' }}
                >
                  <i className="fas fa-eye me-1"></i> Details
                </button>
                <Link
                  href={`/admin/licenses/new?edit=${encodeURIComponent(lic.id)}&t=${lic.template || '1'}`}
                  className="btn btn-sm btn-primary flex-fill fw-semibold shadow-sm"
                  style={{ fontSize: '0.76rem' }}
                >
                  <i className="fas fa-pen-to-square me-1"></i> Edit
                </Link>
                <button
                  onClick={() => handleDelete(lic.id, lic.name, lic.license_number)}
                  disabled={deletingId === lic.id}
                  className="btn btn-sm btn-outline-danger px-3"
                  style={{ fontSize: '0.76rem' }}
                  title="Delete Record"
                >
                  <i className={`fas ${deletingId === lic.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── DESKTOP TABLE (>= 768px) ── */}
      <div className="admin-card d-none d-md-block">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>License #</th>
                <th>Template</th>
                <th>Validity (NT)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-success me-2" role="status" />
                    Loading records…
                  </td>
                </tr>
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => (
                  <tr key={lic.id}>
                    <td>
                      <div className="fw-bold text-dark">{lic.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {lic.relation ? `S/D/W: ${lic.relation}` : lic.auth_office || 'General'}
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
                    <td className="small font-monospace">{lic.validity_nt || '—'}</td>
                    <td>
                      <span className={lic.status === 'VALID' ? 'badge-status-valid' : lic.status === 'EXPIRED' ? 'badge-status-expired' : 'badge-status-suspended'}>
                        {lic.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => openDetailsModal(lic)}
                          className="btn btn-sm btn-outline-secondary py-1 px-2 fw-semibold"
                          style={{ fontSize: '0.74rem' }}
                          title="View Details & Card Preview"
                        >
                          <i className="fas fa-eye me-1"></i> Details
                        </button>
                        <Link
                          href={`/admin/licenses/new?edit=${encodeURIComponent(lic.id)}&t=${lic.template || '1'}`}
                          className="btn btn-sm btn-primary py-1 px-2 fw-semibold shadow-sm"
                          style={{ fontSize: '0.74rem' }}
                          title="Edit Record in Form"
                        >
                          <i className="fas fa-pen-to-square me-1"></i> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(lic.id, lic.name, lic.license_number)}
                          disabled={deletingId === lic.id}
                          className="btn btn-sm btn-outline-danger py-1 px-2"
                          style={{ fontSize: '0.74rem' }}
                          title="Delete Record"
                        >
                          <i className={`fas ${deletingId === lic.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Detail Modal with Live Card View & Export Options */}
      {selectedLicense && (
        <div
          className="modal show d-block"
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1100 }}
          onClick={closeModal}
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
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>

              <div className="modal-body p-3">
                {/* Driver Title Header */}
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

                {/* ── CARD PREVIEW SECTION ── */}
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

                  {/* Card Container */}
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
                          onClick={() => openDetailsModal(selectedLicense)}
                          className="btn btn-sm btn-outline-light"
                        >
                          <i className="fas fa-rotate me-1"></i> Retry Preview
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Quick Actions: Download PNG, Export PDF, Edit */}
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => handleModalDownload('png')}
                      disabled={modalDownloading || modalDownloadingPdf || modalCardLoading}
                      className="btn btn-sm btn-success flex-fill d-flex align-items-center justify-content-center gap-1 py-1 fw-semibold shadow-sm"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className={`fas ${modalDownloading ? 'fa-spinner fa-spin' : 'fa-file-image'}`}></i>
                      <span>{modalDownloading ? 'Exporting…' : 'Download PNG'}</span>
                    </button>
                    <button
                      onClick={() => handleModalDownload('pdf')}
                      disabled={modalDownloading || modalDownloadingPdf || modalCardLoading}
                      className="btn btn-sm btn-danger flex-fill d-flex align-items-center justify-content-center gap-1 py-1 fw-semibold shadow-sm"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className={`fas ${modalDownloadingPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                      <span>{modalDownloadingPdf ? 'Exporting…' : 'Export PDF'}</span>
                    </button>
                    <Link
                      href={`/admin/licenses/new?edit=${encodeURIComponent(selectedLicense.id)}&t=${selectedLicense.template || '1'}`}
                      className="btn btn-sm btn-primary flex-fill d-flex align-items-center justify-content-center gap-1 py-1 fw-semibold shadow-sm"
                      style={{ fontSize: '0.78rem' }}
                    >
                      <i className="fas fa-pen-to-square"></i>
                      <span>Edit Record</span>
                    </Link>
                  </div>
                </div>

                {/* ── DRIVER DETAILS PROFILE GRID ── */}
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
                  href={`/admin/licenses/new?edit=${encodeURIComponent(selectedLicense.id)}&t=${selectedLicense.template || '1'}`}
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-semibold shadow-sm"
                >
                  <i className="fas fa-pen-to-square"></i>
                  <span>Edit in Form</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

