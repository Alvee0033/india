'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomeSearch() {
  const router = useRouter();

  const [dlNumber, setDlNumber] = useState('');
  const [dob, setDob] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState({ date: '', time: '' });
  const [loading, setLoading] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  // Generate 5-character alphanumeric captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(res);
    setUserCaptcha('');
  };

  useEffect(() => {
    generateCaptcha();

    // Check query params (?verify=... or ?license=... or ?dl_number=...)
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const queryLicense = sp.get('verify') || sp.get('license') || sp.get('dl_number');
      if (queryLicense && queryLicense.trim()) {
        const clean = queryLicense.trim().replace(/\s+/g, '-').toLowerCase();
        router.push(`/dl-status/${clean}`);
      }
    }

    const updateTime = () => {
      const now = new Date();
      const dateStr =
        String(now.getDate()).padStart(2, '0') +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        now.getFullYear();

      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr =
        String(hours).padStart(2, '0') +
        ':' +
        String(now.getMinutes()).padStart(2, '0') +
        ':' +
        String(now.getSeconds()).padStart(2, '0') +
        ' ' +
        ampm;

      setCurrentTime({ date: dateStr, time: timeStr });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDl = dlNumber.trim();
    if (!cleanDl) {
      setError('Please enter a valid Driving Licence Number.');
      return;
    }

    if (userCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Incorrect verification code. Please re-enter the characters shown in the security image.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/public/verify?license=${encodeURIComponent(cleanDl)}&dob=${encodeURIComponent(dob.trim())}`
      );
      const data = await res.json();

      if (res.ok && data.success && data.record) {
        const routeParam = cleanDl.replace(/\s+/g, '-').toLowerCase();
        router.push(`/dl-status/${routeParam}`);
      } else {
        setError(data.error || 'No records found matching the provided Driving Licence Number and Date of Birth.');
        generateCaptcha();
      }
    } catch (err) {
      setError('Network error connecting to verification server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDlNumber('');
    setDob('');
    setUserCaptcha('');
    setError(null);
    generateCaptcha();
  };

  return (
    <div style={{ fontSize: `${fontScale * 100}%` }}>
      <style dangerouslySetInnerHTML={{__html: `
        * { box-sizing: border-box; }
        body { 
          margin: 0; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
          background-color: #f0f4f9; 
          color: #1e293b; 
        }

        /* Top Tricolor Government Ribbon */
        .gov-top-stripe {
          height: 4px;
          background: linear-gradient(90deg, #ff9933 0%, #ff9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%, #138808 100%);
          width: 100%;
        }

        /* Tier 1: Government Citizen Utility Bar - Premium Dark Navy */
        .gov-utility-bar {
          background: #06192e;
          color: #94a3b8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11.5px;
        }

        .gov-utility-inner {
          max-width: 1360px;
          margin: 0 auto;
          padding: 6px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .gov-utility-left {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }

        .gov-flag-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 700;
          color: #ffffff;
        }

        .gov-flag-icon {
          width: 17px;
          height: 12px;
          border-radius: 2px;
          background: linear-gradient(180deg, #ff9933 0%, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%, #138808 100%);
          box-shadow: 0 0 3px rgba(0,0,0,0.5);
          position: relative;
          display: inline-block;
          flex-shrink: 0;
        }

        .gov-flag-icon::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 3.5px;
          height: 3.5px;
          border-radius: 50%;
          border: 0.5px solid #000080;
        }

        .gov-utility-sep {
          color: rgba(255, 255, 255, 0.2);
        }

        .gov-utility-ministry {
          color: #7dd3fc;
          font-weight: 500;
        }

        .gov-utility-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .gov-clock-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
          color: #e2e8f0;
        }

        .gov-clock-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .gov-lang-block {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: #cbd5e1;
        }

        .gov-lang-chip {
          background: #ffffff;
          color: #06192e;
          font-weight: 800;
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 4px;
          line-height: 1.2;
        }

        .gov-zoom-group {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255, 255, 255, 0.06);
          padding: 2px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .gov-zoom-btn {
          background: transparent;
          color: #e2e8f0;
          padding: 1px 7px;
          font-size: 10.5px;
          font-weight: 700;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .gov-zoom-btn:hover, .gov-zoom-btn.active {
          background: #0284c7;
          color: #ffffff;
        }

        .gov-admin-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(14, 165, 233, 0.12);
          color: #38bdf8;
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(56, 189, 248, 0.3);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .gov-admin-link:hover {
          background: #0284c7;
          color: #ffffff;
          border-color: #0284c7;
        }

        /* Tier 2: Redesigned Majestic Official Header (Deep Royal Navy with subtle warm gold accent) */
        .sarathi-main-banner {
          background: linear-gradient(135deg, #0a2540 0%, #0d3b66 50%, #082038 100%);
          border-bottom: 3px solid #ff9933;
          box-shadow: 0 4px 20px rgba(10, 37, 64, 0.15);
          color: #ffffff;
          position: relative;
        }

        .sarathi-banner-inner {
          max-width: 1360px;
          margin: 0 auto;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .sarathi-branding-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sarathi-emblem-badge {
          width: 68px;
          height: 68px;
          min-width: 68px;
          background: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
          border: 1.5px solid rgba(255, 255, 255, 0.8);
        }

        .sarathi-emblem-img {
          height: 56px;
          width: auto;
          object-fit: contain;
        }

        .sarathi-titles {
          line-height: 1.3;
        }

        .sarathi-title-hi {
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 2px;
          letter-spacing: 0.2px;
        }

        .sarathi-title-en {
          font-size: 14.5px;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: #ffffff;
          margin-bottom: 1px;
        }

        .sarathi-title-sub {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #ff9933;
          text-transform: uppercase;
        }

        .sarathi-branding-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sarathi-center-logo-img {
          height: 52px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
        }

        .sarathi-branding-right {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: flex-end;
        }

        .digital-india-badge {
          background: #ffffff;
          padding: 6px 14px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .digital-india-img {
          height: 38px;
          width: auto;
          object-fit: contain;
        }

        .mission-mode-text {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
          text-align: right;
        }

        .mission-mode-text .top {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #ffffff;
        }

        .mission-mode-text .sub {
          font-size: 10.5px;
          color: #94a3b8;
          letter-spacing: 0.4px;
        }

        /* Redesigned Breadcrumb Ribbon */
        .portal-breadcrumb-ribbon {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 10px 0;
          font-size: 12.5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .portal-breadcrumb-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .breadcrumb-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breadcrumb-home-icon {
          display: inline-flex;
          align-items: center;
          color: #0284c7;
        }

        .breadcrumb-links a {
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }

        .breadcrumb-links a:hover {
          color: #0284c7;
        }

        .breadcrumb-links .sep {
          color: #cbd5e1;
          font-size: 11px;
        }

        .portal-badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          color: #0369a1;
          font-weight: 600;
          background: #f0f9ff;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid #bae6fd;
        }

        .portal-live-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }
        
        @media (max-width: 992px) {
          .gov-utility-inner {
            flex-direction: column;
            gap: 8px;
            padding: 8px 14px;
            text-align: center;
          }
          .gov-utility-left, .gov-utility-right {
            justify-content: center;
            flex-wrap: wrap;
          }
          .sarathi-banner-inner {
            flex-direction: column;
            text-align: center;
            gap: 14px;
            padding: 16px 14px;
          }
          .sarathi-branding-left {
            flex-direction: column;
            text-align: center;
          }
          .sarathi-branding-right {
            justify-content: center;
            flex-wrap: wrap;
          }
          .mission-mode-text {
            text-align: center;
          }
        }
        
        /* Main Page Layout Container */
        .main-portal-content {
          max-width: 1240px;
          margin: 30px auto 48px auto;
          padding: 0 20px;
        }

        /* Dual-Card Grid Layout */
        .portal-dual-grid {
          display: grid;
          grid-template-columns: 56% 44%;
          gap: 24px;
          align-items: stretch;
          margin-bottom: 28px;
        }

        @media (max-width: 992px) {
          .portal-dual-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        /* Left Card: Driving Licence Verification */
        .portal-card-left {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .card-header-navy {
          background: linear-gradient(135deg, #0d3b66 0%, #005680 100%);
          border-bottom: 3px solid #ff9933;
          color: #ffffff;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15.5px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .card-header-icon {
          width: 20px;
          height: 20px;
          fill: currentColor;
          opacity: 0.95;
        }

        .card-header-pill {
          font-size: 11px;
          background: rgba(255, 255, 255, 0.16);
          color: #ffffff;
          padding: 3px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          font-weight: 600;
        }

        .portal-card-body {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Error Alert Box */
        .gov-alert-error {
          background-color: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-left: 4px solid #ef4444;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Form Controls */
        .gov-form-group {
          margin-bottom: 20px;
        }

        .gov-form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 7px;
        }

        .gov-form-label span.req {
          color: #dc2626;
          margin-left: 3px;
        }

        .gov-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .gov-input-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
          font-size: 15px;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .gov-input-field {
          width: 100%;
          height: 44px;
          padding: 8px 14px 8px 40px;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
          background-color: #f8fafc;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }

        .gov-input-field:focus {
          outline: none;
          background-color: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }

        .gov-input-field::placeholder {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 400;
          text-transform: uppercase;
        }

        /* Captcha Component */
        .gov-captcha-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gov-captcha-img {
          background: linear-gradient(135deg, #091e3a 0%, #173859 100%);
          color: #38bdf8;
          height: 44px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'Courier New', Courier, monospace;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 5px;
          border-radius: 8px;
          user-select: none;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
          text-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
        }

        .gov-captcha-reload {
          height: 44px;
          width: 44px;
          padding: 0;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .gov-captcha-reload:hover {
          background: #f1f5f9;
          color: #0284c7;
          border-color: #0284c7;
          transform: rotate(180deg);
        }

        .gov-captcha-input-wrap {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .gov-captcha-input {
          width: 100%;
          height: 44px;
          padding: 8px 14px 8px 40px;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: #0f172a;
          background: #f8fafc;
          transition: all 0.2s ease;
        }

        .gov-captcha-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }

        /* Action Buttons Row */
        .gov-form-actions {
          display: flex !important;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }

        .btn-check-gov {
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          border: none;
          padding: 11px 26px;
          font-size: 13.5px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
          transition: all 0.2s ease;
        }

        .btn-check-gov:hover {
          background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
          box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
          transform: translateY(-1px);
        }

        .btn-check-gov:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .btn-reset-gov {
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #475569;
          border: 1.5px solid #cbd5e1;
          padding: 10px 22px;
          font-size: 13.5px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-reset-gov:hover {
          background: #f8fafc;
          color: #0f172a;
          border-color: #94a3b8;
        }

        .form-security-footer {
          margin-top: auto;
          padding-top: 20px;
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        /* Right Card: Format Instructions & Guidelines */
        .portal-card-right {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .card-header-cyan {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          border-bottom: 3px solid #38bdf8;
          color: #ffffff;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .right-card-body {
          padding: 24px;
          font-size: 13px;
          line-height: 1.65;
          color: #334155;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .note-header-line {
          margin-bottom: 10px;
          color: #0f172a;
          font-size: 13px;
        }

        .note-highlight-red {
          color: #dc2626;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 12.5px;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }

        .note-format-ribbon {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
          padding: 9px 16px;
          border-radius: 8px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 700;
          font-size: 12.5px;
          margin: 10px 0 14px 0;
          letter-spacing: 0.5px;
        }

        /* Parameter Breakdown Grid inside Right Card */
        .note-params-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 12px 0;
        }

        @media (max-width: 500px) {
          .note-params-grid { grid-template-columns: 1fr; }
        }

        .note-param-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12px;
          color: #334155;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .param-code-pill {
          display: inline-block;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 700;
          color: #0369a1;
          background: #e0f2fe;
          padding: 2px 7px;
          border-radius: 4px;
          width: fit-content;
          font-size: 11px;
        }

        .note-example-box {
          margin-top: 14px;
          padding: 11px 15px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          color: #0f172a;
          font-size: 12.5px;
        }

        /* Bottom Full-Width Card: Terms Of Uses */
        .gov-terms-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
          overflow: hidden;
          margin-bottom: 28px;
        }

        .gov-terms-header {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gov-terms-title {
          font-size: 15px;
          color: #0f172a;
          font-weight: 700;
          letter-spacing: 0.2px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .gov-terms-body {
          padding: 22px 26px;
        }

        .gov-terms-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .gov-terms-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 13px;
          line-height: 1.65;
          color: #475569;
        }

        .gov-terms-item:last-child {
          margin-bottom: 0;
        }

        .terms-bullet-icon {
          color: #0284c7;
          font-size: 14px;
          line-height: 1.4;
          flex-shrink: 0;
        }

        /* Modernized Elegant Footer */
        .sarathi-footer-wrap {
          background: #081d34;
          color: #94a3b8;
          border-top: 3px solid #ff9933;
          padding: 20px 0 0 0;
          margin-top: 48px;
        }
        
        .sarathi-footer-top {
          text-align: center;
          font-size: 11.5px;
          color: #64748b;
          padding: 0 15px 16px 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          max-width: 1240px;
          margin: 0 auto 16px auto;
        }
        
        .sarathi-footer-main {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          padding: 10px 20px 30px 20px;
          gap: 25px;
        }
        
        .footer-logos {
          display: flex;
          gap: 24px;
          align-items: center;
          width: 35%;
        }
        
        .nic-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .nic-text {
          font-size: 11.5px;
          color: #cbd5e1;
        }
        
        .nic-text span {
          color: #38bdf8;
          font-weight: 700;
        }
        
        .footer-logo-img {
          height: 38px;
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.9;
        }
        
        .di-logo {
          height: 38px;
          width: auto;
          object-fit: contain;
          background: #ffffff;
          padding: 3px 8px;
          border-radius: 6px;
        }
        
        .footer-links-container {
          display: flex;
          justify-content: space-between;
          width: 58%;
          gap: 20px;
        }
        
        .footer-link-col {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        
        .footer-link-col a {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.15s;
        }
        
        .footer-link-col a:hover {
          color: #38bdf8;
          text-decoration: underline;
        }
        
        .sarathi-footer-bottom {
          background: #051424;
          color: #94a3b8;
          text-align: center;
          padding: 14px 20px;
          font-size: 13px;
          font-weight: 600;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        @media (max-width: 992px) {
          .sarathi-footer-main { flex-direction: column; gap: 25px; }
          .footer-logos { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
          .footer-links-container { width: 100%; flex-wrap: wrap; }
          .footer-link-col { width: 45%; margin-bottom: 12px; }
        }
      `}} />

      {/* Tricolor National Stripe */}
      <div className="gov-top-stripe" />

      {/* Tier 1: Government Citizen Utility & Accessibility Bar */}
      <div className="gov-utility-bar">
        <div className="gov-utility-inner">
          <div className="gov-utility-left">
            <span className="gov-flag-badge">
              <span className="gov-flag-icon" />
              <span>भारत सरकार | Government of India</span>
            </span>
            <span className="gov-utility-sep">|</span>
            <span className="gov-utility-ministry">सड़क परिवहन और राजमार्ग मंत्रालय (MoRTH)</span>
          </div>

          <div className="gov-utility-right">
            <div className="gov-clock-pill">
              <span className="gov-clock-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span id="live-date">{currentTime.date || '19-10-2026'}</span>
              </span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span className="gov-clock-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span id="live-time">{currentTime.time || '01:25:00 AM'}</span>
              </span>
            </div>

            <div className="gov-lang-block">
              <span>भाषा / Lang:</span>
              <span className="gov-lang-chip">अ<sub>A</sub></span>
            </div>

            <div className="gov-zoom-group">
              <button
                type="button"
                className={`gov-zoom-btn ${fontScale < 1 ? 'active' : ''}`}
                onClick={() => setFontScale(0.9)}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                className={`gov-zoom-btn ${fontScale === 1 ? 'active' : ''}`}
                onClick={() => setFontScale(1)}
                title="Default font size"
              >
                A
              </button>
              <button
                type="button"
                className={`gov-zoom-btn ${fontScale > 1 ? 'active' : ''}`}
                onClick={() => setFontScale(1.1)}
                title="Increase font size"
              >
                A+
              </button>
            </div>

            <Link href="/login" className="gov-admin-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 2: Official Sarathi Parivahan Main Banner */}
      <div className="sarathi-main-banner">
        <div className="sarathi-banner-inner">
          <div className="sarathi-branding-left">
            <div className="sarathi-emblem-badge">
              <img
                src="/demo2.png"
                alt="State Emblem of India"
                className="sarathi-emblem-img"
              />
            </div>
            <div className="sarathi-titles">
              <div className="sarathi-title-hi">सड़क परिवहन और राजमार्ग मंत्रालय</div>
              <div className="sarathi-title-en">MINISTRY OF ROAD TRANSPORT &amp; HIGHWAYS</div>
              <div className="sarathi-title-sub">Government of India</div>
            </div>
          </div>

          <div className="sarathi-branding-center">
            <img
              className="sarathi-center-logo-img"
              src="/logo.png"
              alt="Sarathi Parivahan Logo"
            />
          </div>

          <div className="sarathi-branding-right">
            <div className="mission-mode-text">
              <span className="top">e-Transport Portal</span>
              <span className="sub">Mission Mode Project</span>
            </div>
            <div className="digital-india-badge">
              <img
                src="/digital_logo_main-1.png"
                alt="Digital India - Power to Empower"
                className="digital-india-img"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Ribbon with Status Pill */}
      <div className="portal-breadcrumb-ribbon">
        <div className="portal-breadcrumb-inner">
          <div className="breadcrumb-links">
            <span className="breadcrumb-home-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <Link href="/">Home</Link>
            <span className="sep">&gt;</span>
            <span>Online Services</span>
            <span className="sep">&gt;</span>
            <span>Driving Licence Related Services</span>
            <span className="sep">&gt;</span>
            <strong style={{ color: '#0369a1' }}>Know Your Driving Licence Status</strong>
          </div>
          <div className="portal-badge-chip">
            <span className="portal-live-dot" />
            <span>VAHAN &amp; SARATHI National Register</span>
          </div>
        </div>
      </div>

      {/* Main Content Area - DUAL-CARD LAYOUT */}
      <div className="main-portal-content">
        <div className="portal-dual-grid">
          {/* LEFT CARD: Driving Licence Verification Form */}
          <div className="portal-card-left">
            <div className="card-header-navy">
              <div className="card-header-title">
                <svg className="card-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2"/>
                  <line x1="2" x2="22" y1="10" y2="10"/>
                </svg>
                <span>Driving Licence Verification</span>
              </div>
              <span className="card-header-pill">Citizen Service</span>
            </div>

            <div className="portal-card-body">
              {error && (
                <div className="gov-alert-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" x2="12" y1="8" y2="12"/>
                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                  <span><strong>Error:</strong> {error}</span>
                </div>
              )}

              <form onSubmit={handleCheckStatus}>
                {/* Field 1: DL Number */}
                <div className="gov-form-group">
                  <label className="gov-form-label" htmlFor="dl_no">
                    Driving Licence No. <span className="req">*</span>
                  </label>
                  <div className="gov-input-wrapper">
                    <span className="gov-input-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <line x1="3" x2="21" y1="9" y2="9"/>
                        <line x1="9" x2="9" y1="21" y2="9"/>
                      </svg>
                    </span>
                    <input
                      id="dl_no"
                      type="text"
                      name="dl_no"
                      className="gov-input-field"
                      placeholder="ENTER DRIVING LICENCE NO."
                      value={dlNumber}
                      onChange={(e) => setDlNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Field 2: Date Of Birth */}
                <div className="gov-form-group">
                  <label className="gov-form-label" htmlFor="dob">
                    Date Of Birth (DOB) <span className="req">*</span>
                  </label>
                  <div className="gov-input-wrapper">
                    <span className="gov-input-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 2v4"/>
                        <path d="M16 2v4"/>
                        <rect width="18" height="18" x="3" y="4" rx="2"/>
                        <path d="M3 10h18"/>
                      </svg>
                    </span>
                    <input
                      id="dob"
                      type="text"
                      name="dob"
                      className="gov-input-field"
                      placeholder="SELECT DATE OF BIRTH (DD-MM-YYYY)"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Field 3: Captcha */}
                <div className="gov-form-group">
                  <label className="gov-form-label" htmlFor="captcha">
                    Enter Verification Code <span className="req">*</span>
                  </label>
                  <div className="gov-captcha-box">
                    <div className="gov-captcha-img" title="Security Verification Code">
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      className="gov-captcha-reload"
                      onClick={generateCaptcha}
                      title="Reload verification code"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                        <path d="M16 16h5v5"/>
                      </svg>
                    </button>
                    <div className="gov-captcha-input-wrap">
                      <span className="gov-input-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        id="captcha"
                        type="text"
                        name="captcha"
                        className="gov-captcha-input"
                        placeholder="VERIFICATION CODE"
                        value={userCaptcha}
                        onChange={(e) => setUserCaptcha(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit and Reset Buttons */}
                <div className="gov-form-actions">
                  <button
                    type="submit"
                    className="btn-check-gov"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 2a10 10 0 0 1 10 10"/>
                        </svg>
                        <span>Connecting Database...</span>
                      </>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <span>Check Status</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-reset-gov"
                    onClick={handleReset}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                      <path d="M21 3v5h-5"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                      <path d="M3 3v5h5"/>
                    </svg>
                    <span>Reset</span>
                  </button>
                </div>
              </form>

              <div className="form-security-footer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                </svg>
                <span>Integrated with MoRTH Centralized DLIMS Register</span>
              </div>
            </div>
          </div>

          {/* RIGHT CARD: Format Rules & Conversion Guidelines */}
          <div className="portal-card-right">
            <div className="card-header-cyan">
              <div className="card-header-title">
                <svg className="card-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
                <span>DL Number Format &amp; Guidelines</span>
              </div>
              <span className="card-header-pill">16 Characters Rule</span>
            </div>

            <div className="right-card-body">
              <div className="note-header-line">
                <strong>Note:</strong> - Driving Licence number can be entered in any of the following formats: <strong>DL-1420110012345</strong> or <strong>DL14 20110012345</strong>
              </div>
              
              <div className="note-highlight-red">
                <span>✦</span>
                <span>Total number of input characters should be exactly 16 (including space (&apos; &apos;) or hyphen (&apos;-&apos;)).</span>
              </div>

              <div className="note-highlight-red">
                <span>✦</span>
                <span>If you hold an old driving license with a different format, please convert the format as per below rule before entering.</span>
              </div>

              <div className="note-format-ribbon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
                <span>SS-RRYYYYNNNNNNN OR SSRR&lt;space&gt;YYYYNNNNNNN</span>
              </div>

              <div style={{ fontWeight: 'bold', margin: '4px 0', color: '#0f172a' }}>Where:</div>

              {/* Parameter Breakdown Grid */}
              <div className="note-params-grid">
                <div className="note-param-card">
                  <span className="param-code-pill">SS</span>
                  <span>Two character State Code (e.g. RJ, TN, DL, PB)</span>
                </div>
                <div className="note-param-card">
                  <span className="param-code-pill">RR</span>
                  <span>Two digit RTO Code</span>
                </div>
                <div className="note-param-card">
                  <span className="param-code-pill">YYYY</span>
                  <span>4-digit Year of Issue (e.g. 99 is 1999, 12 is 2012)</span>
                </div>
                <div className="note-param-card">
                  <span className="param-code-pill">NNNNNNN</span>
                  <span>7-digit number (add leading zeros if fewer)</span>
                </div>
              </div>

              <div className="note-example-box">
                <strong style={{ color: '#0369a1' }}>Example:</strong> If DL is <code>RJ-13/DLC/12/123456</code> then enter <strong>RJ-1320120123456</strong> or <strong>RJ13 20120123456</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FULL-WIDTH CARD: Terms Of Uses Section */}
        <div className="gov-terms-card">
          <div className="gov-terms-header">
            <div className="gov-terms-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" x2="8" y1="13" y2="13"/>
                <line x1="16" x2="8" y1="17" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>Terms Of Uses</span>
            </div>
            <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 'bold' }}>National Citizen Charter</span>
          </div>

          <div className="gov-terms-body">
            <ul className="gov-terms-list">
              <li className="gov-terms-item">
                <span className="terms-bullet-icon">✦</span>
                <span>The content on this portal is meant for sharing information regarding vehicles on the basis of information available on centralized VAHAN and vehicle National Register. Using content of this portal for any commercial purpose or any derivative work or misuse of any kind is strictly prohibited and may invite legal consequences.</span>
              </li>
              <li className="gov-terms-item">
                <span className="terms-bullet-icon">✦</span>
                <span>The content can be removed from the portal without notice and at any time as per DLIMS direction.</span>
              </li>
              <li className="gov-terms-item">
                <span className="terms-bullet-icon">✦</span>
                <span>DLIMS shall not be held responsible for any interactions/passing of information(s) etc. between any user via e-mail, chat and any other mediation with another user. DLIMS has no obligation to monitor any such disputes arising between the users and shall not be party to such dispute/litigation etc.</span>
              </li>
              <li className="gov-terms-item">
                <span className="terms-bullet-icon">✦</span>
                <span>These terms and conditions shall be governed by and construed in accordance with the local Laws. Any dispute arising under these terms and conditions shall be subject to the jurisdiction of the courts of local territory only.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Official Sarathi Footer */}
      <div className="sarathi-footer-wrap">
        <div className="sarathi-footer-top">
          Best viewed in Google Chrome 140+, Microsoft Edge 140+, Mozilla Firefox 140+, and Opera 120+ browsers. Recommended screen resolution: 1366 * 768 or higher.
        </div>

        <div className="sarathi-footer-main">
          <div className="footer-logos">
            <div className="nic-section">
              <div className="nic-text">Designed, developed and hosted by <span>DLIMS</span></div>
              <img
                src="/logo-1.png"
                alt="Logo"
                className="footer-logo-img"
              />
            </div>
            <img
              className="di-logo"
              src="/digital_logo_main-1.png"
              alt="Digital Logo"
            />
          </div>

          <div className="footer-links-container">
            <div className="footer-link-col">
              <a href="#">Dashboard</a>
              <a href="#">Doctor Registration</a>
              <a href="#">Find Doctor</a>
              <a href="#">Activate User Account</a>
            </div>
            <div className="footer-link-col">
              <a href="#">User Manual</a>
              <a href="#">Acts &amp; Rules</a>
              <a href="#">Screen Reader</a>
            </div>
            <div className="footer-link-col">
              <a href="#">Contact Us</a>
              <a href="#">Feedback / Complaints</a>
              <a href="#">FAQs</a>
            </div>
            <div className="footer-link-col">
              <a href="#">Parivahan</a>
              <a href="#">Sarathi Portal</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Hyperlink Policy</a>
            </div>
          </div>
        </div>

        <div className="sarathi-footer-bottom">
          Copyright © 2026 Ministry of Road Transport &amp; Highways (MoRTH), Government of India. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
