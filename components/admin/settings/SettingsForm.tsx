'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Admin Credentials State
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [savingCreds, setSavingCreds] = useState<boolean>(false);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile');
      if (res.ok) {
        const json = await res.json();
        if (json.email) {
          setAdminEmail(json.email);
        }
      }
    } catch (err) {
      console.error('Failed to load admin profile:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAdminProfile();
  }, []);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredSuccess(null);
    setCredError(null);

    if (!currentPassword) {
      setCredError('Current password is required to authorize changes.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setCredError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setCredError('New password and confirmation do not match.');
        return;
      }
    }

    if (!newEmail && !newPassword) {
      setCredError('Please enter a new email or password to update.');
      return;
    }

    setSavingCreds(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to update credentials.');
      }

      setCredSuccess(json.message || 'Credentials updated successfully!');
      if (json.email) {
        setAdminEmail(json.email);
      }
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      setCredError(err.message || 'Error updating credentials.');
    } finally {
      setSavingCreds(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset directory to initial default records?')) return;
    setStatusMsg('Resetting…');
    try {
      const sample = [
        {
          license_number: 'PB35 20210005691',
          template: '2',
          name: 'JIBIN KUMAR P',
          relation: 'K M BABU',
          dob: '16-06-1995',
          blood_group: 'O- VE',
          issue_date: '14-06-2021',
          validity_nt: '13-06-2031',
          status: 'VALID',
          auth_office: 'RTO PATHANKOT',
          allowed_vehicles: 'MCWG, LMV',
        },
        {
          license_number: 'UP16 20180045921',
          template: '1',
          name: 'ADITYA SHARMA',
          relation: 'Rajesh Sharma',
          dob: '14-08-1996',
          blood_group: 'B+',
          issue_date: '24-05-2018',
          validity_nt: '13-08-2036',
          status: 'VALID',
          auth_office: 'UP16 NOIDA',
          allowed_vehicles: 'MCWG, LMV',
        },
        {
          license_number: 'KL55 20199185172',
          template: '3',
          name: 'JIBIN KUMAR PUTHALATH',
          relation: 'BABU KAVINISSERI MADATHIL',
          dob: '16-06-1995',
          blood_group: 'B+',
          issue_date: '06-12-2019',
          validity_nt: '05-12-2034',
          status: 'VALID',
          auth_office: 'THIRUVATHIRA',
          allowed_vehicles: 'MCWG, LMV',
        },
      ];

      for (const rec of sample) {
        await fetch('/api/admin/licenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rec),
        });
      }
      setStatusMsg('Records populated successfully!');
      fetchStats();
    } catch {
      setStatusMsg('Error resetting records.');
    }
  };

  return (
    <div className="container-fluid p-0 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="admin-page-title mb-0">System Settings</h2>
          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
            Account Security &amp; Application Configuration
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="alert alert-info py-2 px-3 small mb-3">
          {statusMsg}
        </div>
      )}

      <div className="row g-3">
        {/* ── ADMIN SECURITY & CREDENTIALS CARD ── */}
        <div className="col-12 col-lg-6">
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-shield-halved text-success"></i>
                <h3 className="admin-card-title">Admin Account &amp; Security</h3>
              </div>
            </div>
            <div className="p-3">
              <p className="small text-muted mb-3">
                Update your administrative email address and login password.
              </p>

              {credSuccess && (
                <div className="alert alert-success py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                  <i className="fas fa-circle-check"></i>
                  <span>{credSuccess}</span>
                </div>
              )}

              {credError && (
                <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                  <i className="fas fa-triangle-exclamation"></i>
                  <span>{credError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateCredentials}>
                {/* Current Active Email Badge */}
                <div className="mb-3 p-2 rounded bg-light border d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted d-block small" style={{ fontSize: '0.7rem' }}>CURRENT EMAIL</span>
                    <span className="fw-bold text-dark font-monospace small">
                      {adminEmail || 'admin@dlims.gov'}
                    </span>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
                    <i className="fas fa-user-check me-1"></i> Active
                  </span>
                </div>

                {/* New Email */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary mb-1">
                    <i className="fas fa-envelope me-1 text-primary"></i> New Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    placeholder="Enter new email (optional)"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <span className="text-muted small" style={{ fontSize: '0.68rem' }}>
                    Leave blank to keep current email address.
                  </span>
                </div>

                {/* New Password & Confirm Password */}
                <div className="row g-2 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      <i className="fas fa-key me-1 text-primary"></i> New Password
                    </label>
                    <div className="input-group input-group-sm">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-sm"
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide' : 'Show'}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      <i className="fas fa-lock me-1 text-primary"></i> Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control form-control-sm"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Current Password Authorization */}
                <div className="mb-3 pt-2 border-top">
                  <label className="form-label small fw-bold text-dark mb-1">
                    <i className="fas fa-lock text-danger me-1"></i> Current Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-sm border-warning"
                    placeholder="Enter current password to authorize"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <span className="text-muted small" style={{ fontSize: '0.68rem' }}>
                    Required to confirm identity before saving changes.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={savingCreds || !currentPassword || (!newEmail && !newPassword)}
                  className="btn btn-sm btn-success w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold shadow-sm"
                >
                  <i className={`fas ${savingCreds ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                  <span>{savingCreds ? 'Saving Changes…' : 'Update Credentials'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── ENGINE INFORMATION CARD ── */}
        <div className="col-12 col-lg-6">
          <div className="admin-card mb-3">
            <div className="admin-card-header">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-server text-success"></i>
                <h3 className="admin-card-title">Engine Information</h3>
              </div>
            </div>
            <div className="p-3">
              <ul className="list-group list-group-flush small">
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Application Framework</span>
                  <span className="fw-semibold">Next.js 14 (App Router)</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Database Engine</span>
                  <span className="fw-semibold text-primary">PostgreSQL (Pool)</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Image Generator Engine</span>
                  <span className="fw-semibold">Pillow (Python 3)</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Active Templates</span>
                  <span className="fw-semibold">3 Templates (UP, Punjab, Kerala)</span>
                </li>
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span className="text-muted">Total Directory Records</span>
                  <span className="badge bg-success font-monospace">{stats?.metrics?.totalLicenses || 0}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ── MAINTENANCE & QUICK LINKS ── */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-screwdriver-wrench text-primary"></i>
                <h3 className="admin-card-title">Maintenance &amp; Quick Actions</h3>
              </div>
            </div>
            <div className="p-3">
              <p className="small text-muted mb-3">
                Manage directory seed records or launch cards.
              </p>
              <div className="d-flex flex-column gap-2">
                <button
                  onClick={handleResetData}
                  className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center gap-2 py-2"
                >
                  <i className="fas fa-database"></i>
                  <span>Seed Default Directory Records</span>
                </button>
                <Link
                  href="/admin/licenses"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-2"
                >
                  <i className="fas fa-list"></i>
                  <span>Open License Directory</span>
                </Link>
                <Link
                  href="/admin/licenses/new"
                  className="btn btn-sm btn-success d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                >
                  <i className="fas fa-id-card"></i>
                  <span>Launch 3-Template Card Generator</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
