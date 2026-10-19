'use client';

import React from 'react';

interface Metrics {
  totalLicenses: number;
  validLicenses: number;
  expiredLicenses: number;
  suspendedLicenses: number;
  totalVerifications: number;
}

export default function StatsOverview({ metrics }: { metrics: Metrics }) {
  return (
    <div className="row g-2 g-md-3 mb-3">
      <div className="col-6 col-lg-3">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total</span>
            <div className="metric-icon-box bg-primary bg-opacity-10 text-primary">
              <i className="fas fa-id-card"></i>
            </div>
          </div>
          <div className="metric-value">{metrics.totalLicenses}</div>
          <div className="metric-subtitle">Active Directory</div>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Valid</span>
            <div className="metric-icon-box bg-success bg-opacity-10 text-success">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="metric-value text-success">{metrics.validLicenses}</div>
          <div className="metric-subtitle">Authorized Drivers</div>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Expired</span>
            <div className="metric-icon-box bg-danger bg-opacity-10 text-danger">
              <i className="fas fa-calendar-xmark"></i>
            </div>
          </div>
          <div className="metric-value text-danger">{metrics.expiredLicenses}</div>
          <div className="metric-subtitle">Requires Renewal</div>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Queries</span>
            <div className="metric-icon-box bg-info bg-opacity-10 text-info">
              <i className="fas fa-magnifying-glass"></i>
            </div>
          </div>
          <div className="metric-value text-info">{metrics.totalVerifications}</div>
          <div className="metric-subtitle">System Queries</div>
        </div>
      </div>
    </div>
  );
}
