'use client';

import React, { useState, useEffect, useRef } from 'react';
import LicenseTableFilters from './table/LicenseTableFilters';
import LicenseTableRow from './table/LicenseTableRow';
import LicenseMobileCard from './table/LicenseMobileCard';
import LicenseDetailModal, { LicenseRecord } from './modal/LicenseDetailModal';

export default function LicenseTable() {
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

  const activeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (activeAbortRef.current) activeAbortRef.current.abort();
    };
  }, []);

  const closeModal = () => {
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
      activeAbortRef.current = null;
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
      if (search) params.set('search', search);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      params.set('limit', '100');

      const res = await fetch(`/api/admin/licenses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLicenses(data.licenses || []);
        setTotal(data.pagination?.total || (data.licenses || []).length);
      }
    } catch (err) {
      console.error('Failed to fetch licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchLicenses, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter]);

  const handleDelete = async (id: string, name: string, licNo: string) => {
    if (!confirm(`Permanently delete record ${licNo} (${name})?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLicenses((prev) => prev.filter((l) => l.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
        if (selectedLicense?.id === id) closeModal();
      } else {
        alert('Failed to delete license record.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error while deleting.');
    } finally {
      setDeletingId(null);
    }
  };

  const openDetailsModal = (lic: LicenseRecord) => {
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
    }
    const controller = new AbortController();
    activeAbortRef.current = controller;

    setSelectedLicense(lic);
    setModalCardUri(null);
    setModalCardError(null);
    setModalCardLoading(true);

    const t = lic.template || '1';
    const payloadData: Record<string, any> = {
      dl_no: lic.license_number || '',
      issue_date: lic.issue_date || '',
      validity_nt: lic.validity_nt || '',
      validity_tr: lic.validity_tr || '',
      first_issue_date: lic.first_issue_date || lic.issue_date || '',
      name: lic.name || '',
      dob: lic.dob || '',
      blood_group: lic.blood_group || '',
      organ_donor: lic.organ_donor || 'NO',
      relation: lic.relation || '',
      auth_title: lic.auth_title || 'Licensing Authority',
      auth_office: lic.auth_office || '',
      emergency_contact: lic.emergency_contact || '',
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

    fetch('/api/public/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        template: t,
        data: payloadData,
        photo_base64: lic.photo_url || null,
        holder_sig_base64: lic.signature_url || null,
        auth_sig_base64: lic.auth_signature_url || null,
        preview: true,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && json.imageBase64) {
          setModalCardUri(json.imageBase64);
        } else {
          setModalCardError(json.error || 'Failed to render card preview');
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Modal card preview error:', err);
        setModalCardError('Error generating card preview');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
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
      issue_date: selectedLicense.issue_date || '',
      validity_nt: selectedLicense.validity_nt || '',
      validity_tr: selectedLicense.validity_tr || '',
      first_issue_date: selectedLicense.first_issue_date || selectedLicense.issue_date || '',
      name: selectedLicense.name || '',
      dob: selectedLicense.dob || '',
      blood_group: selectedLicense.blood_group || '',
      organ_donor: selectedLicense.organ_donor || 'NO',
      relation: selectedLicense.relation || '',
      auth_title: selectedLicense.auth_title || 'Licensing Authority',
      auth_office: selectedLicense.auth_office || '',
      emergency_contact: selectedLicense.emergency_contact || '',
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

    try {
      const res = await fetch('/api/public/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: t,
          data: payloadData,
          photo_base64: selectedLicense.photo_url || null,
          holder_sig_base64: selectedLicense.signature_url || null,
          auth_sig_base64: selectedLicense.auth_signature_url || null,
          preview: false,
          download: true,
          format: format,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.success && json.imageBase64) {
        const link = document.createElement('a');
        link.href = json.imageBase64;
        const dlNo = (selectedLicense.license_number || 'DL').replace(/\s+/g, '_');
        link.download = `${dlNo}_Card.${format === 'pdf' ? 'pdf' : 'png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(json.error || 'Failed to download card');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Error downloading driving licence card.');
    } finally {
      if (format === 'pdf') setModalDownloadingPdf(false);
      else setModalDownloading(false);
    }
  };

  const exportCSV = () => {
    if (licenses.length === 0) return;
    const headers = ['License Number', 'Name', 'Relation', 'DOB', 'Blood Group', 'Issue Date', 'Validity NT', 'Status', 'Office'];
    const rows = licenses.map((l) => [
      `"${l.license_number}"`,
      `"${l.name}"`,
      `"${l.relation || ''}"`,
      `"${l.dob || ''}"`,
      `"${l.blood_group || ''}"`,
      `"${l.issue_date || ''}"`,
      `"${l.validity_nt || ''}"`,
      `"${l.status || ''}"`,
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
      <LicenseTableFilters
        total={total}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onExportCSV={exportCSV}
      />

      {/* MOBILE CARD VIEW (< 768px) */}
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
            <LicenseMobileCard
              key={lic.id}
              lic={lic}
              deletingId={deletingId}
              onOpenDetails={openDetailsModal}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* DESKTOP TABLE (>= 768px) */}
      <div className="admin-card d-none d-md-block">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>License #</th>
                <th>Template</th>
                <th>Status</th>
                <th>Validity (NT)</th>
                <th>RTO Office</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-success me-2" role="status" />
                    Loading records…
                  </td>
                </tr>
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => (
                  <LicenseTableRow
                    key={lic.id}
                    lic={lic}
                    deletingId={deletingId}
                    onOpenDetails={openDetailsModal}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LicenseDetailModal
        selectedLicense={selectedLicense}
        modalCardLoading={modalCardLoading}
        modalCardUri={modalCardUri}
        modalCardError={modalCardError}
        modalDownloading={modalDownloading}
        modalDownloadingPdf={modalDownloadingPdf}
        onClose={closeModal}
        onRetryPreview={openDetailsModal}
        onDownload={handleModalDownload}
      />
    </div>
  );
}
