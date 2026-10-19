'use client';

import React from 'react';
import Link from 'next/link';
import { TEMPLATES } from '@/components/admin/licenses/form/TemplateSelectorTabs';

export default function AdminTemplatesPage() {
  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="admin-page-title mb-0">Licence Templates Directory</h2>
          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
            Inspect official smart card layout specifications and graphics configurations
          </div>
        </div>
        <Link href="/something/licenses/new" className="btn btn-sm btn-success">
          <i className="fas fa-plus me-1"></i> Open Generator
        </Link>
      </div>

      <div className="row g-3">
        {TEMPLATES.map((tmpl) => (
          <div key={tmpl.id} className="col-12 col-md-4">
            <div className="admin-card h-100 p-3 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-success bg-opacity-10 text-success fw-bold">
                    Template {tmpl.id}
                  </span>
                  <span className="badge bg-secondary bg-opacity-10 text-dark">
                    {tmpl.badge}
                  </span>
                </div>
                <h5 className="fw-bold fs-6 text-dark mb-1">{tmpl.name}</h5>
                <p className="text-muted small mb-3">{tmpl.desc}</p>
              </div>

              <div className="pt-2 border-top">
                <Link
                  href={`/something/licenses/new?t=${tmpl.id}`}
                  className="btn btn-sm btn-outline-primary w-100"
                >
                  <i className="fas fa-pen-to-square me-1"></i> Launch Template {tmpl.id}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
