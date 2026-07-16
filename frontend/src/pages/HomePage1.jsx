import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import './HomePage1.css';

import pothole from '../assets/pothole.jpg';
import garbage from '../assets/garbage.jpg';
import streetlight from '../assets/streetlight.jpg';
import waterleak from '../assets/waterleak.jpg';

const fallbackSlides = [
  {
    image: streetlight,
    title: 'Street Light Not Working',
    location: 'Gajuwaka',
    severity: 'Low Priority',
    severityClass: 'slide-badge-low',
    timeAgo: '1 day ago',
  },
  {
    image: pothole,
    title: 'Road Damage',
    location: 'MVP Colony, Visakhapatnam',
    severity: 'High Priority',
    severityClass: 'slide-badge-high',
    timeAgo: '5 hours ago',
  },
  {
    image: waterleak,
    title: 'Water Leakage',
    location: 'SBI Road',
    severity: 'Medium Priority',
    severityClass: 'slide-badge-medium',
    timeAgo: '5 hours ago',
  },
  {
    image: garbage,
    title: 'Garbage Overflow',
    location: 'Residential Area',
    severity: 'Medium Priority',
    severityClass: 'slide-badge-medium',
    timeAgo: '2 hours ago',
  },
];

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="13" r="5" stroke="#4f46e5" strokeWidth="2" fill="none" />
        <path d="M16 2C10.477 2 6 6.477 6 12c0 7 10 18 10 18s10-11 10-18c0-5.523-4.477-10-10-10z" stroke="#4f46e5" strokeWidth="2" fill="none" />
      </svg>
    ),
    title: 'Location-Based Reporting',
    desc: 'Report issues with accurate GPS location details.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="7" width="24" height="18" rx="3" stroke="#4f46e5" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="4" stroke="#4f46e5" strokeWidth="2" fill="none" />
        <circle cx="24" cy="10" r="1.5" fill="#4f46e5" />
      </svg>
    ),
    title: 'Evidence Image Upload',
    desc: 'Upload images to help authorities understand the issue better.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 22l6-8 5 6 4-5 5 7" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="4" y="4" width="24" height="24" rx="2" stroke="#4f46e5" strokeWidth="2" fill="none" />
      </svg>
    ),
    title: 'Priority Management',
    desc: 'AI-powered priority scoring for efficient issue resolution.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M8 20l5-5 4 4 7-9" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="16" cy="16" r="13" stroke="#4f46e5" strokeWidth="2" fill="none" />
      </svg>
    ),
    title: 'Real-time Tracking',
    desc: 'Track your complaint status in real-time updates.',
  },
];

const howItWorks = [
  {
    num: '1',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="22" height="18" rx="2" stroke="#4f46e5" strokeWidth="1.8" fill="none" />
        <path d="M9 13h10M9 17h6" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="14" cy="2" r="2" fill="#4f46e5" />
        <path d="M14 4v3" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: 'Report Issue',
    desc: 'Submit civic issue with details, location & images.',
  },
  {
    num: '2',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="5" width="22" height="18" rx="2" stroke="#4f46e5" strokeWidth="1.8" fill="none" />
        <path d="M8 10h12M8 14h8M8 18h5" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 17l2 2 4-4" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Review & Prioritize',
    desc: 'Authorities review and assign priority',
  },
  {
    num: '3',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="5" stroke="#4f46e5" strokeWidth="1.8" fill="none" />
        <path d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 18l2 2" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: 'Take Action',
    desc: 'Issue is assigned to relevant department',
  },
  {
    num: '4',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" stroke="#4f46e5" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      </svg>
    ),
    title: 'Track & Resolve',
    desc: 'Track progress until the issue is resolved',
  },
];

