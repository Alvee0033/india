'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface LicenseData {
  id: string;
  license_number: string;
  name: string;
  relation?: string;
  dob?: string;
  blood_group?: string;
  organ_donor?: string;
  issue_date: string;
  validity_nt: string;
  validity_tr?: string;
  first_issue_date?: string;
  status: string;
  auth_office?: string;
  allowed_vehicles?: string;
  photo_url?: string;
  address_1?: string;
  address_2?: string;
}

export default function LicenseStatus() {
  const params = useParams();
  const router = useRouter();
  const rawLicense = (params?.license as string) || '';
  const decodedLicense = decodeURIComponent(rawLicense).replace(/-/g, ' ');

  const [loading, setLoading] = useState(true);
  const [license, setLicense] = useState<LicenseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState({ date: '', time: '' });
  const [fontScale, setFontScale] = useState<number>(1);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!rawLicense) {
      setError('Driving Licence number is required.');
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/public/verify?license=${encodeURIComponent(rawLicense)}`);
        const data = await res.json();

        if (res.ok && data.success && data.record) {
          setLicense(data.record);
        } else {
          setError(data.error || 'No record found');
        }
      } catch (err: any) {
        setError('Network error occurred while fetching licence status.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [rawLicense]);

  // Parse vehicle classes for the COV table
  const getVehicleRows = () => {
    if (!license) return [];
    const list: { category: string; covClass: string; issueDate: string }[] = [];
    const rawCov = (license.allowed_vehicles || 'MCWG, LMV').toUpperCase();

    if (rawCov.includes('MCWG') || rawCov.includes('CYCLE')) {
      list.push({ category: 'NT', covClass: 'MCWG', issueDate: license.issue_date || license.first_issue_date || '-' });
    }
    if (rawCov.includes('LMV') || rawCov.includes('CAR')) {
      list.push({ category: 'NT', covClass: 'LMV', issueDate: license.issue_date || license.first_issue_date || '-' });
    }
    if (rawCov.includes('TR') || rawCov.includes('TRANS')) {
      list.push({ category: 'TR', covClass: 'TRANS', issueDate: license.issue_date || '-' });
    }
    if (rawCov.includes('HTV')) {
      list.push({ category: 'TR', covClass: 'HTV', issueDate: license.issue_date || '-' });
    }

    if (list.length === 0) {
      list.push({ category: 'NT', covClass: 'LMV-NT', issueDate: license.issue_date || '-' });
    }
    return list;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        /* Top Tricolor Government Ribbon */
        .gov-top-stripe {
          height: 3.5px;
          background: linear-gradient(90deg, #ff9933 0%, #ff9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%, #138808 100%);
          width: 100%;
        }

        /* Tier 1: Government Citizen Utility & Accessibility Bar */
        .gov-utility-bar {
          background-color: #07253f;
          color: #e2e8f0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
          gap: 10px;
          font-size: 11.5px;
          font-weight: 500;
          color: #cbd5e1;
        }

        .gov-flag-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.3px;
        }

        .gov-flag-icon {
          width: 16px;
          height: 11px;
          border-radius: 2px;
          background: linear-gradient(180deg, #ff9933 0%, #ff9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%, #138808 100%);
          box-shadow: 0 0 2px rgba(0,0,0,0.5);
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
          width: 3px;
          height: 3px;
          border-radius: 50%;
          border: 0.5px solid #000080;
        }

        .gov-utility-sep {
          color: rgba(255, 255, 255, 0.25);
          font-weight: 300;
        }

        .gov-utility-ministry {
          color: #93c5fd;
          font-size: 11.5px;
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
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 10px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
          color: #f8fafc;
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
          color: #07253f;
          font-weight: 800;
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 3px;
          line-height: 1.2;
        }

        .gov-zoom-group {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .gov-zoom-btn {
          background: transparent;
          color: #e2e8f0;
          padding: 1px 6px;
          font-size: 10.5px;
          font-weight: 700;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .gov-zoom-btn:hover, .gov-zoom-btn.active {
          background: #0284c7;
          color: #ffffff;
        }

        .gov-admin-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: linear-gradient(180deg, #1e3a5f 0%, #10243e 100%);
          color: #e0f2fe;
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 4px;
          border: 1px solid rgba(56, 189, 248, 0.35);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .gov-admin-link:hover {
          background: #0284c7;
          color: #ffffff;
          border-color: #38bdf8;
        }

        /* Tier 2: Official Sarathi Parivahan Main Banner */
        .sarathi-main-banner {
          background: linear-gradient(135deg, #1ea1ef 0%, #0d8cd7 100%);
          border-bottom: 2px solid #005680;
          box-shadow: 0 4px 14px rgba(11, 74, 115, 0.18);
          color: #ffffff;
        }

        .sarathi-banner-inner {
          max-width: 1360px;
          margin: 0 auto;
          padding: 12px 20px;
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
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
        }

        .sarathi-emblem-img {
          height: 58px;
          width: auto;
          object-fit: contain;
        }

        .sarathi-titles {
          line-height: 1.25;
        }

        .sarathi-title-hi {
          font-size: 15.5px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 2px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .sarathi-title-en {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.6px;
          color: #ffffff;
          margin-bottom: 1px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .sarathi-title-sub {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #e0f2fe;
          text-transform: uppercase;
        }

        .sarathi-branding-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sarathi-center-logo-img {
          height: 50px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.18));
        }

        .sarathi-branding-right {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-content: flex-end;
        }

        .digital-india-badge {
          background: #ffffff;
          padding: 5px 12px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255, 255, 255, 0.7);
        }

        .digital-india-img {
          height: 36px;
          width: auto;
          object-fit: contain;
        }

        .mission-mode-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          text-align: right;
          color: #ffffff;
        }

        .mission-mode-text .top {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .mission-mode-text .sub {
          font-size: 10px;
          color: #e0f2fe;
          letter-spacing: 0.3px;
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
            padding: 14px 14px;
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

        .sarathi-footer-wrap { background-color: #21a3f0; color: #fff; font-family: Arial, sans-serif; padding: 10px 0 0 0; margin-top: 50px; }
        .sarathi-footer-top { text-align: center; font-size: 11px; font-style: italic; padding: 5px 15px; margin-bottom: 10px; }
        .sarathi-footer-main { max-width: 1400px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; padding: 10px 30px 25px 30px; }
        
        .footer-logos { display: flex; gap: 30px; align-items: center; width: 35%; }
        .nic-section { display: flex; flex-direction: column; gap: 5px; }
        .nic-text { font-size: 11px; font-style: italic; margin-bottom: 5px;}
        .nic-text span { color: #0b498f; font-weight: bold; }
        .nic-logo { height: 40px; filter: brightness(0) invert(1); }
        .di-logo { height: 40px; }
        
        .footer-links-container { display: flex; justify-content: space-between; width: 60%; gap: 15px; }
        .footer-link-col { display: flex; flex-direction: column; gap: 10px; }
        .footer-link-col a { color: #fff; text-decoration: none; font-size: 13px; }
        .footer-link-col a:hover { text-decoration: underline; }
        
        .sarathi-footer-bottom { background-color: #fff9c4; color: #333; text-align: center; padding: 12px 15px; font-size: 15px; font-weight: bold; max-width: 1360px; margin: 0 auto 20px auto; border-radius: 2px; }
        
        @media (max-width: 992px) {
            .sarathi-footer-main { flex-direction: column; gap: 30px; }
            .footer-logos { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
            .footer-links-container { width: 100%; flex-wrap: wrap; }
            .footer-link-col { width: 45%; margin-bottom: 15px; }
            .sarathi-footer-bottom { margin-left: 15px; margin-right: 15px; }
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
              <span>ई-परिवहन सेवा | e-Parivahan Portal</span>
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
              <div className="sarathi-title-sub">National Transport Portal</div>
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

      {/* Main Container */}
      <div className="container" style={{ maxWidth: '1350px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ border: '1px solid #bce8f1', borderRadius: '4px', marginBottom: '20px' }}>
          <div
            style={{
              backgroundColor: '#d9edf7',
              color: '#31708f',
              padding: '10px 15px',
              fontWeight: 'bold',
              borderBottom: '1px solid #bce8f1',
              fontSize: '14px',
            }}
          >
            Know Your Driving Licence Status
          </div>

          <div style={{ padding: '30px 40px', background: '#fff' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading licence details...</span>
                </div>
                <div style={{ marginTop: '12px', color: '#666', fontSize: '13px' }}>Retrieving Driving Licence information...</div>
              </div>
            )}

            {error && !loading && (
              <div style={{ padding: '15px', background: '#f2dede', color: '#a94442', border: '1px solid #ebccd1', borderRadius: '4px', textAlign: 'center', margin: '20px auto', maxWidth: '600px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Record Not Found</div>
                <div>{error}</div>
                <div style={{ marginTop: '10px' }}>
                  <Link href="/" style={{ background: '#f5f5f5', border: '1px solid #999', padding: '4px 12px', fontSize: '12px', color: '#000', textDecoration: 'none', borderRadius: '3px' }}>
                    Back to Search
                  </Link>
                </div>
              </div>
            )}

            {license && !loading && (
              <div>
                <style dangerouslySetInnerHTML={{__html: `
                  .dl-form-center-wrapper { width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; }
                  .dl-form-group { display: flex; align-items: center; margin-bottom: 15px; width: 100%; max-width: 500px; justify-content: space-between; }
                  .dl-form-group label { color: #d9534f; font-size: 12px; font-weight: normal; text-align: left; width: 45%; }
                  .dl-form-control { width: 50%; padding: 5px 8px; border: 1px solid #ddd; background: #f9f9f9; border-radius: 2px; font-size: 12px; color: #777; text-transform: uppercase; }
                  .dl-btn-group { display: flex; gap: 10px; margin-top: 10px; justify-content: center; width: 100%; }
                  .dl-btn { background: #f5f5f5; border: 1px solid #999; padding: 5px 12px; font-weight: bold; cursor: pointer; font-size: 13px; border-radius: 3px; color: #000; text-decoration: none; }
                  .dl-btn:hover { background: #e0e0e0; }
                  .dl-table-title { text-align: center; font-weight: bold; font-size: 14px; text-decoration: underline; margin: 30px 0 15px 0; color: #000; }
                  .dl-table { width: 100%; max-width: 1000px; margin: 0 auto 20px auto; border-collapse: collapse; font-size: 12px; }
                  .dl-table, .dl-table th, .dl-table td { border: 1px solid #ddd; }
                  .dl-table th { background-color: #f5f5f5; padding: 10px; text-align: left; width: 30%; font-weight: bold; color: #333; }
                  .dl-table td { padding: 10px; color: #000; text-transform: uppercase; }
                  .dl-cov-table th { background-color: #e6f2ff; text-align: center; }
                  .dl-cov-table td { text-align: center; }
                  @media (max-width: 768px) {
                    .dl-form-group { flex-direction: column; align-items: flex-start; }
                    .dl-form-group label { width: 100%; margin-bottom: 5px; }
                    .dl-form-control { width: 100%; }
                  }
                
        /* Mobile Optimization */
        @media (max-width: 768px) {
          .sarathi-main-banner {
            padding: 8px 0 !important;
          }
          .sarathi-banner-inner {
            padding: 10px 14px !important;
            gap: 12px !important;
            flex-direction: column !important;
            text-align: center !important;
          }
          .sarathi-branding-left {
            flex-direction: column !important;
            gap: 8px !important;
            text-align: center !important;
          }
          .sarathi-emblem-badge {
            width: 52px !important;
            height: 52px !important;
            min-width: 52px !important;
            border-radius: 8px !important;
          }
          .sarathi-emblem-img {
            height: 42px !important;
          }
          .sarathi-title-hi {
            font-size: 13px !important;
          }
          .sarathi-title-en {
            font-size: 12px !important;
            letter-spacing: 0.2px !important;
          }
          .sarathi-title-sub {
            font-size: 10px !important;
          }
          .sarathi-center-logo-img {
            height: 38px !important;
          }
          .sarathi-branding-right {
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
          .digital-india-badge {
            padding: 4px 10px !important;
          }
          .digital-india-img {
            height: 28px !important;
          }
          .mission-mode-text {
            text-align: center !important;
          }
          .mission-mode-text .top {
            font-size: 10px !important;
          }
          .mission-mode-text .sub {
            font-size: 9px !important;
          }
          .main-portal-content {
            margin: 14px auto 28px auto !important;
            padding: 0 12px !important;
          }
          .portal-card-body, .right-card-body {
            padding: 16px 14px !important;
          }
          .card-header-navy, .card-header-cyan {
            padding: 12px 14px !important;
          }
          .card-header-title {
            font-size: 14px !important;
          }
          .gov-input-field, .gov-captcha-input {
            height: 42px !important;
            font-size: 13px !important;
          }
          .gov-captcha-box {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .gov-captcha-img {
            height: 40px !important;
            font-size: 17px !important;
            letter-spacing: 4px !important;
            padding: 0 12px !important;
          }
          .gov-captcha-reload {
            height: 40px !important;
            width: 40px !important;
          }
          .gov-captcha-input-wrap {
            width: 100% !important;
            flex: 1 1 100% !important;
          }
          .gov-form-actions {
            flex-direction: column !important;
            width: 100% !important;
            gap: 10px !important;
          }
          .btn-check-gov, .btn-reset-gov {
            width: 100% !important;
            justify-content: center !important;
            padding: 11px !important;
          }
          .note-params-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .gov-terms-body {
            padding: 14px 14px !important;
          }
          .gov-terms-item {
            font-size: 12px !important;
            gap: 8px !important;
          }
          .sarathi-footer-main {
            padding: 10px 14px 20px 14px !important;
          }
          .footer-links-container {
            flex-direction: column !important;
            gap: 14px !important;
          }
          .footer-link-col {
            width: 100% !important;
          }
        }

      `}} />

                {/* Form fields (readonly) */}
                <div className="dl-form-center-wrapper">
                  <div className="dl-form-group">
                    <label>Driving Licence No. *</label>
                    <input type="text" className="dl-form-control" value={license.license_number} disabled readOnly />
                  </div>
                  <div className="dl-form-group">
                    <label>Date Of Birth (DOB) *</label>
                    <input type="text" className="dl-form-control" value={license.dob || '-'} disabled readOnly />
                  </div>
                  <div className="dl-btn-group">
                    <Link href="/" className="dl-btn">Check Status</Link>
                    <Link href="/" className="dl-btn">Reset</Link>
                  </div>
                </div>

                {/* 1. Details Of Driving License */}
                <div className="dl-table-title">Details Of Driving License: {license.license_number}</div>
                <table className="dl-table">
                  <tbody>
                    <tr><th>Current Status</th><td>{license.status || 'ACTIVE'}</td></tr>
                    <tr><th>Holder&apos;s Name</th><td>{license.name}</td></tr>
                    <tr><th>Old / New DL No.</th><td>NA</td></tr>
                    <tr><th>Source Of Data</th><td>SARATHI</td></tr>
                  </tbody>
                </table>

                {/* 2. Driving License Initial Details */}
                <div className="dl-table-title">Driving License Initial Details</div>
                <table className="dl-table">
                  <tbody>
                    <tr><th>Initial Issue Date</th><td>{license.first_issue_date || license.issue_date || '-'}</td></tr>
                    <tr><th>Initial Issuing Office</th><td>{license.auth_office || 'LA,BARRACKPORE'}</td></tr>
                  </tbody>
                </table>

                {/* 3. Driving License Endorsed Details */}
                <div className="dl-table-title">Driving License Endorsed Details</div>
                <table className="dl-table">
                  <tbody>
                    <tr><th>Last Endorsed Date</th><td>{license.validity_nt || license.issue_date || '-'}</td></tr>
                    <tr><th>Last Endorsed Office</th><td>{license.auth_office || 'LA,KASBA'}</td></tr>
                    <tr><th>Last Completed Transaction</th><td>CHANGE OF ADDRESS IN DL , RENEWAL OF DL</td></tr>
                  </tbody>
                </table>

                {/* 4. Driving License Validity Details */}
                <div className="dl-table-title">Driving License Validity Details</div>
                <table className="dl-table">
                  <tbody>
                    <tr>
                      <th>Non-Transport</th>
                      <td>FROM: {license.issue_date || '-'}</td>
                      <td>TO: {license.validity_nt || '-'}</td>
                    </tr>
                    <tr>
                      <th>Transport</th>
                      <td>FROM: {license.validity_tr ? license.issue_date : 'NA'}</td>
                      <td>TO: {license.validity_tr || 'NA'}</td>
                    </tr>
                    <tr>
                      <th>Hazardous Valid Till</th>
                      <td>NA</td>
                      <th style={{ width: 'auto' }}>Hill Valid Till</th>
                      <td>NA</td>
                    </tr>
                  </tbody>
                </table>

                {/* 5. Class Of Vehicle Details */}
                <div className="dl-table-title">Class Of Vehicle Details</div>
                <table className="dl-table dl-cov-table">
                  <thead>
                    <tr>
                      <th>COV Category</th>
                      <th>Class Of Vehicle</th>
                      <th>COV Issue Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getVehicleRows().map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.category}</td>
                        <td>{row.covClass}</td>
                        <td>{row.issueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer matching landing page */}
      <div className="sarathi-footer-wrap">
        <div className="sarathi-footer-top">
          Best viewed in Google Chrome 140+, Microsoft Edge 140+, Mozilla Firefox 140+, and Opera 120+ browsers. Recommended screen resolution: 1366 * 768 or higher.
        </div>
        
        <div className="sarathi-footer-main">
          <div className="footer-logos">
            <div className="nic-section">
              <div className="nic-text">Designed, developed and hosted by <span>DLIMS</span></div>
              <img src="/logo-1.png" alt="Logo" style={{height: '40px', width: 'auto', objectFit: 'contain', marginTop: '5px'}} />
            </div>
            <img className="di-logo" src="/digital_logo_main-1.png" alt="Digital Logo" />
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
              <a href="#">Acts & Rules</a>
              <a href="#">Screen Reader</a>
            </div>
            <div className="footer-link-col">
              <a href="#">Contact Us</a>
              <a href="#">Feedback / Complaints</a>
              <a href="#">FAQs</a>
            </div>
            <div className="footer-link-col">
              <a href="#">Parivahan</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
        
        <div className="sarathi-footer-bottom">
          Correctness of the translation into the regional language lies with the respective State Transport Department.
        </div>
      </div>
    </>
  );
}
