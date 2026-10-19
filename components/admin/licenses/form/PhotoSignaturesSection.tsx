'use client';

import React from 'react';
import { TemplateId } from './TemplateSelectorTabs';

interface PhotoSignaturesSectionProps {
  activeTab: TemplateId;
  photos: Record<TemplateId, string | null>;
  holderSigs: Record<TemplateId, string | null>;
  authSigs: Record<TemplateId, string | null>;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>, mode: 'photo' | 'holder_sig' | 'auth_sig') => void;
  onClearPhoto: () => void;
  onClearHolderSig: () => void;
  onClearAuthSig: () => void;
  onSaveToDirectory: () => void;
  savingRecord: boolean;
  editId: string | null;
}

export default function PhotoSignaturesSection({
  activeTab,
  photos,
  holderSigs,
  authSigs,
  onFileSelected,
  onClearPhoto,
  onClearHolderSig,
  onClearAuthSig,
  onSaveToDirectory,
  savingRecord,
  editId,
}: PhotoSignaturesSectionProps) {
  return (
    <>
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
                      onClick={onClearPhoto}
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
                      onClick={onClearHolderSig}
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
                          onClick={onClearAuthSig}
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

      <div className="mt-3 mb-4">
        <button
          type="button"
          onClick={onSaveToDirectory}
          disabled={savingRecord}
          className="btn btn-primary w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 rounded-3"
          style={{ fontSize: '0.92rem' }}
        >
          <i className={`fas ${savingRecord ? 'fa-spinner fa-spin' : 'fa-floppy-disk'} fa-lg`}></i>
          <span>{savingRecord ? 'Saving Record to Directory…' : editId ? 'Update Record in Directory' : 'Save Record to Directory'}</span>
        </button>
      </div>
    </>
  );
}
