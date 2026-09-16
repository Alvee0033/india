'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ImageCropperModal from '@/components/ImageCropperModal';

type TemplateId = '1' | '2' | '3';

interface TemplateInfo {
  id: TemplateId;
  name: string;
  badge: string;
  desc: string;
  icon: string;
}

const TEMPLATES: TemplateInfo[] = [
  { id: '1', name: 'Template 1', badge: 'UP / Union', desc: 'Standard Smart Card with Chip & Stamp', icon: 'fa-id-card' },
  { id: '2', name: 'Template 2', badge: 'Punjab State', desc: 'High-Res Licence with Micro-pattern & QR', icon: 'fa-shield-halved' },
  { id: '3', name: 'Template 3', badge: 'Kerala State', desc: 'Kerala DL with Dual Address & Matrix', icon: 'fa-address-card' },
];

const EMPTY_DATA: Record<TemplateId, Record<string, string>> = {
  '1': {
    dl_no: '', state: 'Uttar Pradesh', state_code: 'UP', issue_date: '', validity_nt: '', validity_tr: '', first_issue_date: '',
    name: '', dob: '', blood_group: '', organ_donor: '', relation: '', address: '', auth_title: 'Licensing Authority', auth_office: '',
    emergency_contact: '', mcwg_issued_by: '', mcwg_date: '', lmv_issued_by: '', lmv_date: '',
  },
  '2': {
    dl_no: '', top_right_code: '', issue_date: '', validity_nt: '', validity_tr: '', first_issue_date: '',
    name: '', dob: '', blood_group: '', organ_donor: '', relation: '', address_1: '', address_2: '',
    auth_office: '', emergency_contact: '', qr_data: '',
    mcwg_code: 'MCWG', mcwg_issued_by: '', mcwg_date: '', mcwg_category: 'NT',
    lmv_code: 'LMV', lmv_issued_by: '', lmv_date: '', lmv_category: 'NT',
  },
  '3': {
    dl_no: '', issue_date: '', validity_nt: '', validity_tr: '', first_issue_date: '',
    name: '', dob: '', blood_group: '', organ_donor: '', relation: '',
    perm_address_1: '', perm_address_2: '', perm_address_3: '',
    pres_address_1: '', pres_address_2: '', pres_address_3: '',
    mcwg_code: 'MCWG', mcwg_issued_by: '', mcwg_date: '',
    lmv_code: 'LMV', lmv_issued_by: '', lmv_date: '',
    emergency_contact: '', auth_office: '',
  },
};

const DEFAULT_SAMPLE_DATA: Record<TemplateId, Record<string, string>> = {
  '1': {
    dl_no: 'UP16 20180045921', state: 'Uttar Pradesh', state_code: 'UP',
    issue_date: '24-05-2018', validity_nt: '13-08-2036', validity_tr: '23-05-2023', first_issue_date: '24-05-2018',
    name: 'ADITYA SHARMA', dob: '14-08-1996', blood_group: 'B+', organ_donor: 'YES', relation: 'Rajesh Sharma',
    address: 'H.NO 42, SECTOR 18, NOIDA, GAUTAM BUDDHA NAGAR, U.P. - 201301',
    auth_title: 'Licensing Authority', auth_office: 'UP16 NOIDA', emergency_contact: '+91 9876543210',
    mcwg_issued_by: 'UP16', mcwg_date: '24-05-2018', lmv_issued_by: 'UP16', lmv_date: '24-05-2018',
  },
  '2': {
    dl_no: 'PB35 20210005691', top_right_code: 'PBDL000002570487',
    issue_date: '14-06-2021', validity_nt: '13-06-2031', validity_tr: '13-06-2031', first_issue_date: '14-06-2021',
    name: 'JIBIN KUMAR P', dob: '16-06-1995', blood_group: 'O- VE', organ_donor: 'N', relation: 'K M BABU',
    address_1: 'THIRUVATHIRA, HENTRY ROAD, PAPPINISSRI', address_2: 'P O, Pappinisseri S.O, Kannur, Kerala - 670561',
    auth_office: 'RTO PATHANKOT', emergency_contact: '', qr_data: '',
    mcwg_code: 'MCWG', mcwg_issued_by: 'PB35', mcwg_date: '14-06-2021', mcwg_category: 'NT',
    lmv_code: 'LMV', lmv_issued_by: 'PB35', lmv_date: '14-06-2021', lmv_category: 'NT',
  },
  '3': {
    dl_no: 'KL55 20199185172',
    issue_date: '06-12-2019', validity_nt: '05-12-2034', validity_tr: '', first_issue_date: '06-12-2019',
    name: 'JIBIN KUMAR PUTHALATH', dob: '16-06-1995', blood_group: 'B+', organ_donor: 'No', relation: 'BABU KAVINISSERI MADATHIL',
    perm_address_1: 'SO KANNUR KERALA', perm_address_2: 'THIRUVATHIRA HENTRY ROAD', perm_address_3: 'PAPPINISSRI PO PAPPINISSERI',
    pres_address_1: 'SO KANNUR KERALA', pres_address_2: 'THIRUVATHIRA HENTRY ROAD', pres_address_3: 'PAPPINISSRI PO PAPPINISSERI',
    mcwg_code: 'MCWG', mcwg_issued_by: 'KL 55', mcwg_date: '06-12-2019',
    lmv_code: 'LMV', lmv_issued_by: 'KL 55', lmv_date: '06-12-2019',
    emergency_contact: '', auth_office: 'THIRUVATHIRA',
  },
};

