import React from 'react';
import './MegtikNavbar.css';

export const MegtikNavbar: React.FC = () => {
  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.location.href = '/';
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'instant' : 'smooth',
    });

    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  return (
    <header className="mk-navbar" role="banner">
      <a
        href="#top"
        onClick={handleScrollToTop}
        className="mk-navbar-brand"
        aria-label="MEGTIK — Back to top"
      >
        <img
          src="/assets/megtik-logo.png"
          alt="MEGTIK"
          className="mk-navbar-logo"
          width="56"
          height="56"
        />
      </a>
    </header>
  );
};

export default MegtikNavbar;
