'use client';

import React from 'react';
import { TemplateId } from './TemplateSelectorTabs';

interface DriverPersonalSectionProps {
  activeTab: TemplateId;
  currentData: Record<string, string>;
  updateField: (field: string, value: string) => void;
}

export default function DriverPersonalSection({
  activeTab,
  currentData,
  updateField,
}: DriverPersonalSectionProps) {
  return (
    <div className="admin-card mb-2 mb-md-3">
      <div className="admin-card-header py-2 px-3">
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-user-tie text-success"></i>
          <h3 className="admin-card-title fs-6">3. Personal Profile</h3>
        </div>
      </div>
      <div className="p-2 p-md-3">
        <div className="row g-2 mb-2">
          <div className="col-12 col-md-7">
            <label className="form-label small fw-bold text-secondary mb-1">DRIVER FULL NAME</label>
            <input
              type="text"
              className="form-control fw-bold"
              placeholder="e.g. MD RAFIQUL ISLAM"
              value={currentData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>
          <div className="col-12 col-md-5">
            <label className="form-label small fw-bold text-secondary mb-1">RELATION / GUARDIAN</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. MD ABUL HOSSAIN"
              value={currentData.relation || ''}
              onChange={(e) => updateField('relation', e.target.value)}
            />
          </div>
        </div>

        <div className="row g-2 mb-2">
          <div className="col-4">
            <label className="form-label small fw-bold text-secondary mb-1">DATE OF BIRTH</label>
            <input
              type="text"
              className="form-control font-monospace"
              placeholder="DD-MM-YYYY"
              value={currentData.dob || ''}
              onChange={(e) => updateField('dob', e.target.value)}
            />
          </div>
          <div className="col-4">
            <label className="form-label small fw-bold text-secondary mb-1">BLOOD GROUP</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. B+ VE"
              value={currentData.blood_group || ''}
              onChange={(e) => updateField('blood_group', e.target.value)}
            />
          </div>
          <div className="col-4">
            <label className="form-label small fw-bold text-secondary mb-1">ORGAN DONOR</label>
            <input
              type="text"
              className="form-control"
              placeholder="YES / NO"
              value={currentData.organ_donor || ''}
              onChange={(e) => updateField('organ_donor', e.target.value)}
            />
          </div>
        </div>

        {/* Addresses */}
        {activeTab === '1' && (
          <div className="mb-2">
            <label className="form-label small fw-bold text-secondary mb-1">ADDRESS</label>
            <textarea
              rows={2}
              className="form-control"
              placeholder="House / Street, Area, City, District, PIN..."
              value={currentData.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
            />
          </div>
        )}

        {activeTab === '2' && (
          <div className="row g-2 mb-2">
            <div className="col-12">
              <label className="form-label small fw-bold text-secondary mb-1">ADDRESS LINE 1</label>
              <input
                type="text"
                className="form-control"
                placeholder="Village / House / Road / Ward..."
                value={currentData.address_1 || ''}
                onChange={(e) => updateField('address_1', e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-secondary mb-1">ADDRESS LINE 2</label>
              <input
                type="text"
                className="form-control"
                placeholder="City, District, State, PIN..."
                value={currentData.address_2 || ''}
                onChange={(e) => updateField('address_2', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === '3' && (
          <div className="row g-2 mb-2">
            <div className="col-12 col-md-6">
              <span className="badge bg-light text-dark border mb-1">Permanent Address</span>
              <input
                type="text"
                placeholder="Permanent Line 1"
                className="form-control mb-1"
                value={currentData.perm_address_1 || ''}
                onChange={(e) => updateField('perm_address_1', e.target.value)}
              />
              <input
                type="text"
                placeholder="Permanent Line 2"
                className="form-control mb-1"
                value={currentData.perm_address_2 || ''}
                onChange={(e) => updateField('perm_address_2', e.target.value)}
              />
              <input
                type="text"
                placeholder="Permanent Line 3"
                className="form-control"
                value={currentData.perm_address_3 || ''}
                onChange={(e) => updateField('perm_address_3', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <span className="badge bg-light text-dark border mb-1">Present Address</span>
              <input
                type="text"
                placeholder="Present Line 1"
                className="form-control mb-1"
                value={currentData.pres_address_1 || ''}
                onChange={(e) => updateField('pres_address_1', e.target.value)}
              />
              <input
                type="text"
                placeholder="Present Line 2"
                className="form-control mb-1"
                value={currentData.pres_address_2 || ''}
                onChange={(e) => updateField('pres_address_2', e.target.value)}
              />
              <input
                type="text"
                placeholder="Present Line 3"
                className="form-control"
                value={currentData.pres_address_3 || ''}
                onChange={(e) => updateField('pres_address_3', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="row g-2">
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-secondary mb-1">LICENSING OFFICE</label>
            <textarea
              rows={2}
              className="form-control"
              placeholder="e.g. UP16 NOIDA&#10;UTTAR PRADESH"
              value={currentData.auth_office || ''}
              onChange={(e) => updateField('auth_office', e.target.value)}
            />
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>Press Enter for multiple lines</div>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label small fw-bold text-secondary mb-1">EMERGENCY PHONE</label>
            <input
              type="text"
              className="form-control"
              placeholder="Optional"
              value={currentData.emergency_contact || ''}
              onChange={(e) => updateField('emergency_contact', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
