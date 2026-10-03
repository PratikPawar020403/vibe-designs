'use strict';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.initLoader === 'function') window.initLoader();
    if (typeof window.initNav === 'function') window.initNav();
    if (typeof window.initCursor === 'function') window.initCursor();

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    if (typeof window.initScrollEngine === 'function') {
        window.initScrollEngine();
    }

    if (typeof window.initAnimations === 'function') {
        window.initAnimations();
    }
});
