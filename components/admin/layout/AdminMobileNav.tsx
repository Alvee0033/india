'use client';

import React from 'react';

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
  const handleNav = (url: string) => {
    window.location.href = url;
  };

  return (
    <nav
      className="admin-mobile-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '68px',
        backgroundColor: '#091522',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 99999,
        borderTop: '2px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.4)',
        padding: '0 4px',
      }}
    >
      {navLinks.map((link) => {
        const isActive =
          link.href === '/something'
            ? pathname === '/something'
            : pathname.startsWith(link.href);

        return (
          <button
            key={link.href}
            type="button"
            onClick={() => handleNav(link.href)}
            style={{
              background: isActive ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              color: isActive ? '#34d399' : '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 8px',
              borderRadius: '8px',
              flex: 1,
              maxWidth: '80px',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'rgba(0,0,0,0)',
            }}
          >
            <i
              className={`fas ${link.icon}`}
              style={{
                fontSize: link.isAdd ? '1.4rem' : '1.15rem',
                color: link.isAdd ? '#10b981' : 'inherit',
                marginBottom: '3px',
              }}
            ></i>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.2px',
                lineHeight: 1.1,
              }}
            >
              {link.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
