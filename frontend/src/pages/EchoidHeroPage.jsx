import React, { useState, useEffect, useRef } from 'react';
import './EchoidHeroPage.css';

/**
 * ECHOID — Voice identity product for the E network.
 * Exact full-viewport dark hero landing page recreation.
 * Matches every detail of the reference specification precisely.
 */
export default function EchoidHeroPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const toggleBtnRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Set document title and html lang on mount
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'ECHOID — Your voice ID to the E network';
    document.documentElement.lang = 'en';

    return () => {
      document.title = prevTitle;
    };
  }, []);

  // Handle ESC key to close mobile menu, auto-close >=901px, and manage body overflow
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        if (toggleBtnRef.current) {
          toggleBtnRef.current.focus();
        }
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 901 && menuOpen) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.classList.remove('menu-open');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Direct access or redirect to platform
      window.location.href = '/';
    }
  };

  return (
    <div className="echoid-page">
      <section className="hero">
        {/* Media Layer: Full-bleed CloudFront Background Video & Fallback */}
        <div className="hero__media">
          <video
            className="hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="https://motionsites.org/assets/prompt-media/6b2162f1b10315621d52.png"
          >
            <source
              src="https://motionsites.org/assets/prompt-media/5627e9874aa303843b2e.mp4"
              type="video/mp4"
            />
          </video>
          {/* Dual Gradient Scrim Overlay */}
          <div className="hero__scrim" />
        </div>

        {/* Row 1: Navbar */}
        <header className="hero__nav">
          <a href="#" className="hero__logo">
            ECHOID
          </a>

          <div className="hero__nav-cluster">
            {/* Desktop Links (>=901px) */}
            <nav className="hero__nav-links">
              <a href="#story" className="hero__nav-link">
                Story
              </a>
              <a href="#platforms" className="hero__nav-link">
                Platforms
              </a>
              <a href="#identity" className="hero__nav-link">
                Identity
              </a>
              <a href="#contact" className="hero__nav-link">
                Contact
              </a>
            </nav>

            {/* Desktop CTA */}
            <a href="/" className="hero__nav-cta">
              Join up
            </a>

            {/* Mobile Hamburger (<=900px) */}
            <button
              ref={toggleBtnRef}
              className="hero__menu-toggle"
              type="button"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="mobileMenu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="hero__menu-bar hero__menu-bar--1" />
              <span className="hero__menu-bar hero__menu-bar--2" />
              <span className="hero__menu-bar hero__menu-bar--3" />
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <div
          id="mobileMenu"
          ref={mobileMenuRef}
          className="mobile-menu"
          data-open={menuOpen ? 'true' : 'false'}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          aria-hidden={!menuOpen}
          inert={!menuOpen ? '' : undefined}
          onClick={(e) => {
            if (e.target === mobileMenuRef.current) {
              closeMenu();
            }
          }}
        >
          <nav className="mobile-menu__nav">
            <a href="#story" className="mobile-menu__link" onClick={closeMenu}>
              Story
            </a>
            <a href="#platforms" className="mobile-menu__link" onClick={closeMenu}>
              Platforms
            </a>
            <a href="#identity" className="mobile-menu__link" onClick={closeMenu}>
              Identity
            </a>
            <a href="#contact" className="mobile-menu__link" onClick={closeMenu}>
              Contact
            </a>
          </nav>
          <a href="/" className="mobile-menu__cta" onClick={closeMenu}>
            Join up
          </a>
        </div>

        {/* Row 2: Right-Aligned Voice Entry Form Body */}
        <div className="hero__body">
          <div className="panel">
            {/* 1) Chip */}
            <div className="panel__chip">
              [ Voice entry ]
            </div>

            {/* 2) H1 */}
            <h1 className="panel__h1">
              ECHOID
            </h1>

            {/* 3) Tagline */}
            <p className="panel__tagline">
              Your voice ID to the E network.
            </p>

            {/* 4) Form */}
            <form
              className="panel__form"
              noValidate
              onSubmit={handleFormSubmit}
              action="#"
              method="post"
            >
              <div className="panel__field">
                <label htmlFor="echoid-email" className="panel__label--hidden">
                  Email
                </label>
                <input
                  id="echoid-email"
                  type="email"
                  className="panel__input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn--ghost"
                onClick={handleFormSubmit}
              >
                Proceed using email
              </button>

              <button
                type="button"
                className="btn--solid"
                onClick={() => { window.location.href = '/'; }}
              >
                Access
              </button>
            </form>

            {/* 5) Referral Link */}
            <a href="#invite" className="panel__referral">
              I've got an invite key
            </a>
          </div>
        </div>

        {/* Row 3: Legal Footer */}
        <footer className="hero__footer">
          <p className="hero__footer-text">
            Opening an e.xyz account signals that you accept our{' '}
            <a href="#privacy-notice" className="hero__footer-link">
              Privacy Notice
            </a>{' '}
            and{' '}
            <a href="#service-contract" className="hero__footer-link">
              Service Contract
            </a>
            .
          </p>
        </footer>
      </section>
    </div>
  );
}

