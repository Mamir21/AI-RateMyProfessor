"use client";

import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../footer.css';

export default function Footer() {
  return (
    <footer>
    <h1>About Us</h1>
      <div className="footer-container">
        <div className="team-member">
          <h4>Ujjwala Pothula</h4>
          <img src="/images/teammember12.png" alt="Ujjwala Pothula" className="profile-pic" />
          <div className="social-icons">
            <a href="https://www.linkedin.com/in/ujjwalap16/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com/ujjwalaa7 " target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://ujjwalaa7.github.io/landing-page/" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-folder"></i>
            </a>
          </div>
        </div>
        <div className="team-member">
          <h4>Muhammad Amir</h4>
          <img src="/images/teamm2.png" alt="Muhammad Amir" className="profile-pic" />
          <div className="social-icons">
            <a href="https://www.linkedin.com/in/muhammad-amir-105a52294/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com/Mamir21" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://www.muhammadamir.tech/" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-folder"></i>
            </a>
          </div>
        </div>
        <div className="team-member">
          <h4>Farzin Shifat</h4>
          <img src="/images/Teamm.png" alt="Farzin Shifat" className="profile-pic" />
          <div className="social-icons">
            <a href="https://www.linkedin.com/in/farzin-shifat-5b7b43207/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com/Farzin312" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://farzinshifat.com/#" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-folder"></i>
            </a>
          </div>
        </div>
        <div className="team-member">
          <h4>Mir Shahiduzzaman</h4>
          <img src="/images/teamm5.png" alt="Mir Shahiduzzaman" className="profile-pic" />
          <div className="social-icons">
            <a href="https://www.linkedin.com/in/mir-shahiduzzaman/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com/MirShahiduzzaman" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://portfolio-eight-roan-56.vercel.app/" target="_blank" rel="noopener noreferrer">
              <i className="fas fa-folder"></i>
            </a>
          </div>
        </div>
      </div>
      <button id="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Back to Top
      </button>
      <div className="footer-bottom">
        <p>&copy; 2024 Chatterbot</p>
      </div>
    </footer>
  )
}