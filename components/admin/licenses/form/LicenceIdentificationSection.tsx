'use client';

import React from 'react';
import { TemplateId } from './TemplateSelectorTabs';

interface LicenceIdentificationSectionProps {
  activeTab: TemplateId;
  currentData: Record<string, string>;
  updateField: (field: string, value: string) => void;
}

export default function LicenceIdentificationSection({
  activeTab,
  currentData,
  updateField,
}: LicenceIdentificationSectionProps) {
  return (
    <div className="admin-card mb-2 mb-md-3">
      <div className="admin-card-header py-2 px-3">
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-hashtag text-success"></i>
          <h3 className="admin-card-title fs-6">1. Licence Identification</h3>
        </div>
      </div>
      <div className="p-2 p-md-3">
        <div className="row g-2">
          <div className={activeTab === '2' ? 'col-12 col-md-6' : 'col-12'}>
            <label className="form-label small fw-bold text-secondary mb-1">DRIVING LICENCE NUMBER</label>
            <input
              type="text"
              className="form-control font-monospace fw-bold"
              placeholder="e.g. PB35 20210005691"
              value={currentData.dl_no || ''}
              onChange={(e) => updateField('dl_no', e.target.value)}
            />
          </div>

          {activeTab === '1' && (
            <>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-secondary mb-1">STATE NAME</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Uttar Pradesh"
                  value={currentData.state || ''}
                  onChange={(e) => updateField('state', e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold text-secondary mb-1">STATE CODE</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. UP"
                  value={currentData.state_code || ''}
                  onChange={(e) => updateField('state_code', e.target.value)}
                />
              </div>
            </>
          )}

          {activeTab === '2' && (
            <div className="col-12 col-md-6">
              <label className="form-label small fw-bold text-secondary mb-1">BACK TOP-RIGHT CODE</label>
              <input
                type="text"
                className="form-control font-monospace"
                placeholder="e.g. PBDL000002570487"
                value={currentData.top_right_code || ''}
                onChange={(e) => updateField('top_right_code', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
