'use client';

import React from 'react';

interface LiveCardPreviewProps {
  generating: boolean;
  errorMessage: string | null;
  cardPreviewUri: string | null;
  downloading: boolean;
  downloadingPdf: boolean;
  onRefresh: () => void;
  onDownload: (format: 'png' | 'pdf') => void;
  onClearError: () => void;
}

export default function LiveCardPreview({
  generating,
  errorMessage,
  cardPreviewUri,
  downloading,
  downloadingPdf,
  onRefresh,
  onDownload,
  onClearError,
}: LiveCardPreviewProps) {
  return (
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
              <button onClick={onClearError} className="btn-close btn-close-sm"></button>
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
                      onClick={onRefresh}
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
              onClick={onRefresh}
              disabled={generating}
              className="btn btn-outline-secondary flex-fill fw-semibold py-2"
              style={{ fontSize: '0.82rem', minWidth: '100px' }}
            >
              <i className={`fas fa-sync-alt me-1 ${generating ? 'fa-spin' : ''}`}></i>
              Refresh
            </button>
            <button
              onClick={() => onDownload('png')}
              disabled={downloading || downloadingPdf || generating}
              className="btn btn-success flex-fill fw-semibold py-2 shadow-sm"
              style={{ fontSize: '0.82rem', minWidth: '120px' }}
            >
              <i className="fas fa-file-image me-1"></i>
              {downloading ? 'Exporting…' : 'Download PNG'}
            </button>
            <button
              onClick={() => onDownload('pdf')}
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
  );
}
