'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminTopbar from '@/components/admin/layout/AdminTopbar';
import AdminMobileNav from '@/components/admin/layout/AdminMobileNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/something');
  };

  const navLinks = [
    { href: '/something', label: 'Dashboard', desktopLabel: 'Dashboard', icon: 'fa-chart-pie' },
    { href: '/something/licenses', label: 'Directory', desktopLabel: 'Directory', icon: 'fa-address-card' },
    { href: '/something/licenses/new', label: 'Generator', desktopLabel: 'Card Generator', icon: 'fa-circle-plus', isAdd: true },
    { href: '/something/settings', label: 'Settings', desktopLabel: 'Settings', icon: 'fa-gear' },
  ];

  return (
    <div className="admin-body">
      <AdminSidebar pathname={pathname} navLinks={navLinks} onLogout={handleLogout} />
      <div className="admin-main-wrapper">
        <AdminTopbar />
        <main className="admin-content">{children}</main>
      </div>
      <AdminMobileNav pathname={pathname} navLinks={navLinks} />
    </div>
  );
}
