'use client';

import React from 'react';
import LicenseTable from '@/components/admin/licenses/LicenseTable';

export default function AdminLicensesPage() {
  return (
    <div className="container-fluid py-4">
      <LicenseTable />
    </div>
  );
}
