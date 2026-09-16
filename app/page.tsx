'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';

export default function PublicSearchPage() {
  const router = useRouter();

  const [dlNumber, setDlNumber] = useState('');
  const [dob, setDob] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState({ date: '', time: '' });

  // Generate random 5-character alphanumeric captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 5; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaCode(res);
    setUserCaptcha('');
  };

  useEffect(() => {
    generateCaptcha();

    // Check query params (?verify=... or ?license=...)
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
  }, []);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDl = dlNumber.trim();
    if (!cleanDl) { setError('Please enter a valid Driving Licence Number.'); return; }

    if (userCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Incorrect verification code. Please re-enter the code shown in the image.');
      generateCaptcha();
      return;
    }

    try {
      const res = await fetch(
        `/api/verify?license=${encodeURIComponent(cleanDl)}&dob=${encodeURIComponent(dob.trim())}`
      );
      const data = await res.json();

      if (res.ok && data.success && data.record) {
        const routeParam = cleanDl.replace(/\s+/g, '-').toLowerCase();
        router.push(`/dl-status/${routeParam}`);
      } else {
        setError(data.error || 'No records found. Please check your DL No. and DOB.');
      }
    } catch (err) {
      setError('Network error connecting to verification server.');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, Helvetica, sans-serif; background-color: #fff; color: #333; }
        
        .container { max-width: 1350px; margin: 30px auto; padding: 0 20px; }
        .panel { border: 1px solid #bce8f1; border-radius: 4px; margin-bottom: 20px; }
        .panel-heading { background-color: #d9edf7; color: #31708f; padding: 10px 15px; font-weight: bold; border-bottom: 1px solid #bce8f1; font-size: 14px; }
        .panel-body { padding: 30px 40px; background: #fdfdfd; }
        
        .form-center-wrapper { width: 100%; display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
        .form-group { display: flex; align-items: center; margin-bottom: 15px; width: 100%; max-width: 500px; justify-content: space-between; }
        .form-group label { color: #d9534f; font-size: 12px; font-weight: normal; text-align: left; width: 45%; }
        .form-control { width: 50%; padding: 5px 8px; border: 1px solid #006495; border-radius: 2px; font-size: 12px; text-transform: uppercase; }
        
        .captcha-box { display: flex; align-items: center; gap: 10px; width: 50%; }
        .captcha-img { background: #888; color: #000; width: 90px; height: 30px; display: flex; align-items: center; justify-content: center; font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: 900; letter-spacing: 2px; }
        .captcha-input { width: 70px; padding: 5px 8px; border: 1px solid #006495; border-radius: 2px; }
        
        .btn-group-2 { display: flex; gap: 10px; margin-top: 10px; justify-content: center; width: 100%; }
        .btn-check { background: #f0f0f0; border: 1px solid #aaa; padding: 4px 14px; font-weight: bold; cursor: pointer; font-size: 13px; border-radius: 3px; color: #000; font-family: Arial, sans-serif; box-shadow: 1px 1px 2px rgba(0,0,0,0.15); }
        .btn-check:hover { background: #e0e0e0; }
        .btn-check:active { background: #d0d0d0; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2); }
        
        .note-section { font-size: 12px; line-height: 1.8; color: #000; }
        .note-section p { margin: 4px 0; }
        .text-red { color: #d9534f; }
        
        .terms-title { text-align: center; color: #31708f; font-size: 22px; text-decoration: underline; margin: 30px 0 15px 0; font-family: 'Times New Roman', Times, serif; }
        .terms-section { border: 1px solid #999; padding: 20px 25px; font-size: 12px; color: #333; line-height: 1.7; border-radius: 4px; }
        .terms-section ul { margin: 0; padding-left: 20px; }
        .terms-section li { margin-bottom: 10px; }
        
        .error-msg { color: red; font-size: 13px; text-align: center; margin-bottom: 15px; display: none; }
        
        @media (max-width: 768px) {
            .form-group { flex-direction: column; align-items: flex-start; }
            .form-group label { width: 100%; margin-bottom: 5px; }
            .form-control, .captcha-box { width: 100%; }
        }

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

      <div className="container">
          <div className="panel">
              <div className="panel-heading">Know Your Driving Licence Status</div>
              <div className="panel-body">
                  {error && <div className="error-msg" style={{display: 'block'}}>{error}</div>}
                  
                  <div className="form-center-wrapper">
                      <form onSubmit={handleCheckStatus} style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                          <div className="form-group">
                              <label>Driving Licence No. *</label>
                              <input type="text" name="dl_no" className="form-control" placeholder="ENTER DRIVING LICENCE NO." value={dlNumber} onChange={(e) => setDlNumber(e.target.value)} required />
                          </div>
                          <div className="form-group">
                              <label>Date Of Birth (DOB) *</label>
                              <input type="text" name="dob" className="form-control" placeholder="SELECT DATE OF BIRTH" value={dob} onChange={(e) => setDob(e.target.value)} required />
                          </div>
                          <div className="form-group">
                              <label>Enter Verification Code *</label>
                              <div className="captcha-box">
                                  <div className="captcha-img">{captchaCode}</div>
                                  <input type="text" className="captcha-input" value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} required />
                              </div>
                          </div>
                          <div style={{display:'flex', gap:'10px', marginTop:'10px', justifyContent:'center', width:'100%'}}>
                              <button type="submit" style={{background:'#f0f0f0', border:'1px solid #aaa', padding:'4px 14px', fontWeight:'bold', cursor:'pointer', fontSize:'13px', borderRadius:'3px', color:'#000', fontFamily:'Arial,sans-serif'}}>Check Status</button>
                              <button type="button" onClick={() => {setDlNumber(''); setDob(''); setUserCaptcha(''); setError(null);}} style={{background:'#f0f0f0', border:'1px solid #aaa', padding:'4px 14px', fontWeight:'bold', cursor:'pointer', fontSize:'13px', borderRadius:'3px', color:'#000', fontFamily:'Arial,sans-serif'}}>Reset</button>
                          </div>
                      </form>
                  </div>
                  
                  <div className="note-section">
                      <p><b>Note:</b> - Driving Licence number can be entered in any of the following formats: DL-1420110012345 or DL14 20110012345</p>
                      <p className="text-red">Total number of input characters should be exactly 16 (including space (' ') or hyphen ('-')).</p>
                      <p className="text-red">If you hold an old driving license with a different format, please convert the format as per below rule before entering.</p>
                      <p className="text-red" style={{fontWeight: 'bold'}}>SS-RRYYYYNNNNNNN OR SSRR&lt;space&gt;YYYYNNNNNNN</p>
                      <p className="text-red">Where</p>
                      <p className="text-red">SS - Two character State Code (like RJ for Rajasthan, TN for Tamil Nadu etc)</p>
                      <p className="text-red">RR - Two digit RTO Code</p>
                      <p className="text-red">YYYY - 4-digit Year of Issue (For Example: If year is mentioned in 2 digits, say 99, then it should be converted to 1999. Similarly use 2012 for 12).</p>
                      <p className="text-red">Rest of the numbers are to be given in 7 digits. If there are less number of digits, then additional zeros (0's) may be added to make the total 7.</p>
                      <p className="text-red">For example: If the Driving Licence Number is RJ-13/DLC/12/123456 then please enter RJ-1320120123456 or RJ13 20120123456.</p>
                  </div>
              </div>
          </div>

          <div className="terms-title">Terms Of Uses</div>
          <div className="terms-section">
              <ul>
                  <li>The content on this portal is meant for sharing information regarding vehicles on the basis of information available on centralized VAHAN and vehicle National Register. Using content of this portal for any commercial purpose or any derivative work or misuse of any kind is strictly prohibited and may invite legal consequences.</li>
                  <li>The content can be removed from the portal without notice and at any time as per DLIMS direction.</li>
                  <li>DLIMS shall not be held responsible for any interactions/passing of information(s) etc. between any user via e-mail, chat and any other mediation with another user. DLIMS has no obligation to monitor any such disputes arising between the users and shall not be party to such dispute/litigation etc.</li>
                  <li>These terms and conditions shall be governed by and construed in accordance with the local Laws. Any dispute arising under these terms and conditions shall be subject to the jurisdiction of the courts of local territory only.</li>
              </ul>
          </div>
      </div>

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
