'use client';

import React from 'react';

interface Categories {
  motorCycleCount: number;
  motorCarCount: number;
  ltvCount: number;
  htvCount: number;
}

export default function CategoryDistribution({ categories }: { categories: Categories }) {
  return (
    <div className="admin-card p-2 p-md-3 mb-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="fw-bold small text-secondary">VEHICLE CLASSIFICATIONS</span>
      </div>
      <div className="row g-2">
        <div className="col-6 col-md-3">
          <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
            <i className="fas fa-motorcycle text-primary"></i>
            <div>
              <div className="fw-bold fs-6">{categories.motorCycleCount}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>Motor Cycle (MCWG)</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
            <i className="fas fa-car text-success"></i>
            <div>
              <div className="fw-bold fs-6">{categories.motorCarCount}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>Light Motor Vehicle (LMV)</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
            <i className="fas fa-truck text-warning"></i>
            <div>
              <div className="fw-bold fs-6">{categories.ltvCount}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>Medium Vehicle (MGV)</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="d-flex align-items-center gap-2 p-2 border rounded bg-light">
            <i className="fas fa-bus text-info"></i>
            <div>
              <div className="fw-bold fs-6">{categories.htvCount}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>Heavy Vehicle (HGMV)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
