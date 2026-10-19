'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ImageCropperModal from '@/components/ui/ImageCropperModal';
import TemplateSelectorTabs, { TemplateId } from '@/components/admin/licenses/form/TemplateSelectorTabs';
import LicenceIdentificationSection from '@/components/admin/licenses/form/LicenceIdentificationSection';
import ValidityDatesSection from '@/components/admin/licenses/form/ValidityDatesSection';
import DriverPersonalSection from '@/components/admin/licenses/form/DriverPersonalSection';
import VehicleClassSection from '@/components/admin/licenses/form/VehicleClassSection';
import PhotoSignaturesSection from '@/components/admin/licenses/form/PhotoSignaturesSection';
import LiveCardPreview from '@/components/admin/licenses/preview/LiveCardPreview';









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
      window.history.replaceState({}, '', '/something/licenses/new');
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
        payloadData.auth_title = payloadData.auth_title || 'Licensing Authority';
      }
      payloadData.mcwg_code = payloadData.mcwg_code || 'MCWG';
      payloadData.lmv_code = payloadData.lmv_code || 'LMV';
      if (currentTab === '2') {
        payloadData.mcwg_category = payloadData.mcwg_category || 'NT';
        payloadData.lmv_category = payloadData.lmv_category || 'NT';
      }

      try {
        const res = await fetch('/api/public/generate', {
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

  // Initial query param check and edit record pre-fill
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const editParam = params.get('edit') || params.get('id');
    const tParam = params.get('t') as TemplateId;

    if (editParam) {
      if (loadedEditIdRef.current === editParam) return;
      loadedEditIdRef.current = editParam;
      setLoadingEdit(true);

      fetch(`/api/admin/licenses/${encodeURIComponent(editParam)}`)
        .then((r) => r.json())
        .then((rec) => {
          if (rec && !rec.error) {
            const tmpl: TemplateId =
              rec.template === '2' || rec.template === '3' ? rec.template : (tParam || '1');
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
            if (rec.auth_signature_url) {
              setAuthSigs((s) => ({ ...s, [tmpl]: rec.auth_signature_url }));
            }

            // Immediately trigger preview generation for loaded record
            triggerGeneration(tmpl, mapped, rec.photo_url || null, rec.signature_url || null, rec.auth_signature_url || null);
          }
        })
        .catch((err) => console.error('Failed to load edit record:', err))
        .finally(() => setLoadingEdit(false));
    } else {
      if (tParam && (tParam === '1' || tParam === '2' || tParam === '3')) {
        setActiveTab(tParam);
      }
      if (isInitialMount.current) {
        const initialTab = tParam && (tParam === '1' || tParam === '2' || tParam === '3') ? tParam : '1';
        triggerGeneration(initialTab, formData[initialTab]);
      }
    }
  }, [triggerGeneration]);

  // Live real-time preview (120ms debounce) on user changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      triggerGeneration(activeTab, formData[activeTab]);
    }, 120);
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
          auth_signature_url: authSigs[activeTab],
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
      downloadData.auth_title = downloadData.auth_title || 'Licensing Authority';
    }
    downloadData.mcwg_code = downloadData.mcwg_code || 'MCWG';
    downloadData.lmv_code = downloadData.lmv_code || 'LMV';
    if (activeTab === '2') {
      downloadData.mcwg_category = downloadData.mcwg_category || 'NT';
      downloadData.lmv_category = downloadData.lmv_category || 'NT';
    }
    try {
      const res = await fetch('/api/public/generate', {
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

      <TemplateSelectorTabs
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onLoadPreset={loadPreset}
      />

      <div className="row g-3">
        {/* LEFT COLUMN: DATA INPUT FORM */}
        <div className={`col-12 col-xl-6 ${mobileView === 'preview' ? 'd-none d-xl-block' : 'd-block'}`}>
          <LicenceIdentificationSection
            activeTab={activeTab}
            currentData={currentData}
            updateField={updateField}
          />
          <ValidityDatesSection
            currentData={currentData}
            updateField={updateField}
          />
          <DriverPersonalSection
            activeTab={activeTab}
            currentData={currentData}
            updateField={updateField}
          />
          <VehicleClassSection
            currentData={currentData}
            updateField={updateField}
          />
          <PhotoSignaturesSection
            activeTab={activeTab}
            photos={photos}
            holderSigs={holderSigs}
            authSigs={authSigs}
            onFileSelected={onFileSelected}
            onClearPhoto={() => setPhotos((p) => ({ ...p, [activeTab]: null }))}
            onClearHolderSig={() => setHolderSigs((p) => ({ ...p, [activeTab]: null }))}
            onClearAuthSig={() => setAuthSigs((p) => ({ ...p, [activeTab]: null }))}
            onSaveToDirectory={handleSaveToDirectory}
            savingRecord={savingRecord}
            editId={editId}
          />
        </div>

        {/* RIGHT COLUMN: LIVE CARD PREVIEW */}
        <div className={`col-12 col-xl-6 ${mobileView === 'form' ? 'd-none d-xl-block' : 'd-block'}`}>
          <LiveCardPreview
            generating={generating}
            errorMessage={errorMessage}
            cardPreviewUri={cardPreviewUri}
            downloading={downloading}
            downloadingPdf={downloadingPdf}
            onRefresh={() => triggerGeneration(activeTab, formData[activeTab])}
            onDownload={handleDownload}
            onClearError={() => setErrorMessage(null)}
          />
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
