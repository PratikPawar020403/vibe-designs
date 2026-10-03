'use strict';

/**
 * ScrollReveal component implementation from React Bits
 * Dependencies: gsap, ScrollTrigger
 */
function initScrollReveal(element, options = {}) {
    if (!element) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not available for ScrollReveal');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const baseOpacity = options.baseOpacity !== undefined ? options.baseOpacity : 0;
    const enableBlur = options.enableBlur !== undefined ? options.enableBlur : true;
    const baseRotation = options.baseRotation !== undefined ? options.baseRotation : 0;
    const blurStrength = options.blurStrength !== undefined ? options.blurStrength : 10;
    
    // Viewport-aware scroll endpoints for smooth visible scrub
    const start = options.start || 'top 85%';
    const rotationEnd = options.rotationEnd || 'bottom 45%';
    const wordAnimationEnd = options.wordAnimationEnd || 'bottom 45%';
    const scrub = options.scrub !== undefined ? options.scrub : 1;
    const scroller = options.scrollContainerRef || window;

    // 1. Container rotation animation (only if baseRotation is requested)
    if (baseRotation !== 0) {
        gsap.fromTo(
            element,
            { transformOrigin: '0% 50%', rotate: baseRotation },
            {
                ease: 'none',
                rotate: 0,
                scrollTrigger: {
                    trigger: element,
                    scroller: scroller,
                    start: start,
                    end: rotationEnd,
                    scrub: scrub
                }
            }
        );
    } else {
        gsap.set(element, { clearProps: 'rotate,transformOrigin', transform: 'none' });
    }

    const wordElements = element.querySelectorAll('.word');
    if (!wordElements.length) return;

    // 2. Word opacity animation
    gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: 'opacity, filter' },
        {
            ease: 'none',
            opacity: 1,
            stagger: 0.08,
            scrollTrigger: {
                trigger: element,
                scroller: scroller,
                start: start,
                end: wordAnimationEnd,
                scrub: scrub
            }
        }
    );

    // 3. Word blur animation
    if (enableBlur) {
        gsap.fromTo(
            wordElements,
            { filter: `blur(${blurStrength}px)` },
            {
                ease: 'none',
                filter: 'blur(0px)',
                stagger: 0.08,
                scrollTrigger: {
                    trigger: element,
                    scroller: scroller,
                    start: start,
                    end: wordAnimationEnd,
                    scrub: scrub
                }
            }
        );
    }
}

window.initScrollReveal = initScrollReveal;
