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

export default function DlStatusPage() {
  const params = useParams();
  const router = useRouter();
  const rawLicense = (params?.license as string) || '';
  const decodedLicense = decodeURIComponent(rawLicense).replace(/-/g, ' ');

  const [loading, setLoading] = useState(true);
  const [license, setLicense] = useState<LicenseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState({ date: '', time: '' });

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
        const res = await fetch(`/api/verify?license=${encodeURIComponent(rawLicense)}`);
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
        .sarathi-header-wrap { background-color: #21a3f0; color: #fff; font-family: Arial, sans-serif; border-bottom: 2px solid #005680; }
        .sarathi-header { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; }
        
        .header-left-col { display: flex; align-items: center; gap: 15px; width: 33%; }
        .header-emblem { height: 75px; background: #fff; border-radius: 50%; padding: 2px; box-shadow: 0 0 5px rgba(0,0,0,0.2); }
        .header-gov-text { line-height: 1.3; }
        .header-gov-text .hi-text { font-size: 16px; font-weight: 400; margin-bottom: 2px; font-family: 'Roboto Condensed', Arial, sans-serif; }
        .header-gov-text .en-text-1 { font-size: 16px; font-weight: 700; margin-bottom: 2px; font-family: 'Roboto Condensed', Arial, sans-serif; letter-spacing: 0.5px; }
        .header-gov-text .en-text-2 { font-size: 15px; font-weight: 400; font-family: 'Roboto Condensed', Arial, sans-serif; letter-spacing: 0.3px; }

        .header-mid-col { display: flex; align-items: center; justify-content: center; width: 33%; }
        .sarathi-center-logo { max-height: 55px; width: auto; object-fit: contain; }

        .header-right-col { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; justify-content: flex-end; width: 33%; }
        .datetime-block { font-size: 13px; font-weight: bold; display: flex; gap: 10px; }
        .lang-block { font-size: 14px; display: flex; align-items: center; gap: 5px; }
        .lang-icon { color: #1a237e; font-weight: bold; font-size: 20px; display: flex; align-items: flex-end; line-height: 1; }
        .lang-icon sub { font-size: 12px; margin-bottom: -3px; }
        
        .font-size-block { display: flex; gap: 5px; }
        .font-size-btn { background: #0c87cc; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #086b9f; font-weight: bold; cursor: pointer; }
        
        @media (max-width: 992px) {
            .sarathi-header { flex-direction: column; text-align: center; gap: 15px; padding: 15px 10px; }
            .header-left-col, .header-mid-col, .header-right-col { width: 100%; justify-content: center; }
            .header-left-col { flex-direction: column; text-align: center; }
            .header-right-col { flex-direction: column; align-items: center; gap: 12px; }
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

      {/* Header Banner matching landing page */}
      <div className="sarathi-header-wrap">
        <div className="sarathi-header">
          <div className="header-left-col">
            <img src="/demo2.png" alt="Left Logo" style={{height: '75px', width: 'auto', objectFit: 'contain', background: 'none'}} />
            <div className="header-gov-text">
              <div className="hi-text">सड़क परिवहन और राजमार्ग मंत्रालय भारत सरकार</div>
              <div className="en-text-1">MINISTRY OF ROAD TRANSPORT &amp; HIGHWAYS</div>
              <div className="en-text-2">Government of India</div>
            </div>
          </div>
          
          <div className="header-mid-col">
            <img className="sarathi-center-logo" src="/logo.png" alt="Logo" />
          </div>

          <div className="header-right-col">
            <div className="datetime-block">
              <span>DATE: <span id="live-date">{currentTime.date}</span></span>
              <span>TIME: <span id="live-time">{currentTime.time}</span></span>
            </div>
            <div className="lang-block">
              Language: <span className="lang-icon">अ<sub>A</sub></span>
            </div>
            <div className="font-size-block">
              <span className="font-size-btn">A-</span>
              <span className="font-size-btn">A</span>
              <span className="font-size-btn">A+</span>
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
