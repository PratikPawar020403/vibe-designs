'use strict';

window.initAnimations = function() {
    // Universal safety net: ensure all elements are visible
    document.body.classList.add('js-loaded');

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded, fallback to CSS visibility.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 01. Statement Section Animations
    const statementContainer = document.querySelector('.statement-container');
    if (statementContainer) {
        gsap.fromTo('.statement-text',
            { opacity: 0, y: 35 },
            {
                opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
                scrollTrigger: { trigger: '.section-statement', start: 'top 80%' }
            }
        );
        gsap.fromTo('.statement-sub',
            { opacity: 0, y: 25 },
            {
                opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power2.out',
                scrollTrigger: { trigger: '.section-statement', start: 'top 80%' }
            }
        );
        gsap.fromTo('.pillar-item',
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
                scrollTrigger: { trigger: '.statement-pillars', start: 'top 85%' }
            }
        );
    }

    // 02. Services / Capabilities
    const serviceRows = document.querySelectorAll('.service-row');
    if (serviceRows.length) {
        gsap.fromTo(serviceRows,
            { opacity: 0, y: 25 },
            {
                opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
                scrollTrigger: { trigger: '.services-list', start: 'top 80%' }
            }
        );
    }

    // 03. Process Section
    const processItems = document.querySelectorAll('.process-rail-item');
    if (processItems.length) {
        gsap.fromTo(processItems,
            { opacity: 0, y: 25 },
            {
                opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out',
                scrollTrigger: { trigger: '.process-rail', start: 'top 85%' }
            }
        );
    }

    // 04. Showcase Portfolio Items
    const showcaseItems = document.querySelectorAll('.showcase-item');
    if (showcaseItems.length) {
        showcaseItems.forEach((item, index) => {
            gsap.fromTo(item,
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: 0.8, delay: (index % 2) * 0.15, ease: 'power2.out',
                    scrollTrigger: { trigger: item, start: 'top 85%' }
                }
            );
        });
    }

    // 05. Brand Statement — React Bits ScrollReveal Integration
    const brandContainer = document.querySelector('.brand-container');
    if (brandContainer) {
        gsap.fromTo('.brand-badge, .brand-sub, .brand-coordinates',
            { opacity: 0.2, y: 35 },
            {
                opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power2.out',
                scrollTrigger: { trigger: '.section-brand', start: 'top 75%' }
            }
        );
    }

    const scrollRevealEl = document.querySelector('.brand-statement.scroll-reveal');
    if (scrollRevealEl && typeof window.initScrollReveal === 'function') {
        window.initScrollReveal(scrollRevealEl, {
            baseOpacity: 0,
            enableBlur: true,
            baseRotation: 0,
            blurStrength: 10,
            start: 'top 85%',
            rotationEnd: 'bottom 45%',
            wordAnimationEnd: 'bottom 45%',
            scrub: 1
        });
    }

    // 06. Contact Section
    const contactHeadline = document.querySelector('.contact-headline');
    if (contactHeadline) {
        gsap.fromTo('.contact-eyebrow, .contact-headline, .contact-action-col',
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
                scrollTrigger: { trigger: '.section-contact', start: 'top 80%' }
            }
        );
        gsap.fromTo('.contact-detail-item',
            { opacity: 0, y: 20 },
            {
                opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
                scrollTrigger: { trigger: '.contact-details-grid', start: 'top 85%' }
            }
        );
    }
};