const BD_DEMO_DATA: Record<TemplateId, Record<string, string>> = {
  '1': {
    dl_no: 'PB35 20220008841', state: 'Uttar Pradesh', state_code: 'UP',
    issue_date: '05-03-2022', validity_nt: '04-03-2037', validity_tr: '04-03-2027', first_issue_date: '05-03-2022',
    name: 'MD RAFIQUL ISLAM', dob: '12-04-1990', blood_group: 'B+', organ_donor: 'NO', relation: 'MD ABUL HOSSAIN',
    address: 'H.NO 12, MIRPUR ROAD, SECTION 10, DHAKA NORTH - 1216',
    auth_title: 'Licensing Authority', auth_office: 'PB35 PATHANKOT', emergency_contact: '+91 9876500001',
    mcwg_issued_by: 'PB35', mcwg_date: '05-03-2022', lmv_issued_by: 'PB35', lmv_date: '05-03-2022',
  },
  '2': {
    dl_no: 'PB36 20190003375', top_right_code: 'PBDL000001924736',
    issue_date: '18-07-2019', validity_nt: '17-07-2029', validity_tr: '17-07-2029', first_issue_date: '18-07-2019',
    name: 'FATEMA BEGUM', dob: '22-09-1985', blood_group: 'A+ VE', organ_donor: 'Y', relation: 'MD KARIM UDDIN',
    address_1: 'VILL CHAR FASSON, BARISAL ROAD, WARD 5', address_2: 'Barisal Sadar, Barisal - 8200',
    auth_office: 'RTO LUDHIANA', emergency_contact: '', qr_data: '',
    mcwg_code: 'MCWG', mcwg_issued_by: 'PB36', mcwg_date: '18-07-2019', mcwg_category: 'NT',
    lmv_code: 'LMV', lmv_issued_by: 'PB36', lmv_date: '18-07-2019', lmv_category: 'NT',
  },
  '3': {
    dl_no: 'KL55 20230011562',
    issue_date: '29-11-2023', validity_nt: '28-11-2038', validity_tr: '', first_issue_date: '29-11-2023',
    name: 'SHAHIDUL HAQUE', dob: '03-01-1998', blood_group: 'O+', organ_donor: 'No', relation: 'MD NURUL HAQUE',
    perm_address_1: 'FLAT 4B, GREEN ROAD', perm_address_2: 'DHANMONDI, DHAKA SOUTH', perm_address_3: 'DHAKA - 1205',
    pres_address_1: 'FLAT 4B, GREEN ROAD', pres_address_2: 'DHANMONDI, DHAKA SOUTH', pres_address_3: 'DHAKA - 1205',
    mcwg_code: 'MCWG', mcwg_issued_by: 'KL 55', mcwg_date: '29-11-2023',
    lmv_code: 'LMV', lmv_issued_by: 'KL 55', lmv_date: '29-11-2023',
    emergency_contact: '', auth_office: 'DHANMONDI',
  },
};

