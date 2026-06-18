import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>🏛️ Smart Civic Issue Reporting & Prioritization System</h1>

          <p>
            A digital platform for citizens to report, track, and monitor
            civic issues efficiently while helping authorities prioritize
            critical public concerns.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>

            <Link to="/register" className="btn btn-secondary">
              Register
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
            alt="Smart City"
          />
        </div>
      </section>

      <section className="features">
        <div className="card">
          <h3>📍 Location Based Reporting</h3>
          <p>Report issues with exact location details.</p>
        </div>

        <div className="card">
          <h3>📷 Image Evidence</h3>
          <p>Upload photos for better issue verification.</p>
        </div>

        <div className="card">
          <h3>⚡ Priority Management</h3>
          <p>Critical issues receive higher attention.</p>
        </div>

        <div className="card">
          <h3>📊 Complaint Tracking</h3>
          <p>Track complaint status from submission to resolution.</p>
        </div>
      </section>
    </div>
  );
}