export default function HomePage1() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [recentIssues, setRecentIssues] = useState(fallbackSlides);
  const [recentIdx, setRecentIdx] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await api.get('/complaints/all');
        const complaints = response.data.complaints || [];
        const imageSlides = complaints
          .filter(c => c.images && c.images.length > 0)
          .map(c => ({
            image: c.images[0],
            title: c.title,
            location: c.location?.address || 'Location unavailable',
            severity: c.severity,
            severityClass: getSeverityClass(c.severity),
            timeAgo: getTimeAgo(c.createdAt),
          }));
        if (imageSlides.length > 0) {
          setSlides([...imageSlides, ...fallbackSlides]);
          setRecentIssues([...imageSlides, ...fallbackSlides]);
        }
      } catch {
        console.log('Using fallback images');
      }
    };
    loadComplaints();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  function getSeverityClass(sev) {
    if (!sev) return 'slide-badge-medium';
    const s = sev.toLowerCase();
    if (s.includes('high') || s.includes('critical')) return 'slide-badge-high';
    if (s.includes('low')) return 'slide-badge-low';
    return 'slide-badge-medium';
  }

  function getTimeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'just now';
    if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
    return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? 's' : ''} ago`;
  }

  const visibleRecent = recentIssues.slice(recentIdx, recentIdx + 3);

  return (
    <div className={`hp-page${darkMode ? ' hp-dark' : ''}`}>
      {/* ── NAV ── */}
      <nav className="hp-nav">
        <div className="hp-nav-inner">
          <div className="hp-nav-logo">
            <span className="hp-nav-logo-icon">🏛️</span>
            <span className="hp-nav-logo-text">Civic Priority</span>
          </div>
          <div className="hp-nav-links">
            <a href="#" className="hp-nav-link hp-nav-link-active">Home</a>
            <a href="#features" className="hp-nav-link">Features</a>
            <a href="#how" className="hp-nav-link">How It Works</a>
            
            <a href="#contact" className="hp-nav-link">Contact</a>
          </div>
          <div className="hp-nav-right">
            <button
              className="hp-dark-toggle"
              onClick={() => setDarkMode(d => !d)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="hp-btn-outline">Login</Link>
            <Link to="/register" className="hp-btn-solid">Register</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hp-hero">
        {/* Left hero content */}
        <div className="hp-hero-left">
          <span className="hp-hero-pill">Smart City, Better Living</span>
          <h1 className="hp-hero-title">
            Smart Civic Issue Reporting &{' '}
            <span className="hp-hero-accent">Prioritization System</span>
          </h1>
          <p className="hp-hero-sub">
            Report civic issues, track complaint progress, and help authorities
            prioritize critical public concerns.
          </p>
          <div className="hp-hero-btns">
            <Link to="/login" className="hp-btn-hero-primary">
              🏛️ Report an Issue
            </Link>
            <Link to="/login" className="hp-btn-hero-outline">
              🔍 Track Complaint
            </Link>
          </div>
        </div>

        {/* Center phone mockup */}
        <div className="hp-phone-scene">

  <div className="hp-phone-glow"></div>

  <div className="hp-phone-wrap">

    <div className="hp-phone-back"></div>

    <div className="hp-phone">

      <div className="hp-phone-screen">

        <div
          className="hp-phone-map"
          style={{
            backgroundImage: `url(${slides[current]?.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          <div className="hp-map-overlay"></div>

          <div className="hp-map-pin">
            📍
          </div>

        </div>

      </div>

    </div>

  </div>

  <div className="hp-float-card">

    <img
      src={slides[current]?.image}
      className="hp-float-img"
      alt=""
    />

    <div className="hp-float-info">

      <div className="hp-float-title">
        {slides[current]?.title}
      </div>

      <div className="hp-float-loc">
        📍 {slides[current]?.location}
      </div>

      <span
        className={`hp-float-badge ${slides[current]?.severityClass}`}
      >
        {slides[current]?.severity}
      </span>

    </div>

  </div>

</div>

        {/* Right recent issues panel */}
        <div className="hp-recent-panel">
          <div className="hp-recent-header">
            <span className="hp-recent-title">⚡ Recent Reported Issues</span>
            <Link to="/login" className="hp-recent-viewall">View All</Link>
          </div>
          <div className="hp-recent-cards">
            {visibleRecent.map((issue, i) => (
              <div
                key={i}
                className={`hp-recent-card${i === 1 ? ' hp-recent-card-active' : ''}`}
              >
                <div
                  className="hp-recent-img"
                  style={{
                    backgroundImage: `url(${issue.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="hp-recent-meta">
                  <div className="hp-recent-name">{issue.title}</div>
                  <div className="hp-recent-loc">📍 {issue.location}</div>
                  <span className={`hp-float-badge ${issue.severityClass}`}>
                    {issue.severity}
                  </span>
                  <div className="hp-recent-time">🕐 {issue.timeAgo}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Dots */}
          <div className="hp-recent-dots">
            {recentIssues.slice(0, Math.ceil(recentIssues.length / 3)).map((_, i) => (
              <button
                key={i}
                className={`hp-dot${recentIdx === i * 3 ? ' hp-dot-active' : ''}`}
                onClick={() => setRecentIdx(i * 3)}
              />
            ))}
          </div>
          {/* Prev/Next arrows */}
          <button
            className="hp-recent-arrow hp-recent-arrow-left"
            onClick={() =>
              setRecentIdx(prev =>
                Math.max(0, prev - 1)
              )
            }
          >
            ‹
          </button>
          <button
            className="hp-recent-arrow hp-recent-arrow-right"
            onClick={() =>
              setRecentIdx(prev =>
                Math.min(recentIssues.length - 3, prev + 1)
              )
            }
          >
            ›
          </button>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="hp-features">
        {features.map((f, i) => (
          <div className="hp-feature-card" key={i}>
            <div className="hp-feature-icon">{f.icon}</div>
            <h3 className="hp-feature-title">{f.title}</h3>
            <p className="hp-feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="hp-how">
        <h2 className="hp-how-title">How It Works</h2>
        <div className="hp-how-underline" />
        <div className="hp-how-steps">
          {howItWorks.map((step, i) => (
            <div className="hp-how-step" key={i}>
              <div className="hp-how-num">{step.num}</div>
              <div className="hp-how-icon">{step.icon}</div>
              <h4 className="hp-how-step-title">{step.title}</h4>
              <p className="hp-how-step-desc">{step.desc}</p>
              {i < howItWorks.length - 1 && (
                <span className="hp-how-arrow">→</span>
              )}
            </div>
          ))}
        </div>
      </section>
     <section id="contact" className="hp-contact">

    <h2>Contact Us</h2>

    <div className="hp-contact-grid">

        <div className="hp-contact-item">
            📧
            <h3>Email</h3>
            <p>support@civicpriority.in</p>
        </div>

        <div className="hp-contact-item">
            📞
            <h3>Phone</h3>
            <p>+91 98765 43210</p>
        </div>

        <div className="hp-contact-item">
            🏛️
            <h3>Office</h3>
            <p>Municipal Corporation,<br/>Andhra Pradesh</p>
        </div>

    </div>

</section>

    </div>
  );
}
