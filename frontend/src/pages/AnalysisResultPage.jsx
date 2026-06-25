import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resumeService } from '../services/resumeService';

/* ── Circular ATS Score Ring ───────────────────────────────── */
const ScoreRing = ({ score }) => {
  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const color =
    score >= 80 ? '#10B981' :
    score >= 60 ? '#F59E0B' :
    '#EF4444';

  const label =
    score >= 80 ? 'Excellent' :
    score >= 60 ? 'Good' :
    score >= 40 ? 'Fair' : 'Needs Work';

  return (
    <div className="ats-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
        />
        {/* fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease', filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="ats-score-value">
        <div style={{ fontSize: '2.2rem', fontWeight: 800, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>/100</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
};

/* ── Section Card ──────────────────────────────────────────── */
const SectionCard = ({ title, icon, iconBg, iconColor, items = [], emptyMsg, chip: ChipEl }) => (
  <div className="card-dark p-4 h-100">
    <div className="d-flex align-items-center gap-2 mb-3">
      <div
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: iconBg, color: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.95rem', flexShrink: 0,
        }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <h6 style={{ fontFamily: 'var(--font-display)', marginBottom: 0, fontSize: '0.95rem' }}>{title}</h6>
      <span
        className="ms-auto"
        style={{
          fontSize: '0.7rem', fontWeight: 700,
          background: iconBg, color: iconColor,
          padding: '2px 10px', borderRadius: 100,
        }}
      >
        {items.length}
      </span>
    </div>

    {items.length === 0 ? (
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{emptyMsg || 'None identified.'}</p>
    ) : ChipEl ? (
      <div className="d-flex flex-wrap gap-2">
        {items.map((item, i) => <ChipEl key={i} text={item} />)}
      </div>
    ) : (
      <div>
        {items.map((item, i) => (
          <div key={i} className="analysis-item">
            <div
              className="analysis-item-icon"
              style={{ background: iconBg, color: iconColor, minWidth: 28, height: 28, fontSize: '0.75rem' }}
            >
              {i + 1}
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ── Chip variants ─────────────────────────────────────────── */
const TechChip = ({ text }) => (
  <span className="badge-primary" style={{ cursor: 'default' }}>
    <i className="bi bi-code-slash me-1" style={{ fontSize: '0.7rem' }}></i>{text}
  </span>
);

const JobChip = ({ text }) => (
  <span className="badge-success" style={{ cursor: 'default' }}>
    <i className="bi bi-briefcase-fill me-1" style={{ fontSize: '0.7rem' }}></i>{text}
  </span>
);

const MissingChip = ({ text }) => (
  <span className="badge-danger" style={{ cursor: 'default' }}>{text}</span>
);

/* ── Download helper ───────────────────────────────────────── */
const downloadReport = (analysis) => {
  const lines = [
    '╔══════════════════════════════════════════╗',
    '║         RESUMEAI PRO — ANALYSIS REPORT        ║',
    '╚══════════════════════════════════════════╝',
    '',
    `File       : ${analysis.fileName || 'Resume'}`,
    `Date       : ${new Date(analysis.createdAt).toLocaleString()}`,
    `ATS Score  : ${analysis.atsScore}/100`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  STRENGTHS',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ...(analysis.strengths || []).map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  MISSING SKILLS',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ...(analysis.missingSkills || []).map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  IMPROVEMENT SUGGESTIONS',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ...(analysis.suggestions || []).map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  RECOMMENDED TECHNOLOGIES',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ...(analysis.recommendedTechnologies || []).map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  RECOMMENDED PROJECTS',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ...(analysis.recommendedProjects || []).map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  MATCHING JOB ROLES',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ...(analysis.jobRoles || []).map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  Generated by ResumeAI Pro — Powered by Gemini AI',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ResumeAI_Report_${analysis.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ── Main Page ─────────────────────────────────────────────── */
const AnalysisResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await resumeService.getAnalysisById(id);
      if (res.success) setAnalysis(res.data);
      else throw new Error(res.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load analysis.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAnalysis(); }, [fetchAnalysis]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await resumeService.deleteAnalysis(id);
      navigate('/history');
    } catch {
      setError('Failed to delete analysis.');
      setDeleting(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="fade-in-up">
        <div className="skeleton mb-4" style={{ height: 48, width: 280 }} />
        <div className="row g-3">
          <div className="col-lg-4"><div className="skeleton" style={{ height: 260 }} /></div>
          <div className="col-lg-8"><div className="skeleton" style={{ height: 260 }} /></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="col-md-6"><div className="skeleton" style={{ height: 200 }} /></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 fade-in-up">
        <i className="bi bi-exclamation-triangle-fill d-block mb-3"
          style={{ fontSize: '3rem', color: 'var(--color-danger)' }} />
        <h4>Something went wrong</h4>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <Link to="/history" className="btn-primary-custom">← Back to History</Link>
      </div>
    );
  }

  const scoreColor =
    analysis.atsScore >= 80 ? 'var(--color-accent)' :
    analysis.atsScore >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div className="fade-in-up">

      {/* ── Header ── */}
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Link to="/history" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              ← History
            </Link>
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
            Analysis Report
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 0 }}>
            <i className="bi bi-file-earmark-pdf-fill me-1" style={{ color: '#EF4444' }}></i>
            {analysis.fileName || 'Resume'} &nbsp;·&nbsp;
            {new Date(analysis.createdAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn-ghost d-flex align-items-center gap-2"
            onClick={() => downloadReport(analysis)}
            style={{ fontSize: '0.85rem' }}
          >
            <i className="bi bi-download"></i> Download Report
          </button>
          <button
            className="btn-ghost d-flex align-items-center gap-2"
            onClick={handleDelete}
            disabled={deleting}
            style={{ fontSize: '0.85rem', borderColor: 'rgba(239,68,68,0.3)', color: '#FCA5A5' }}
          >
            <i className="bi bi-trash3"></i>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
          <button
            className="btn-primary-custom"
            onClick={() => navigate('/upload')}
            style={{ fontSize: '0.85rem' }}
          >
            <i className="bi bi-plus-circle-fill"></i> New Analysis
          </button>
        </div>
      </div>

      {/* ── Top row: Score + Summary ── */}
      <div className="row g-3 mb-3">

        {/* Score card */}
        <div className="col-lg-4">
          <div
            className="card-dark p-4 h-100 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(6,182,212,0.06) 100%)',
              border: '1px solid rgba(79,70,229,0.25)',
            }}
          >
            <h6 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
              ATS Score
            </h6>
            <div className="d-flex justify-content-center mb-4">
              <ScoreRing score={analysis.atsScore} />
            </div>

            {/* mini progress bars */}
            {[
              { label: 'Keyword Match', val: Math.min(100, analysis.atsScore + 5) },
              { label: 'Formatting',    val: Math.min(100, analysis.atsScore - 5) },
              { label: 'Completeness',  val: Math.min(100, analysis.atsScore + 3) },
            ].map(({ label, val }) => (
              <div key={label} className="mb-2 text-start">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: '0.75rem', color: scoreColor, fontWeight: 600 }}>{val}%</span>
                </div>
                <div className="progress-dark">
                  <div className="progress-fill" style={{ width: `${val}%`, background: scoreColor }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="col-lg-8">
          <SectionCard
            title="Resume Strengths"
            icon="bi-stars"
            iconBg="rgba(16,185,129,0.15)"
            iconColor="#34D399"
            items={analysis.strengths || []}
            emptyMsg="No specific strengths identified."
          />
        </div>
      </div>

      {/* ── Second row ── */}
      <div className="row g-3 mb-3">
        <div className="col-lg-6">
          <SectionCard
            title="Missing Skills & Keywords"
            icon="bi-exclamation-triangle-fill"
            iconBg="rgba(239,68,68,0.12)"
            iconColor="#FCA5A5"
            items={analysis.missingSkills || []}
            emptyMsg="No critical missing skills detected."
            chip={MissingChip}
          />
        </div>
        <div className="col-lg-6">
          <SectionCard
            title="Improvement Suggestions"
            icon="bi-pencil-square"
            iconBg="rgba(245,158,11,0.12)"
            iconColor="#FCD34D"
            items={analysis.suggestions || []}
            emptyMsg="No suggestions at this time."
          />
        </div>
      </div>

      {/* ── Third row ── */}
      <div className="row g-3 mb-3">
        <div className="col-lg-6">
          <SectionCard
            title="Recommended Technologies"
            icon="bi-code-slash"
            iconBg="rgba(79,70,229,0.12)"
            iconColor="var(--color-primary-light)"
            items={analysis.recommendedTechnologies || []}
            emptyMsg="No technology recommendations."
            chip={TechChip}
          />
        </div>
        <div className="col-lg-6">
          <SectionCard
            title="Matching Job Roles"
            icon="bi-briefcase-fill"
            iconBg="rgba(6,182,212,0.12)"
            iconColor="var(--color-secondary)"
            items={analysis.jobRoles || []}
            emptyMsg="No matching roles identified."
            chip={JobChip}
          />
        </div>
      </div>

      {/* ── Projects row ── */}
      <div className="row g-3">
        <div className="col-12">
          <div className="card-dark p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(16,185,129,0.12)',
                  color: '#34D399',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.95rem',
                }}
              >
                <i className="bi bi-kanban-fill"></i>
              </div>
              <h6 style={{ fontFamily: 'var(--font-display)', marginBottom: 0, fontSize: '0.95rem' }}>
                Recommended Projects to Build
              </h6>
              <span
                className="ms-auto"
                style={{
                  fontSize: '0.7rem', fontWeight: 700,
                  background: 'rgba(16,185,129,0.12)', color: '#34D399',
                  padding: '2px 10px', borderRadius: 100,
                }}
              >
                {(analysis.recommendedProjects || []).length}
              </span>
            </div>

            {(analysis.recommendedProjects || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No project recommendations.</p>
            ) : (
              <div className="row g-3">
                {(analysis.recommendedProjects || []).map((project, idx) => (
                  <div key={idx} className="col-md-6 col-xl-4">
                    <div
                      className="p-3 rounded-3 h-100"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <div
                          style={{
                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                            background: 'rgba(16,185,129,0.15)', color: '#34D399',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {project}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div
        className="card-dark p-4 mt-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(6,182,212,0.06) 100%)',
          border: '1px solid rgba(79,70,229,0.2)',
        }}
      >
        <div>
          <h6 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            Ready to improve your resume?
          </h6>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 0 }}>
            Apply the suggestions above and re-upload for a new score.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn-ghost" onClick={() => downloadReport(analysis)} style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-download me-1"></i> Save Report
          </button>
          <button className="btn-primary-custom" onClick={() => navigate('/upload')} style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-arrow-repeat me-1"></i> Re-analyze
          </button>
        </div>
      </div>

    </div>
  );
};

export default AnalysisResultPage;
