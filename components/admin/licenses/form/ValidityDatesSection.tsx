'use client';

import React from 'react';

interface ValidityDatesSectionProps {
  currentData: Record<string, string>;
  updateField: (field: string, value: string) => void;
}

export default function ValidityDatesSection({
  currentData,
  updateField,
}: ValidityDatesSectionProps) {
  return (
    <div className="admin-card mb-2 mb-md-3">
      <div className="admin-card-header py-2 px-3">
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-calendar-days text-success"></i>
          <h3 className="admin-card-title fs-6">2. Dates &amp; Validity</h3>
        </div>
      </div>
      <div className="p-2 p-md-3">
        <div className="row g-2">
          <div className="col-6 col-md-3">
            <label className="form-label small fw-bold text-secondary mb-1">ISSUE DATE</label>
            <input
              type="text"
              className="form-control font-monospace"
              placeholder="DD-MM-YYYY"
              value={currentData.issue_date || ''}
              onChange={(e) => updateField('issue_date', e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small fw-bold text-secondary mb-1">VALIDITY (NT)</label>
            <input
              type="text"
              className="form-control font-monospace"
              placeholder="DD-MM-YYYY"
              value={currentData.validity_nt || ''}
              onChange={(e) => updateField('validity_nt', e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small fw-bold text-secondary mb-1">VALIDITY (TR)</label>
            <input
              type="text"
              className="form-control font-monospace"
              placeholder="Optional"
              value={currentData.validity_tr || ''}
              onChange={(e) => updateField('validity_tr', e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label small fw-bold text-secondary mb-1">FIRST ISSUE</label>
            <input
              type="text"
              className="form-control font-monospace"
              placeholder="DD-MM-YYYY"
              value={currentData.first_issue_date || ''}
              onChange={(e) => updateField('first_issue_date', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
