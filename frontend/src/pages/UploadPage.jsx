import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../services/resumeService';

const TIPS = [
  { icon: 'bi-check-circle-fill', color: 'var(--color-accent)', text: 'Use a text-based PDF (not scanned)' },
  { icon: 'bi-check-circle-fill', color: 'var(--color-accent)', text: 'Include quantified achievements (e.g. "increased sales by 30%")' },
  { icon: 'bi-check-circle-fill', color: 'var(--color-accent)', text: 'Add relevant keywords from job descriptions' },
  { icon: 'bi-check-circle-fill', color: 'var(--color-accent)', text: 'Keep file size under 10MB' },
];

const STEPS = [
  { icon: 'bi-cloud-upload-fill', label: 'Uploading PDF', detail: 'Sending your resume...' },
  { icon: 'bi-file-earmark-text-fill', label: 'Extracting Text', detail: 'Reading resume content...' },
  { icon: 'bi-robot', label: 'AI Analysis', detail: 'Gemini is analyzing your resume...' },
  { icon: 'bi-bar-chart-fill', label: 'Generating Report', detail: 'Scoring and building insights...' },
];

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = useCallback((selectedFile) => {
    setError('');
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are accepted. Please select a .pdf file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large. Please upload a PDF under 10MB.');
      return;
    }
    setFile(selectedFile);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  }, [handleFile]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const simulateSteps = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      setAnalysisStep(i);
      await new Promise(r => setTimeout(r, i === 2 ? 8000 : 1500));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a PDF file first.'); return; }

    setUploading(true);
    setError('');
    setUploadProgress(0);
    setAnalysisStep(0);

    try {
      simulateSteps();

      const response = await resumeService.analyzeResume(file, (progressEvent) => {
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        }
      });

      if (response.success) {
        navigate(`/analysis/${response.data.id}`);
      } else {
        throw new Error(response.message || 'Analysis failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
      setError(msg);
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fade-in-up" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="mb-4">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Analyze Resume</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Upload your PDF resume and get a comprehensive AI-powered analysis
        </p>
      </div>

      {/* Analysis in Progress */}
      {uploading && (
        <div className="card-dark p-4 mb-4" style={{ border: '1px solid rgba(79, 70, 229, 0.3)' }}>
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: 64, height: 64,
                background: 'var(--gradient-primary)',
                fontSize: '1.75rem'
              }}
            >
              <i className={`bi ${STEPS[analysisStep]?.icon} text-white`}></i>
            </div>
            <h5 style={{ fontFamily: 'var(--font-display)' }}>{STEPS[analysisStep]?.label}</h5>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {STEPS[analysisStep]?.detail}
            </p>
          </div>

          <div className="row g-2 mb-4">
            {STEPS.map((step, idx) => (
              <div key={idx} className="col-3">
                <div
                  className="text-center p-2 rounded-3"
                  style={{
                    background: idx <= analysisStep ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-surface)',
                    border: `1px solid ${idx <= analysisStep ? 'rgba(79, 70, 229, 0.4)' : 'var(--border-color)'}`,
                    transition: 'all 0.4s ease'
                  }}
                >
                  <i
                    className={`bi ${step.icon} d-block mb-1`}
                    style={{
                      fontSize: '1.1rem',
                      color: idx <= analysisStep ? 'var(--color-primary-light)' : 'var(--text-muted)'
                    }}
                  ></i>
                  <div style={{ fontSize: '0.65rem', color: idx <= analysisStep ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {step.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div>
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload progress</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>{uploadProgress}%</span>
              </div>
              <div className="progress-dark">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <p className="text-center mt-3 mb-0" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <i className="bi bi-info-circle me-1"></i>
            AI analysis may take up to 30 seconds. Please don't close this window.
          </p>
        </div>
      )}

      {!uploading && (
        <>
          {error && (
            <div className="alert-dark mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Drop Zone */}
            <div
              className={`upload-zone mb-4 ${dragging ? 'dragging' : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => !file && fileInputRef.current?.click()}
              style={{ cursor: file ? 'default' : 'pointer' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFile(e.target.files[0])}
                style={{ display: 'none' }}
              />

              {file ? (
                <div>
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{
                      width: 64, height: 64,
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '1.75rem', color: '#EF4444'
                    }}
                  >
                    <i className="bi bi-file-earmark-pdf-fill"></i>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {file.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
                    {formatSize(file.size)}
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <i className="bi bi-arrow-repeat me-1"></i>
                    Replace file
                  </button>
                </div>
              ) : (
                <div>
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: 72, height: 72,
                      background: 'rgba(79, 70, 229, 0.1)',
                      border: '2px dashed rgba(79, 70, 229, 0.3)',
                      fontSize: '1.75rem',
                      color: 'var(--color-primary-light)',
                      transition: 'all 0.3s'
                    }}
                  >
                    <i className="bi bi-cloud-arrow-up-fill"></i>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>
                    Drop your resume here
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
                    Drag & drop or click to browse
                  </p>
                  <span className="badge-primary">PDF only · Max 10MB</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary-custom w-100 justify-content-center py-3"
              disabled={!file}
              style={{ fontSize: '1rem' }}
            >
              <i className="bi bi-robot"></i>
              Analyze with AI
            </button>
          </form>

          {/* Tips */}
          <div className="card-dark p-4 mt-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-lightbulb-fill" style={{ color: 'var(--color-warning)' }}></i>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font-display)' }}>
                Tips for a better ATS score
              </span>
            </div>
            <div className="row g-2">
              {TIPS.map((tip, idx) => (
                <div key={idx} className="col-12 col-sm-6">
                  <div className="d-flex align-items-start gap-2">
                    <i className={`bi ${tip.icon}`} style={{ color: tip.color, fontSize: '0.85rem', marginTop: 2, flexShrink: 0 }}></i>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{tip.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UploadPage;