export default function AdminNewLicensePage() {
  const [activeTab, setActiveTab] = useState<TemplateId>('1');
  const [formData, setFormData] = useState<Record<TemplateId, Record<string, string>>>(EMPTY_DATA);

  // Mobile View Switcher: 'form' | 'preview'
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  // Photos & Signatures
  const [photos, setPhotos] = useState<Record<TemplateId, string | null>>({ '1': null, '2': null, '3': null });
  const [holderSigs, setHolderSigs] = useState<Record<TemplateId, string | null>>({ '1': null, '2': null, '3': null });
  const [authSigs, setAuthSigs] = useState<Record<TemplateId, string | null>>({ '1': null, '2': null, '3': null });

  // Preview & Generation
  const [cardPreviewUri, setCardPreviewUri] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [savingRecord, setSavingRecord] = useState<boolean>(false);
  const [saveAlert, setSaveAlert] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef<boolean>(true);
  const loadedEditIdRef = useRef<string | null>(null);

  // Synchronized state refs so triggerGeneration remains referentially stable
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const holderSigsRef = useRef(holderSigs);
  holderSigsRef.current = holderSigs;
  const authSigsRef = useRef(authSigs);
  authSigsRef.current = authSigs;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  // Edit Mode state
  const [editId, setEditId] = useState<string | null>(null);
  const [editingLicNumber, setEditingLicNumber] = useState<string>('');
  const [loadingEdit, setLoadingEdit] = useState<boolean>(false);

  // Cropper Modal
  const [cropperConfig, setCropperConfig] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
    title: string;
    aspectRatio: number;
    targetWidth: number;
    targetHeight: number;
    isSignature: boolean;
    slot: 'photo' | 'holder_sig' | 'auth_sig';
  }>({
    isOpen: false, imageSrc: null, title: '', aspectRatio: 1, targetWidth: 400, targetHeight: 400, isSignature: false, slot: 'photo',
  });

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [key]: value },
    }));
  };

  const loadPreset = (type: 'default' | 'bd' | 'empty') => {
    if (type === 'empty') {
      setFormData((prev) => ({ ...prev, [activeTab]: { ...EMPTY_DATA[activeTab] } }));
      setPhotos((p) => ({ ...p, [activeTab]: null }));
      setHolderSigs((p) => ({ ...p, [activeTab]: null }));
      setAuthSigs((p) => ({ ...p, [activeTab]: null }));
      return;
    }
    const src = type === 'bd' ? BD_DEMO_DATA : DEFAULT_SAMPLE_DATA;
    setFormData((prev) => ({ ...prev, [activeTab]: { ...src[activeTab] } }));
  };

  const handleCancelEdit = () => {
    setEditId(null);
    loadedEditIdRef.current = null;
    setEditingLicNumber('');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/admin/licenses/new');
    }
    loadPreset('default');
  };

  // Real-time card generator with stable reference
  const triggerGeneration = useCallback(
    async (
      tabToGen?: TemplateId,
      dataToUse?: Record<string, string>,
      photoOverride?: string | null,
      sigOverride?: string | null,
      authOverride?: string | null
    ) => {
      const currentTab = tabToGen || activeTabRef.current;
      const currentData = dataToUse || formDataRef.current[currentTab];
      const currentPhoto = photoOverride !== undefined ? photoOverride : photosRef.current[currentTab];
      const currentHolderSig = sigOverride !== undefined ? sigOverride : holderSigsRef.current[currentTab];
      const currentAuthSig = authOverride !== undefined ? authOverride : authSigsRef.current[currentTab];

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setGenerating(true);
      setErrorMessage(null);

      const payloadData = { ...currentData };
      if (currentTab === '1') {
        payloadData.state = 'Uttar Pradesh';
        payloadData.state_code = 'UP';
        payloadData.auth_title = payloadData.auth_title || 'Licensing Authority';
      }
      payloadData.mcwg_code = payloadData.mcwg_code || 'MCWG';
      payloadData.lmv_code = payloadData.lmv_code || 'LMV';
      if (currentTab === '2') {
        payloadData.mcwg_category = payloadData.mcwg_category || 'NT';
        payloadData.lmv_category = payloadData.lmv_category || 'NT';
      }

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            template: currentTab,
            data: payloadData,
            photo_base64: currentPhoto,
            holder_sig_base64: currentHolderSig,
            auth_sig_base64: currentAuthSig,
            preview: true,
          }),
        });

        const json = await res.json();
        if (abortControllerRef.current === controller) {
          if (json.success && json.imageBase64) {
            setCardPreviewUri(json.imageBase64);
            setErrorMessage(null);
          } else if (json.error) {
            setErrorMessage(json.error);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (abortControllerRef.current === controller) {
          console.error('Failed preview generation:', err);
          setErrorMessage(err.message || 'Error generating card');
        }
      } finally {
        if (abortControllerRef.current === controller) {
          setGenerating(false);
        }
      }
    },
    []
  );

  // Switching active template tab triggers generation immediately
  const handleTabChange = (newTab: TemplateId) => {
    setActiveTab(newTab);
    triggerGeneration(newTab, formData[newTab]);
  };

  // Initial query param check and edit record pre-fill (Runs ONCE per editParam)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const editParam = params.get('edit') || params.get('id');
    const tParam = params.get('t') as TemplateId;
    if (tParam && (tParam === '1' || tParam === '2' || tParam === '3')) {
      setActiveTab(tParam);
    }

    if (editParam && loadedEditIdRef.current !== editParam) {
      loadedEditIdRef.current = editParam;
      setLoadingEdit(true);
      fetch(`/api/admin/licenses/${encodeURIComponent(editParam)}`)
        .then((r) => r.json())
        .then((rec) => {
          if (rec && !rec.error) {
            const tmpl: TemplateId =
              rec.template === '2' || rec.template === '3' ? rec.template : '1';
            setActiveTab(tmpl);
            setEditId(rec.id);
            setEditingLicNumber(rec.license_number || rec.dl_no || rec.id);

            const base = { ...(EMPTY_DATA[tmpl] || {}) };
            const mapped: Record<string, string> = { ...base };
            mapped.dl_no = rec.license_number || rec.dl_no || '';
            mapped.name = rec.name || '';
            mapped.relation = rec.relation || '';
            mapped.dob = rec.dob || '';
            mapped.blood_group = rec.blood_group || '';
            mapped.organ_donor = rec.organ_donor || '';
            mapped.issue_date = rec.issue_date || '';
            mapped.validity_nt = rec.validity_nt || '';
            mapped.validity_tr = rec.validity_tr || '';
            mapped.first_issue_date = rec.first_issue_date || '';
            mapped.auth_office = rec.auth_office || '';
            mapped.auth_title = rec.auth_title || 'Licensing Authority';
            mapped.emergency_contact = rec.emergency_contact || '';

            if (tmpl === '1') {
              mapped.state = rec.state || 'Uttar Pradesh';
              mapped.state_code = rec.state_code || 'UP';
              mapped.address = rec.address || rec.address_1 || '';
              mapped.mcwg_issued_by = rec.mcwg_issued_by || '';
              mapped.mcwg_date = rec.mcwg_date || '';
              mapped.lmv_issued_by = rec.lmv_issued_by || '';
              mapped.lmv_date = rec.lmv_date || '';
            } else if (tmpl === '2') {
              mapped.top_right_code = rec.top_right_code || '';
              mapped.address_1 = rec.address_1 || rec.address || '';
              mapped.address_2 = rec.address_2 || '';
              mapped.qr_data = rec.qr_data || '';
              mapped.mcwg_code = rec.mcwg_code || 'MCWG';
              mapped.mcwg_issued_by = rec.mcwg_issued_by || '';
              mapped.mcwg_date = rec.mcwg_date || '';
              mapped.mcwg_category = rec.mcwg_category || 'NT';
              mapped.lmv_code = rec.lmv_code || 'LMV';
              mapped.lmv_issued_by = rec.lmv_issued_by || '';
              mapped.lmv_date = rec.lmv_date || '';
              mapped.lmv_category = rec.lmv_category || 'NT';
            } else if (tmpl === '3') {
              mapped.perm_address_1 = rec.perm_address_1 || rec.address_1 || rec.address || '';
              mapped.perm_address_2 = rec.perm_address_2 || rec.address_2 || '';
              mapped.perm_address_3 = rec.perm_address_3 || '';
              mapped.pres_address_1 = rec.pres_address_1 || rec.address_1 || rec.address || '';
              mapped.pres_address_2 = rec.pres_address_2 || rec.address_2 || '';
              mapped.pres_address_3 = rec.pres_address_3 || '';
              mapped.mcwg_code = rec.mcwg_code || 'MCWG';
              mapped.mcwg_issued_by = rec.mcwg_issued_by || '';
              mapped.mcwg_date = rec.mcwg_date || '';
              mapped.lmv_code = rec.lmv_code || 'LMV';
              mapped.lmv_issued_by = rec.lmv_issued_by || '';
              mapped.lmv_date = rec.lmv_date || '';
            }

            setFormData((prev) => ({ ...prev, [tmpl]: mapped }));

            if (rec.photo_url) {
              setPhotos((p) => ({ ...p, [tmpl]: rec.photo_url }));
            }
            if (rec.signature_url) {
              setHolderSigs((s) => ({ ...s, [tmpl]: rec.signature_url }));
            }

            // Immediately trigger generation for edit record
            triggerGeneration(tmpl, mapped, rec.photo_url || null, rec.signature_url || null);
          }
        })
        .catch((err) => console.error('Failed to load edit record:', err))
        .finally(() => setLoadingEdit(false));
    } else if (!editParam && isInitialMount.current) {
      triggerGeneration(activeTab, formData[activeTab]);
    }
  }, [triggerGeneration, activeTab]);

  // Live real-time preview (500ms debounce) on user changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      triggerGeneration(activeTab, formData[activeTab]);
    }, 500);
    return () => clearTimeout(timer);
  }, [formData, photos, holderSigs, authSigs, activeTab, triggerGeneration]);

  // Immediate preview trigger when switching to mobile preview tab
  useEffect(() => {
    if (mobileView === 'preview') {
      triggerGeneration(activeTab, formData[activeTab]);
    }
  }, [mobileView, activeTab, triggerGeneration]);

  // Save or Update in Directory
  const handleSaveToDirectory = async () => {
    const d = { ...formData[activeTab] };
    if (activeTab === '1') {
      d.state = 'Uttar Pradesh';
      d.state_code = 'UP';
      d.auth_title = d.auth_title || 'Licensing Authority';
    }
    d.mcwg_code = d.mcwg_code || 'MCWG';
    d.lmv_code = d.lmv_code || 'LMV';
    if (activeTab === '2') {
      d.mcwg_category = d.mcwg_category || 'NT';
      d.lmv_category = d.lmv_category || 'NT';
    }
    if (!d.dl_no && !d.name) {
      alert('Please fill in at least Driver Name or License Number before saving.');
      return;
    }

    setSavingRecord(true);
    setSaveAlert(null);
    try {
      const url = editId ? `/api/admin/licenses/${encodeURIComponent(editId)}` : '/api/admin/licenses';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...d,
          id: editId || undefined,
          license_number: d.dl_no || `TEMP_${Date.now()}`,
          template: activeTab,
          photo_base64: photos[activeTab],
          signature_url: holderSigs[activeTab],
        }),
      });
      if (res.ok) {
        setSaveAlert(
          editId
            ? `Record ${d.dl_no || ''} updated successfully in Directory!`
            : 'Record saved to Directory successfully!'
        );
        setTimeout(() => setSaveAlert(null), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save record');
      }
    } catch {
      alert('Error saving record');
    } finally {
      setSavingRecord(false);
    }
  };

  // Download high-resolution PNG or PDF
  const handleDownload = async (format: 'png' | 'pdf' = 'png') => {
    if (format === 'pdf') {
      setDownloadingPdf(true);
    } else {
      setDownloading(true);
    }
    const downloadData = { ...formData[activeTab] };
    if (activeTab === '1') {
      downloadData.state = 'Uttar Pradesh';
      downloadData.state_code = 'UP';
      downloadData.auth_title = downloadData.auth_title || 'Licensing Authority';
    }
    downloadData.mcwg_code = downloadData.mcwg_code || 'MCWG';
    downloadData.lmv_code = downloadData.lmv_code || 'LMV';
    if (activeTab === '2') {
      downloadData.mcwg_category = downloadData.mcwg_category || 'NT';
      downloadData.lmv_category = downloadData.lmv_category || 'NT';
    }
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: activeTab,
          data: downloadData,
          photo_base64: photos[activeTab],
          holder_sig_base64: holderSigs[activeTab],
          auth_sig_base64: authSigs[activeTab],
          download: true,
          format: format,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to download card');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dlNo = formData[activeTab].dl_no?.replace(/\s+/g, '_') || `template_${activeTab}`;
      a.href = url;
      a.download = `DL_${dlNo}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Download error');
    } finally {
      if (format === 'pdf') {
        setDownloadingPdf(false);
      } else {
        setDownloading(false);
      }
    }
  };

  // Image upload triggers cropper
  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>, slot: 'photo' | 'holder_sig' | 'auth_sig') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        if (slot === 'photo') {
          setCropperConfig({
            isOpen: true,
            imageSrc: src,
            title: 'Crop Driver Photo',
            aspectRatio: 310 / 330,
            targetWidth: 310,
            targetHeight: 330,
            isSignature: false,
            slot: 'photo',
          });
        } else if (slot === 'holder_sig') {
          setCropperConfig({
            isOpen: true,
            imageSrc: src,
            title: 'Crop Holder Signature',
            aspectRatio: 3 / 1,
            targetWidth: 300,
            targetHeight: 100,
            isSignature: true,
            slot: 'holder_sig',
          });
        } else {
          setCropperConfig({
            isOpen: true,
            imageSrc: src,
            title: 'Crop Authority Signature',
            aspectRatio: 3 / 1,
            targetWidth: 300,
            targetHeight: 100,
            isSignature: true,
            slot: 'auth_sig',
          });
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropComplete = (blob: Blob, dataUrl: string) => {
    if (cropperConfig.slot === 'photo') {
      setPhotos((prev) => ({ ...prev, [activeTab]: dataUrl }));
    } else if (cropperConfig.slot === 'holder_sig') {
      setHolderSigs((prev) => ({ ...prev, [activeTab]: dataUrl }));
    } else {
      setAuthSigs((prev) => ({ ...prev, [activeTab]: dataUrl }));
    }
    setCropperConfig((prev) => ({ ...prev, isOpen: false, imageSrc: null }));
  };

  const currentData = formData[activeTab];

  return (
    <div className="container-fluid p-0">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 mb-md-3">
        <div>
          <h2 className="admin-page-title mb-0 fs-5">Card Generator Engine</h2>
          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
            Multi-template print-ready generator with live sync
          </div>
        </div>

        <div className="d-flex align-items-center gap-1 gap-sm-2 flex-wrap">
          <button
            onClick={handleSaveToDirectory}
            disabled={savingRecord}
            className="btn btn-sm btn-primary d-flex align-items-center gap-1 py-1 px-2 px-sm-3 fw-bold rounded-pill shadow-sm"
            style={{ fontSize: '0.76rem' }}
          >
            <i className={`fas ${savingRecord ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
            <span>{savingRecord ? 'Saving…' : editId ? 'Update Record' : 'Save Record'}</span>
          </button>
          <button
            onClick={() => handleDownload('png')}
            disabled={downloading || downloadingPdf || generating}
            className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1 px-2 px-sm-3 fw-semibold rounded-pill shadow-sm"
            style={{ fontSize: '0.76rem' }}
          >
            <i className="fas fa-file-image"></i>
            <span>{downloading ? 'Exporting…' : 'Download PNG'}</span>
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloading || downloadingPdf || generating}
            className="btn btn-sm btn-danger d-flex align-items-center gap-1 py-1 px-2 px-sm-3 fw-semibold rounded-pill shadow-sm"
            style={{ fontSize: '0.76rem' }}
          >
            <i className="fas fa-file-pdf"></i>
            <span>{downloadingPdf ? 'Exporting…' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {loadingEdit && (
        <div className="alert alert-secondary py-2 px-3 small mb-2 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
          <span>Loading record for editing…</span>
        </div>
      )}

      {editId && !loadingEdit && (
        <div className="alert alert-info py-2 px-3 small mb-2 d-flex align-items-center justify-content-between flex-wrap gap-2 border-info shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white">EDIT MODE</span>
            <span>
              Updating Record: <strong className="font-monospace text-dark">{editingLicNumber}</strong> ({formData[activeTab].name || 'Driver'}) — Saving will update this record in the Directory.
            </span>
          </div>
          <button
            onClick={handleCancelEdit}
            className="btn btn-sm btn-outline-dark py-1 px-2 fw-semibold"
            style={{ fontSize: '0.72rem' }}
          >
            <i className="fas fa-times me-1"></i> Cancel / New Record
          </button>
        </div>
      )}

      {saveAlert && (
        <div className="alert alert-success py-2 px-3 small mb-2 d-flex align-items-center justify-content-between">
          <span><i className="fas fa-check-circle me-1"></i> {saveAlert}</span>
          <button onClick={() => setSaveAlert(null)} className="btn-close btn-close-sm"></button>
        </div>
      )}

      {/* Mobile-Only Segmented Switcher (Form vs Live Preview) */}
      <div className="d-xl-none bg-white p-1 rounded-pill border mb-2 d-flex shadow-sm">
        <button
          onClick={() => setMobileView('form')}
          className={`btn flex-fill rounded-pill py-1 fw-bold ${
            mobileView === 'form' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'
          }`}
          style={{ fontSize: '0.78rem' }}
        >
          <i className="fas fa-pen-to-square me-1"></i> Edit Form
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`btn flex-fill rounded-pill py-1 fw-bold position-relative ${
            mobileView === 'preview' ? 'btn-success text-white shadow-sm' : 'btn-light text-muted'
          }`}
          style={{ fontSize: '0.78rem' }}
        >
          <i className="fas fa-eye me-1"></i> Card Preview
          {generating && (
            <span className="position-absolute top-50 end-0 translate-middle-y me-2 spinner-border spinner-border-sm text-warning" />
          )}
        </button>
      </div>

      {/* Template Selector — Mobile Swiper / Desktop Cards */}
      <div className="d-flex d-md-none overflow-x-auto gap-2 pb-2 mb-2 no-scrollbar">
        {TEMPLATES.map((tmpl) => {
          const isSel = activeTab === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => handleTabChange(tmpl.id)}
              className={`mobile-segment-btn ${isSel ? 'active' : ''}`}
            >
              <i className={`fas ${tmpl.icon} me-1`}></i>
              {tmpl.name} ({tmpl.badge})
            </button>
          );
        })}
      </div>

      {/* Desktop 3-Card Template Selector */}
      <div className="row g-2 mb-3 d-none d-md-flex">
        {TEMPLATES.map((tmpl) => {
          const isSel = activeTab === tmpl.id;
          return (
            <div key={tmpl.id} className="col-4">
              <div
                onClick={() => handleTabChange(tmpl.id)}
                className={`p-2 p-lg-3 rounded-3 border transition-all cursor-pointer ${
                  isSel ? 'bg-white shadow-sm border-success' : 'bg-white border-light opacity-75'
                }`}
                style={{
                  cursor: 'pointer',
                  borderWidth: isSel ? '2px' : '1px',
                  borderColor: isSel ? '#10b981' : '#e2e8f0',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className={`rounded-2 p-1 px-2 d-flex align-items-center justify-content-center ${
                        isSel ? 'bg-success text-white' : 'bg-secondary bg-opacity-10 text-muted'
                      }`}
                      style={{ fontSize: '0.8rem' }}
                    >
                      <i className={`fas ${tmpl.icon}`}></i>
                    </div>
                    <span className="fw-bold text-dark small">{tmpl.name}</span>
                  </div>
                  <span className={isSel ? 'badge-status-valid' : 'badge bg-light text-muted border'} style={{ fontSize: '0.68rem' }}>
                    {tmpl.badge}
                  </span>
                </div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>
                  {tmpl.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Presets Bar */}
      <div className="d-flex justify-content-between align-items-center mb-2 mb-md-3 p-2 bg-white rounded border">
        <div className="d-flex align-items-center gap-1">
          <span className="badge bg-secondary bg-opacity-10 text-dark font-monospace" style={{ fontSize: '0.7rem' }}>
            {TEMPLATES.find((t) => t.id === activeTab)?.badge}
          </span>
          <span className="text-muted d-none d-sm-inline" style={{ fontSize: '0.72rem' }}>
            Live typing syncs to card
          </span>
        </div>
        <div className="d-flex gap-1">
          <button
            onClick={() => loadPreset('empty')}
            className="btn btn-sm btn-outline-danger py-1 px-2"
            style={{ fontSize: '0.72rem' }}
            title="Clear all fields"
          >
            <i className="fas fa-eraser me-1"></i> Clear
          </button>
          <button
            onClick={() => loadPreset('default')}
            className="btn btn-sm btn-outline-secondary py-1 px-2"
            style={{ fontSize: '0.72rem' }}
          >
            <i className="fas fa-rotate-left me-1"></i> Sample
          </button>
          <button
            onClick={() => loadPreset('bd')}
            className="btn btn-sm btn-outline-primary py-1 px-2"
            style={{ fontSize: '0.72rem' }}
          >
            <i className="fas fa-flag text-danger me-1"></i> BD Demo
          </button>
        </div>
      </div>

      {/* Main Grid: Mobile View aware */}
      <div className="row g-3">
        {/* ════ LEFT COLUMN: DATA INPUT FORM ════ */}
        <div className={`col-12 col-xl-6 ${mobileView === 'preview' ? 'd-none d-xl-block' : 'd-block'}`}>
          {/* Section 1: Licence & Numbering */}
          <div className="admin-card mb-2 mb-md-3">
            <div className="admin-card-header py-2 px-3">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-hashtag text-success"></i>
                <h3 className="admin-card-title fs-6">1. Licence Identification</h3>
              </div>
            </div>
            <div className="p-2 p-md-3">
              <div className="row g-2">
                <div className={activeTab === '2' ? 'col-12 col-md-6' : 'col-12'}>
                  <label className="form-label small fw-bold text-secondary mb-1">DRIVING LICENCE NUMBER</label>
                  <input
                    type="text"
                    className="form-control font-monospace fw-bold"
                    placeholder="e.g. PB35 20210005691"
                    value={currentData.dl_no || ''}
                    onChange={(e) => updateField('dl_no', e.target.value)}
                  />
                </div>

                {activeTab === '2' && (
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-bold text-secondary mb-1">BACK TOP-RIGHT CODE</label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="e.g. PBDL000002570487"
                      value={currentData.top_right_code || ''}
                      onChange={(e) => updateField('top_right_code', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Dates & Validity */}
          <div className="admin-card mb-2 mb-md-3">
            <div className="admin-card-header py-2 px-3">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-calendar-days text-success"></i>
                <h3 className="admin-card-title fs-6">2. Dates &amp; Validity</h3>
              </div>
            </div>
            <div className="p-2 p-md-3">
              <div className="row g-2">
                <div className="col-6 col-md-3">
                  <label className="form-label small fw-bold text-secondary mb-1">ISSUE DATE</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="DD-MM-YYYY"
                    value={currentData.issue_date || ''}
                    onChange={(e) => updateField('issue_date', e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label small fw-bold text-secondary mb-1">VALIDITY (NT)</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="DD-MM-YYYY"
                    value={currentData.validity_nt || ''}
                    onChange={(e) => updateField('validity_nt', e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label small fw-bold text-secondary mb-1">VALIDITY (TR)</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="Optional"
                    value={currentData.validity_tr || ''}
                    onChange={(e) => updateField('validity_tr', e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label small fw-bold text-secondary mb-1">FIRST ISSUE</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="DD-MM-YYYY"
                    value={currentData.first_issue_date || ''}
                    onChange={(e) => updateField('first_issue_date', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Driver Personal Details */}
          <div className="admin-card mb-2 mb-md-3">
            <div className="admin-card-header py-2 px-3">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-user-tie text-success"></i>
                <h3 className="admin-card-title fs-6">3. Personal Profile</h3>
              </div>
            </div>
            <div className="p-2 p-md-3">
              <div className="row g-2 mb-2">
                <div className="col-12 col-md-7">
                  <label className="form-label small fw-bold text-secondary mb-1">DRIVER FULL NAME</label>
                  <input
                    type="text"
                    className="form-control fw-bold"
                    placeholder="e.g. MD RAFIQUL ISLAM"
                    value={currentData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-5">
                  <label className="form-label small fw-bold text-secondary mb-1">RELATION / GUARDIAN</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MD ABUL HOSSAIN"
                    value={currentData.relation || ''}
                    onChange={(e) => updateField('relation', e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-2 mb-2">
                <div className="col-4">
                  <label className="form-label small fw-bold text-secondary mb-1">DATE OF BIRTH</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="DD-MM-YYYY"
                    value={currentData.dob || ''}
                    onChange={(e) => updateField('dob', e.target.value)}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold text-secondary mb-1">BLOOD GROUP</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. B+ VE"
                    value={currentData.blood_group || ''}
                    onChange={(e) => updateField('blood_group', e.target.value)}
                  />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold text-secondary mb-1">ORGAN DONOR</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="YES / NO"
                    value={currentData.organ_donor || ''}
                    onChange={(e) => updateField('organ_donor', e.target.value)}
                  />
                </div>
              </div>

              {/* Addresses */}
              {activeTab === '1' && (
                <div className="mb-2">
                  <label className="form-label small fw-bold text-secondary mb-1">ADDRESS</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    placeholder="House / Street, Area, City, District, PIN..."
                    value={currentData.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </div>
              )}

              {activeTab === '2' && (
                <div className="row g-2 mb-2">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-secondary mb-1">ADDRESS LINE 1</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Village / House / Road / Ward..."
                      value={currentData.address_1 || ''}
                      onChange={(e) => updateField('address_1', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-secondary mb-1">ADDRESS LINE 2</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="City, District, State, PIN..."
                      value={currentData.address_2 || ''}
                      onChange={(e) => updateField('address_2', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === '3' && (
                <div className="row g-2 mb-2">
                  <div className="col-12 col-md-6">
                    <span className="badge bg-light text-dark border mb-1">Permanent Address</span>
                    <input
                      type="text"
                      placeholder="Permanent Line 1"
                      className="form-control mb-1"
                      value={currentData.perm_address_1 || ''}
                      onChange={(e) => updateField('perm_address_1', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Permanent Line 2"
                      className="form-control mb-1"
                      value={currentData.perm_address_2 || ''}
                      onChange={(e) => updateField('perm_address_2', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Permanent Line 3"
                      className="form-control"
                      value={currentData.perm_address_3 || ''}
                      onChange={(e) => updateField('perm_address_3', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <span className="badge bg-light text-dark border mb-1">Present Address</span>
                    <input
                      type="text"
                      placeholder="Present Line 1"
                      className="form-control mb-1"
                      value={currentData.pres_address_1 || ''}
                      onChange={(e) => updateField('pres_address_1', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Present Line 2"
                      className="form-control mb-1"
                      value={currentData.pres_address_2 || ''}
                      onChange={(e) => updateField('pres_address_2', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Present Line 3"
                      className="form-control"
                      value={currentData.pres_address_3 || ''}
                      onChange={(e) => updateField('pres_address_3', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-secondary mb-1">LICENSING OFFICE</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    placeholder="e.g. UP16 NOIDA&#10;UTTAR PRADESH"
                    value={currentData.auth_office || ''}
                    onChange={(e) => updateField('auth_office', e.target.value)}
                  />
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>Press Enter for multiple lines</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold text-secondary mb-1">EMERGENCY PHONE</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Optional"
                    value={currentData.emergency_contact || ''}
                    onChange={(e) => updateField('emergency_contact', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Vehicle Class Authorisation */}
          <div className="admin-card mb-2 mb-md-3">
            <div className="admin-card-header py-2 px-3">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-car text-success"></i>
                <h3 className="admin-card-title fs-6">4. Vehicle Class Authorisation</h3>
              </div>
            </div>
            <div className="p-2 p-md-3">
              <div className="row g-2">
                {/* MCWG */}
                <div className="col-12 col-md-6">
                  <div className="p-2 border rounded bg-light">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="fas fa-motorcycle text-primary"></i>
                      <span className="fw-bold small">Motorcycle (MCWG)</span>
                    </div>
                    <div className="row g-1">
                      <div className="col-6">
                        <label className="form-label small text-muted mb-0" style={{ fontSize: '0.65rem' }}>ISSUED BY</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. PB35"
                          value={currentData.mcwg_issued_by || ''}
                          onChange={(e) => updateField('mcwg_issued_by', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small text-muted mb-0" style={{ fontSize: '0.65rem' }}>DATE</label>
                        <input
                          type="text"
                          className="form-control font-monospace"
                          placeholder="DD-MM-YYYY"
                          value={currentData.mcwg_date || ''}
                          onChange={(e) => updateField('mcwg_date', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* LMV */}
                <div className="col-12 col-md-6">
                  <div className="p-2 border rounded bg-light">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="fas fa-car text-success"></i>
                      <span className="fw-bold small">Light Motor Vehicle (LMV)</span>
                    </div>
                    <div className="row g-1">
                      <div className="col-6">
                        <label className="form-label small text-muted mb-0" style={{ fontSize: '0.65rem' }}>ISSUED BY</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. PB35"
                          value={currentData.lmv_issued_by || ''}
                          onChange={(e) => updateField('lmv_issued_by', e.target.value)}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small text-muted mb-0" style={{ fontSize: '0.65rem' }}>DATE</label>
                        <input
                          type="text"
                          className="form-control font-monospace"
                          placeholder="DD-MM-YYYY"
                          value={currentData.lmv_date || ''}
                          onChange={(e) => updateField('lmv_date', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Photo & Signatures with Cropper */}
          <div className="admin-card mb-2 mb-md-3">
            <div className="admin-card-header py-2 px-3">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-camera text-success"></i>
                <h3 className="admin-card-title fs-6">5. Photo &amp; Signatures</h3>
              </div>
            </div>
            <div className="p-2 p-md-3">
              <div className="row g-2">
                {/* Photo */}
                <div className="col-12 col-md-4">
                  <div className="border rounded p-2 text-center bg-light h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="fw-bold small mb-1">Driver Photo</div>
                      {photos[activeTab] ? (
                        <img
                          src={photos[activeTab]!}
                          alt="Photo"
                          className="img-thumbnail mb-2"
                          style={{ width: 80, height: 90, objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="bg-white border rounded d-flex flex-column align-items-center justify-content-center mx-auto mb-2 text-muted"
                          style={{ width: 80, height: 90 }}
                        >
                          <i className="fas fa-user fa-2x opacity-25 mb-1"></i>
                          <span style={{ fontSize: '0.62rem' }}>Empty</span>
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-1 justify-content-center">
                      <label className="btn btn-sm btn-outline-primary py-1 px-2 mb-0" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-crop-simple me-1"></i> Crop
                        <input
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={(e) => onFileSelected(e, 'photo')}
                        />
                      </label>
                      {photos[activeTab] && (
                        <button
                          onClick={() => setPhotos((p) => ({ ...p, [activeTab]: null }))}
                          className="btn btn-sm btn-outline-danger py-1 px-2"
                          style={{ fontSize: '0.72rem' }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Holder Signature */}
                <div className="col-12 col-md-4">
                  <div className="border rounded p-2 text-center bg-light h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="fw-bold small mb-1">Holder Signature</div>
                      {holderSigs[activeTab] ? (
                        <img
                          src={holderSigs[activeTab]!}
                          alt="Holder Sig"
                          className="img-thumbnail mb-2"
                          style={{ width: 120, height: 50, objectFit: 'contain', background: '#fff' }}
                        />
                      ) : (
                        <div
                          className="bg-white border rounded d-flex flex-column align-items-center justify-content-center mx-auto mb-2 text-muted"
                          style={{ width: 120, height: 50 }}
                        >
                          <i className="fas fa-signature fa-lg opacity-25 mb-1"></i>
                          <span style={{ fontSize: '0.62rem' }}>Empty</span>
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-1 justify-content-center">
                      <label className="btn btn-sm btn-outline-primary py-1 px-2 mb-0" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-crop-simple me-1"></i> Crop
                        <input
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={(e) => onFileSelected(e, 'holder_sig')}
                        />
                      </label>
                      {holderSigs[activeTab] && (
                        <button
                          onClick={() => setHolderSigs((p) => ({ ...p, [activeTab]: null }))}
                          className="btn btn-sm btn-outline-danger py-1 px-2"
                          style={{ fontSize: '0.72rem' }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Authority Signature */}
                <div className="col-12 col-md-4">
                  <div className="border rounded p-2 text-center bg-light h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="fw-bold small mb-1">Authority Signature</div>
                      {authSigs[activeTab] ? (
                        <img
                          src={authSigs[activeTab]!}
                          alt="Auth Sig"
                          className="img-thumbnail mb-2"
                          style={{ width: 120, height: 50, objectFit: 'contain', background: '#fff' }}
                        />
                      ) : (
                        <div
                          className="bg-white border rounded d-flex flex-column align-items-center justify-content-center mx-auto mb-2 text-muted"
                          style={{ width: 120, height: 50 }}
                        >
                          <i className="fas fa-stamp fa-lg opacity-25 mb-1"></i>
                          <span style={{ fontSize: '0.62rem' }}>Official Stamp</span>
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-1 justify-content-center">
                      {activeTab === '3' ? (
                        <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Not used in T3</span>
                      ) : (
                        <>
                          <label className="btn btn-sm btn-outline-primary py-1 px-2 mb-0" style={{ fontSize: '0.72rem' }}>
                            <i className="fas fa-crop-simple me-1"></i> Crop
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={(e) => onFileSelected(e, 'auth_sig')}
                            />
                          </label>
                          {authSigs[activeTab] && (
                            <button
                              onClick={() => setAuthSigs((p) => ({ ...p, [activeTab]: null }))}
                              className="btn btn-sm btn-outline-danger py-1 px-2"
                              style={{ fontSize: '0.72rem' }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Action Button */}
          <div className="mt-3 mb-4">
            <button
              type="button"
              onClick={handleSaveToDirectory}
              disabled={savingRecord}
              className="btn btn-primary w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 rounded-3"
              style={{ fontSize: '0.92rem' }}
            >
              <i className={`fas ${savingRecord ? 'fa-spinner fa-spin' : 'fa-floppy-disk'} fa-lg`}></i>
              <span>{savingRecord ? 'Saving Record to Directory…' : editId ? 'Update Record in Directory' : 'Save Record to Directory'}</span>
            </button>
          </div>
        </div>

        {/* ════ RIGHT COLUMN: LIVE CARD PREVIEW ════ */}
        <div className={`col-12 col-xl-6 ${mobileView === 'form' ? 'd-none d-xl-block' : 'd-block'}`}>
          <div className="preview-sticky-wrapper" style={{ position: 'sticky', top: '75px' }}>
            <div className="admin-card">
              <div className="admin-card-header py-2 px-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-eye text-success"></i>
                  <h3 className="admin-card-title fs-6">Live Card Preview</h3>
                </div>
                <div className="d-flex align-items-center gap-2">
                  {generating ? (
                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1 small">
                      <i className="fas fa-spinner fa-spin me-1"></i> Syncing…
                    </span>
                  ) : (
                    <span className="badge-status-valid">Instant Sync</span>
                  )}
                </div>
              </div>

              <div className="p-2 p-md-3">
                {errorMessage && (
                  <div className="alert alert-danger py-2 px-3 small mb-2 d-flex align-items-center justify-content-between">
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="btn-close btn-close-sm"></button>
                  </div>
                )}

                {/* High-Resolution Preview Canvas Box */}
                <div
                  className="position-relative border rounded-3 bg-dark d-flex align-items-center justify-content-center overflow-hidden p-1 p-md-2"
                  style={{ minHeight: 280 }}
                >
                  {generating && (
                    <div
                      className="position-absolute inset-0 bg-dark bg-opacity-50 backdrop-blur d-flex align-items-center justify-content-center"
                      style={{ zIndex: 10, width: '100%', height: '100%' }}
                    >
                      <div className="spinner-border text-success" role="status" style={{ width: '2.5rem', height: '2.5rem' }}></div>
                    </div>
                  )}

                  {cardPreviewUri ? (
                    <img
                      src={cardPreviewUri}
                      alt="Driving Licence Card"
                      className="img-fluid rounded shadow"
                      style={{ width: '100%', height: 'auto', maxHeight: '72vh', objectFit: 'contain', display: 'block' }}
                    />
                  ) : (
                    <div className="text-center text-muted p-4">
                      {generating ? (
                        <>
                          <div className="spinner-border text-success mb-2" role="status"></div>
                          <p className="small mb-0">Generating live card preview…</p>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-id-card fa-3x mb-2 opacity-25"></i>
                          <p className="small mb-2">Live card preview not loaded yet.</p>
                          <button
                            type="button"
                            onClick={() => triggerGeneration(activeTab, formData[activeTab])}
                            className="btn btn-sm btn-outline-success"
                          >
                            <i className="fas fa-rotate me-1"></i> Generate Card Preview
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-wrap gap-2 mt-2 mt-md-3">
                  <button
                    onClick={() => triggerGeneration(activeTab, formData[activeTab])}
                    disabled={generating}
                    className="btn btn-outline-secondary flex-fill fw-semibold py-2"
                    style={{ fontSize: '0.82rem', minWidth: '100px' }}
                  >
                    <i className={`fas fa-sync-alt me-1 ${generating ? 'fa-spin' : ''}`}></i>
                    Refresh
                  </button>
                  <button
                    onClick={() => handleDownload('png')}
                    disabled={downloading || downloadingPdf || generating}
                    className="btn btn-success flex-fill fw-semibold py-2 shadow-sm"
                    style={{ fontSize: '0.82rem', minWidth: '120px' }}
                  >
                    <i className="fas fa-file-image me-1"></i>
                    {downloading ? 'Exporting…' : 'Download PNG'}
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={downloading || downloadingPdf || generating}
                    className="btn btn-danger flex-fill fw-semibold py-2 shadow-sm"
                    style={{ fontSize: '0.82rem', minWidth: '120px' }}
                  >
                    <i className="fas fa-file-pdf me-1"></i>
                    {downloadingPdf ? 'Exporting…' : 'Export PDF'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Preview Switcher FAB on Mobile when in form view */}
      {mobileView === 'form' && (
        <button
          onClick={() => setMobileView('preview')}
          className="d-xl-none mobile-preview-fab btn btn-success shadow d-flex align-items-center gap-2"
        >
          <i className="fas fa-eye"></i>
          <span>Preview Card</span>
          {generating && <span className="spinner-border spinner-border-sm" />}
        </button>
      )}

      {/* Interactive Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperConfig.isOpen}
        imageSrc={cropperConfig.imageSrc}
        title={cropperConfig.title}
        aspectRatio={cropperConfig.aspectRatio}
        targetWidth={cropperConfig.targetWidth}
        targetHeight={cropperConfig.targetHeight}
        isSignature={cropperConfig.isSignature}
        onCrop={handleCropComplete}
        onCancel={() => setCropperConfig((prev) => ({ ...prev, isOpen: false, imageSrc: null }))}
      />
    </div>
  );
}
