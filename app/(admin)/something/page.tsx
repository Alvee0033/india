'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsOverview from '@/components/admin/dashboard/StatsOverview';
import CategoryDistribution from '@/components/admin/dashboard/CategoryDistribution';
import RecentLicensesTable from '@/components/admin/dashboard/RecentLicensesTable';

interface DashboardStats {
  metrics: {
    totalLicenses: number;
    validLicenses: number;
    expiredLicenses: number;
    suspendedLicenses: number;
    totalVerifications: number;
  };
  categories: {
    motorCycleCount: number;
    motorCarCount: number;
    ltvCount: number;
    htvCount: number;
  };
  recentLicenses: Array<{
    id: string;
    license_number: string;
    name: string;
    template?: string;
    allowed_vehicles: string;
    status: string;
    created_at: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Telemetry error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const { metrics, categories, recentLicenses } = data || {
    metrics: { totalLicenses: 0, validLicenses: 0, expiredLicenses: 0, suspendedLicenses: 0, totalVerifications: 0 },
    categories: { motorCycleCount: 0, motorCarCount: 0, ltvCount: 0, htvCount: 0 },
    recentLicenses: [],
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="admin-page-title mb-0">Authority Dashboard</h2>
          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
            DL Central Management &amp; Record Telemetry
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href="/something/licenses/new" className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-3 fw-semibold rounded-pill">
            <i className="fas fa-plus me-1"></i>
            <span>Generate Card</span>
          </Link>
          <button onClick={fetchStats} className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: 34, height: 34 }} title="Refresh">
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      <StatsOverview metrics={metrics} />
      <CategoryDistribution categories={categories} />
      <RecentLicensesTable recentLicenses={recentLicenses} />
    </div>
  );
}
