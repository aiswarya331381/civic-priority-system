import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../utils/api';

import pothole from '../assets/pothole.jpg';
import garbage from '../assets/garbage.jpg';
import streetlight from '../assets/streetlight.jpg';
import waterleak from '../assets/waterleak.jpg';

const fallbackSlides = [
{
image: pothole,
title: 'Road Damage & Potholes',
location: 'Public Roads',
severity: 'High Priority'
},
{
image: garbage,
title: 'Garbage Overflow',
location: 'Residential Areas',
severity: 'Medium Priority'
},
{
image: streetlight,
title: 'Street Light Failure',
location: 'Urban Streets',
severity: 'Medium Priority'
},
{
image: waterleak,
title: 'Water Leakage',
location: 'Public Utilities',
severity: 'High Priority'
}
];

export default function HomePage() {
const [slides, setSlides] = useState(fallbackSlides);
const [current, setCurrent] = useState(0);

useEffect(() => {
const loadComplaints = async () => {
try {
const response = await api.get('/complaints/all');


    const complaints = response.data.complaints || [];

    const imageSlides = complaints
      .filter(
        complaint =>
          complaint.images &&
          complaint.images.length > 0
      )
      .map(complaint => ({
        image: complaint.images[0],
        title: complaint.title,
        location:
          complaint.location?.address ||
          'Location unavailable',
        severity: complaint.severity
      }));

    if (imageSlides.length > 0) {
      setSlides([...imageSlides, ...fallbackSlides]);
    }
  } catch (error) {
    console.log('Using fallback images');
  }
};

loadComplaints();


}, []);

useEffect(() => {
const timer = setInterval(() => {
setCurrent(prev =>
(prev + 1) % slides.length
);
}, 5000);


return () => clearInterval(timer);


}, [slides]);

return ( <div className="home-page">
<section
className="hero-slider"
style={{
backgroundImage: `url(${slides[current]?.image})`
}}
> <div className="hero-overlay"> <div className="hero-content">


        <div className="hero-issue">
          <h3>{slides[current]?.title}</h3>

          <p>
            📍 {slides[current]?.location}
          </p>

          <span className="severity-badge">
            {slides[current]?.severity}
          </span>
        </div>

        <h1>
          🏛️ Smart Civic Issue Reporting &
          Prioritization System
        </h1>

        <p>
          Report civic issues, track complaint progress,
          and help authorities prioritize critical public concerns.
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
    </div>
  </section>

  <section className="features">

    <div className="card">
      <h3>📍 Location-Based Reporting</h3>
      <p>Report issues with accurate GPS location details.</p>
    </div>

    <div className="card">
      <h3>📷 Evidence Image Upload</h3>
      <p>Upload photos for complaint verification.</p>
    </div>

    <div className="card">
      <h3>⚡ Priority Management</h3>
      <p>Critical issues receive faster attention.</p>
    </div>

    <div className="card">
      <h3>📊 Complaint Tracking</h3>
      <p>Track issue status from submission to resolution.</p>
    </div>

  </section>
</div>


);
}
