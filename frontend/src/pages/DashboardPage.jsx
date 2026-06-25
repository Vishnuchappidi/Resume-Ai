import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resumeService } from '../services/resumeService';

const StatCard = ({ icon, label, value, color, gradient }) => (
  <div className="card-dark p-4" style={{ background: gradient || undefined }}>
    <div className="d-flex align-items-start justify-content-between">
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>
          {label}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color }}>
          {value}
        </div>
      </div>
      <div
        style={{
          width: 44, height: 44,
          background: `${color}22`,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', color
        }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
    </div>
  </div>
);

const ScoreBadge = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return 'var(--color-accent)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };
  return (
    <span
      className="fw-bold"
      style={{ color: getColor(), fontSize: '0.95rem' }}
    >
      {score}
    </span>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeService.getHistory()
      .then(res => setHistory(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgScore = history.length
    ? Math.round(history.reduce((sum, h) => sum + (h.atsScore || 0), 0) / history.length)
    : 0;

  const bestScore = history.length
    ? Math.max(...history.map(h => h.atsScore || 0))
    : 0;

  const recentAnalyses = history.slice(0, 4);

  const getScoreLevel = (score) => {
    if (score >= 80) return { label: 'Excellent', class: 'badge-success' };
    if (score >= 60) return { label: 'Good', class: 'badge-warning' };
    return { label: 'Needs Work', class: 'badge-danger' };
  };

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Here's an overview of your resume analysis activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            icon="bi-file-earmark-check-fill"
            label="Total Analyses"
            value={history.length}
            color="var(--color-primary-light)"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            icon="bi-graph-up-arrow"
            label="Average ATS Score"
            value={history.length ? `${avgScore}%` : '—'}
            color="var(--color-secondary)"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            icon="bi-trophy-fill"
            label="Best ATS Score"
            value={history.length ? `${bestScore}%` : '—'}
            color="var(--color-accent)"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            icon="bi-calendar3"
            label="Member Since"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
            color="var(--color-warning)"
          />
        </div>
      </div>

      <div className="row g-3">
        {/* Quick Action */}
        <div className="col-lg-4">
          <div
            className="card-dark p-4 h-100"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
              border: '1px solid rgba(79, 70, 229, 0.3)'
            }}
          >
            <div className="mb-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                style={{
                  width: 52, height: 52,
                  background: 'var(--gradient-primary)',
                  fontSize: '1.4rem'
                }}
              >
                <i className="bi bi-robot text-white"></i>
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: 8 }}>Analyze Your Resume</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Upload your PDF resume and get instant ATS score, strengths analysis, and AI-powered improvement suggestions.
              </p>
            </div>
            <button
              className="btn-primary-custom w-100 justify-content-center"
              onClick={() => navigate('/upload')}
            >
              <i className="bi bi-cloud-upload-fill"></i>
              Upload Resume
            </button>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="col-lg-8">
          <div className="card-dark p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 style={{ fontFamily: 'var(--font-display)', marginBottom: 0 }}>Recent Analyses</h5>
              {history.length > 0 && (
                <Link
                  to="/history"
                  style={{ fontSize: '0.875rem', color: 'var(--color-primary-light)' }}
                >
                  View all →
                </Link>
              )}
            </div>

            {loading ? (
              <div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton mb-3" style={{ height: 64 }} />
                ))}
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="text-center py-4">
                <i
                  className="bi bi-file-earmark-arrow-up d-block mb-3"
                  style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}
                ></i>
                <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
                  No analyses yet. Upload your first resume!
                </p>
              </div>
            ) : (
              recentAnalyses.map((analysis) => {
                const level = getScoreLevel(analysis.atsScore);
                return (
                  <div
                    key={analysis.id}
                    className="analysis-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                  >
                    <div
                      className="analysis-item-icon"
                      style={{ background: 'rgba(79, 70, 229, 0.15)', color: 'var(--color-primary-light)' }}
                    >
                      <i className="bi bi-file-earmark-pdf-fill"></i>
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div
                        className="fw-semibold text-truncate"
                        style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}
                      >
                        {analysis.fileName || 'Resume'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <ScoreBadge score={analysis.atsScore} />
                      <span className={level.class} style={{ fontSize: '0.7rem' }}>
                        {level.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default DashboardPage;
