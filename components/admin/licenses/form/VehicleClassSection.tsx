'use client';

import React from 'react';

interface VehicleClassSectionProps {
  currentData: Record<string, string>;
  updateField: (field: string, value: string) => void;
}

export default function VehicleClassSection({
  currentData,
  updateField,
}: VehicleClassSectionProps) {
  return (
    <div className="admin-card mb-2 mb-md-3">
      <div className="admin-card-header py-2 px-3">
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-car text-success"></i>
          <h3 className="admin-card-title fs-6">4. Vehicle Class Authorisation</h3>
        </div>
      </div>
      <div className="p-2 p-md-3">
        <div className="row g-2">
          {/* MCWG */}
          <div className="col-12 col-md-6">
            <div className="p-2 border rounded bg-light">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="fas fa-motorcycle text-primary"></i>
                <span className="fw-bold small">Motorcycle (MCWG)</span>
              </div>
              <div className="row g-1">
                <div className="col-6">
                  <label className="form-label small text-muted mb-0" style={{ fontSize: '0.65rem' }}>ISSUED BY</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. PB35"
                    value={currentData.mcwg_issued_by || ''}
                    onChange={(e) => updateField('mcwg_issued_by', e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small text-muted mb-0" style={{ fontSize: '0.65rem' }}>DATE</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="DD-MM-YYYY"
                    value={currentData.mcwg_date || ''}
                    onChange={(e) => updateField('mcwg_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LMV */}
          <div className="col-12 col-md-6">
            <div className="p-2 border rounded bg-light">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="fas fa-car text-success"></i>
                <span className="fw-bold small">Light Motor Vehicle (LMV)</span>
              </div>
              <div className="row g-1">
                <div className="col-6">
                  <label className="form-label small text-muted mb-0" style={{ fontSize: '0.65rem' }}>ISSUED BY</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. PB35"
                    value={currentData.lmv_issued_by || ''}
                    onChange={(e) => updateField('lmv_issued_by', e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small text-muted mb-0" style={{ fontSize: '0.65rem' }}>DATE</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="DD-MM-YYYY"
                    value={currentData.lmv_date || ''}
                    onChange={(e) => updateField('lmv_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
