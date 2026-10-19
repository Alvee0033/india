'use client';

import React from 'react';
import Link from 'next/link';

interface NavLink {
  href: string;
  label: string;
  desktopLabel?: string;
  icon: string;
  isAdd?: boolean;
}

interface AdminMobileNavProps {
  pathname: string;
  navLinks: NavLink[];
}

export default function AdminMobileNav({ pathname, navLinks }: AdminMobileNavProps) {
  return (
    <nav className="admin-mobile-nav">
      {navLinks.map((link) => {
        const isActive = link.href === '/something' ? pathname === '/something' : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={true}
            className={`mobile-nav-link ${isActive ? 'active' : ''} ${link.isAdd ? 'mobile-nav-add' : ''}`}
          >
            <i className={`fas ${link.icon}`}></i>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
