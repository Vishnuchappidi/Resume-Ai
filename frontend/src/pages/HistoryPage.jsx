import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../services/resumeService';

const ScoreBadge = ({ score }) => {
  const config =
    score >= 80 ? { label: 'Excellent', bg: 'rgba(16,185,129,0.15)', color: '#34D399', border: 'rgba(16,185,129,0.3)' } :
    score >= 60 ? { label: 'Good',      bg: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: 'rgba(245,158,11,0.3)' } :
                  { label: 'Fair',      bg: 'rgba(239,68,68,0.15)',  color: '#FCA5A5', border: 'rgba(239,68,68,0.3)' };
  return (
    <span
      style={{
        background: config.bg, color: config.color,
        border: `1px solid ${config.border}`,
        padding: '3px 10px', borderRadius: 100,
        fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
};

const ScoreCircle = ({ score }) => {
  const color =
    score >= 80 ? '#10B981' :
    score >= 60 ? '#F59E0B' : '#EF4444';
  const size = 52, stroke = 5, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.78rem', fontWeight: 700, color,
        }}
      >
        {score}
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState('date_desc');
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage]           = useState(1);
  const PER_PAGE = 8;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await resumeService.getHistory();
      setHistory(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  /* filter + sort */
  useEffect(() => {
    let list = [...history];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        (a.fileName || '').toLowerCase().includes(q) ||
        (a.jobRoles || []).some(r => r.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'date_asc':  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'score_desc': list.sort((a, b) => b.atsScore - a.atsScore); break;
      case 'score_asc':  list.sort((a, b) => a.atsScore - b.atsScore); break;
      default:          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFiltered(list);
    setPage(1);
  }, [history, search, sortBy]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analysis? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await resumeService.deleteAnalysis(id);
      setHistory(prev => prev.filter(a => a.id !== id));
    } catch {
      setError('Failed to delete analysis. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  /* pagination */
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const avgScore = history.length
    ? Math.round(history.reduce((s, a) => s + (a.atsScore || 0), 0) / history.length)
    : 0;
  const bestScore = history.length ? Math.max(...history.map(a => a.atsScore || 0)) : 0;

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="fade-in-up">
        <div className="skeleton mb-4" style={{ height: 40, width: 200 }} />
        <div className="skeleton mb-3" style={{ height: 56 }} />
        {[1,2,3,4].map(i => <div key={i} className="skeleton mb-3" style={{ height: 80 }} />)}
      </div>
    );
  }

  return (
    <div className="fade-in-up">

      {/* ── Header ── */}
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Analysis History</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
            {history.length} resume{history.length !== 1 ? 's' : ''} analyzed
          </p>
        </div>
        <button
          className="btn-primary-custom"
          onClick={() => navigate('/upload')}
          style={{ fontSize: '0.875rem' }}
        >
          <i className="bi bi-plus-circle-fill"></i> New Analysis
        </button>
      </div>

      {/* ── Stats strip ── */}
      {history.length > 0 && (
        <div className="row g-3 mb-4">
          {[
            { icon: 'bi-files', label: 'Total Analyses', value: history.length, color: 'var(--color-primary-light)' },
            { icon: 'bi-graph-up', label: 'Average Score',  value: `${avgScore}%`,  color: 'var(--color-secondary)' },
            { icon: 'bi-trophy-fill', label: 'Best Score', value: `${bestScore}%`, color: 'var(--color-accent)' },
          ].map(s => (
            <div key={s.label} className="col-4">
              <div className="card-dark p-3 text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="alert-dark mb-3 d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle-fill"></i> {error}
        </div>
      )}

      {history.length === 0 ? (
        /* ── Empty state ── */
        <div className="card-dark p-5 text-center">
          <i className="bi bi-folder2-open d-block mb-3" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}></i>
          <h5 style={{ fontFamily: 'var(--font-display)' }}>No analyses yet</h5>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Upload your first resume to get started
          </p>
          <button className="btn-primary-custom mx-auto" onClick={() => navigate('/upload')}>
            <i className="bi bi-cloud-upload-fill"></i> Upload Resume
          </button>
        </div>
      ) : (
        <>
          {/* ── Filters ── */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <div className="position-relative flex-grow-1" style={{ minWidth: 200 }}>
              <input
                type="text"
                className="form-control form-control-dark"
                placeholder="Search by filename or job role…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <i className="bi bi-search position-absolute" style={{ left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}></i>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            <select
              className="form-control form-control-dark"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ width: 'auto', minWidth: 180 }}
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="score_desc">Highest score</option>
              <option value="score_asc">Lowest score</option>
            </select>
          </div>

          {/* ── Results count ── */}
          {search && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
            </p>
          )}

          {/* ── Cards grid ── */}
          {paginated.length === 0 ? (
            <div className="card-dark p-4 text-center">
              <i className="bi bi-search d-block mb-2" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}></i>
              <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>No results match your search.</p>
            </div>
          ) : (
            <div className="row g-3">
              {paginated.map((analysis) => (
                <div key={analysis.id} className="col-12 col-xl-6">
                  <div
                    className="card-dark p-3"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,70,229,0.35)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <ScoreCircle score={analysis.atsScore} />

                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex align-items-start justify-content-between gap-2">
                          <div className="text-truncate" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {analysis.fileName || 'Resume'}
                          </div>
                          <ScoreBadge score={analysis.atsScore} />
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(analysis.createdAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </div>

                        {/* job role chips */}
                        <div className="d-flex flex-wrap gap-1">
                          {(analysis.jobRoles || []).slice(0, 3).map((role, i) => (
                            <span key={i} className="badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                              {role}
                            </span>
                          ))}
                          {(analysis.jobRoles || []).length > 3 && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              +{analysis.jobRoles.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* actions */}
                      <div className="d-flex flex-column gap-1">
                        <button
                          className="btn-ghost"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={e => { e.stopPropagation(); navigate(`/analysis/${analysis.id}`); }}
                        >
                          <i className="bi bi-eye-fill"></i>
                        </button>
                        <button
                          className="btn-ghost"
                          style={{
                            padding: '4px 10px', fontSize: '0.75rem',
                            borderColor: 'rgba(239,68,68,0.25)', color: '#FCA5A5',
                          }}
                          onClick={e => handleDelete(e, analysis.id)}
                          disabled={deletingId === analysis.id}
                        >
                          {deletingId === analysis.id
                            ? <i className="bi bi-hourglass-split"></i>
                            : <i className="bi bi-trash3"></i>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-center gap-2 mt-4">
              <button
                className="btn-ghost"
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none',
                    background: p === page ? 'var(--gradient-primary)' : 'var(--bg-surface)',
                    color: p === page ? 'white' : 'var(--text-muted)',
                    fontWeight: p === page ? 700 : 400,
                    cursor: 'pointer', fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                className="btn-ghost"
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;
