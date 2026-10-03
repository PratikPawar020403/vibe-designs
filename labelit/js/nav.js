'use strict';

window.initNav = function() {
    const nav = document.querySelector('.nav');
    const menuBtn = document.querySelector('.nav-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a[href^="#"]');

    if (!nav) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    nav.classList.add('is-scrolled');
                } else {
                    nav.classList.remove('is-scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            const href = logo.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (navLinks && navLinks.classList.contains('is-open')) {
                    closeMenu();
                }
            }
        });
    }

    function closeMenu() {
        if (!navLinks || !navLinks.classList.contains('is-open')) return;
        navLinks.classList.remove('is-open');
        document.body.style.overflow = '';
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.classList.remove('is-active');
            menuBtn.focus();
        }
    }

    function openMenu() {
        if (!navLinks) return;
        navLinks.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'true');
            menuBtn.classList.add('is-active');
        }
        // Focus first menu item
        const firstLink = navLinks.querySelector('a');
        if (firstLink) firstLink.focus();
    }

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.contains('is-open');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
                closeMenu();
            }
        });

        // Close on click outside links when open
        navLinks.addEventListener('click', (e) => {
            if (e.target === navLinks) {
                closeMenu();
            }
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            
            if (targetEl) {
                e.preventDefault();
                closeMenu();
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
};
