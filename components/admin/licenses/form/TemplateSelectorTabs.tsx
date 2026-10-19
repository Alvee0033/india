'use client';

import React from 'react';

export type TemplateId = '1' | '2' | '3';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  badge: string;
  desc: string;
  icon: string;
}

export const TEMPLATES: TemplateInfo[] = [
  { id: '1', name: 'Template 1', badge: 'UP / Union', desc: 'Standard Smart Card with Chip & Stamp', icon: 'fa-id-card' },
  { id: '2', name: 'Template 2', badge: 'Punjab State', desc: 'High-Res Licence with Micro-pattern & QR', icon: 'fa-shield-halved' },
  { id: '3', name: 'Template 3', badge: 'Kerala State', desc: 'Kerala DL with Dual Address & Matrix', icon: 'fa-address-card' },
];

interface TemplateSelectorTabsProps {
  activeTab: TemplateId;
  onSelectTab: (id: TemplateId) => void;
  onLoadPreset: (preset: 'empty' | 'default' | 'bd') => void;
}

export default function TemplateSelectorTabs({
  activeTab,
  onSelectTab,
  onLoadPreset,
}: TemplateSelectorTabsProps) {
  return (
    <>
      {/* Mobile Swiper */}
      <div className="d-flex d-md-none overflow-x-auto gap-2 pb-2 mb-2 no-scrollbar">
        {TEMPLATES.map((tmpl) => {
          const isSel = activeTab === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => onSelectTab(tmpl.id)}
              className={`mobile-segment-btn ${isSel ? 'active' : ''}`}
            >
              <i className={`fas ${tmpl.icon} me-1`}></i>
              {tmpl.name} ({tmpl.badge})
            </button>
          );
        })}
      </div>

      {/* Desktop 3-Card Template Selector */}
      <div className="row g-2 mb-3 d-none d-md-flex">
        {TEMPLATES.map((tmpl) => {
          const isSel = activeTab === tmpl.id;
          return (
            <div key={tmpl.id} className="col-4">
              <div
                onClick={() => onSelectTab(tmpl.id)}
                className={`p-2 p-lg-3 rounded-3 border transition-all cursor-pointer ${
                  isSel ? 'bg-white shadow-sm border-success' : 'bg-white border-light opacity-75'
                }`}
                style={{
                  cursor: 'pointer',
                  borderWidth: isSel ? '2px' : '1px',
                  borderColor: isSel ? '#10b981' : '#e2e8f0',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className={`rounded-2 p-1 px-2 d-flex align-items-center justify-content-center ${
                        isSel ? 'bg-success text-white' : 'bg-secondary bg-opacity-10 text-muted'
                      }`}
                      style={{ fontSize: '0.8rem' }}
                    >
                      <i className={`fas ${tmpl.icon}`}></i>
                    </div>
                    <span className="fw-bold text-dark small">{tmpl.name}</span>
                  </div>
                  <span className={isSel ? 'badge-status-valid' : 'badge bg-light text-muted border'} style={{ fontSize: '0.68rem' }}>
                    {tmpl.badge}
                  </span>
                </div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                  {tmpl.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Presets Bar */}
      <div className="d-flex justify-content-between align-items-center mb-2 mb-md-3 p-2 bg-white rounded border">
        <div className="d-flex align-items-center gap-1">
          <span className="badge bg-secondary bg-opacity-10 text-dark font-monospace" style={{ fontSize: '0.7rem' }}>
            {TEMPLATES.find((t) => t.id === activeTab)?.badge}
          </span>
          <span className="text-muted d-none d-sm-inline" style={{ fontSize: '0.72rem' }}>
            Live typing syncs to card
          </span>
        </div>
        <div className="d-flex gap-1">
          <button
            onClick={() => onLoadPreset('empty')}
            className="btn btn-sm btn-outline-danger py-1 px-2"
            style={{ fontSize: '0.72rem' }}
            title="Clear all fields"
          >
            <i className="fas fa-eraser me-1"></i> Clear
          </button>
          <button
            onClick={() => onLoadPreset('default')}
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            style={{ fontSize: '0.72rem' }}
          >
            <i className="fas fa-rotate-left me-1"></i> Sample
          </button>
          <button
            onClick={() => onLoadPreset('bd')}
            className="btn btn-sm btn-outline-primary py-1 px-2"
            style={{ fontSize: '0.72rem' }}
          >
            <i className="fas fa-flag text-danger me-1"></i> BD Demo
          </button>
        </div>
      </div>
    </>
  );
}
