'use strict';

window.initCursor = function() {
    // Only disable custom cursor on pure touch devices without a fine pointer
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isTouchOnly = !hasFinePointer && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouchOnly) return;

    let cursor = document.querySelector('.custom-cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');
        document.body.appendChild(cursor);
    }

    document.body.classList.add('has-custom-cursor');

    // If user touches screen at any point, switch back gracefully
    window.addEventListener('touchstart', () => {
        cursor.style.display = 'none';
        document.body.classList.remove('has-custom-cursor');
    }, { once: true, passive: true });

    let currentX = -100;
    let currentY = -100;
    let targetX = -100;
    let targetY = -100;
    let isVisible = false;

    // Fast initial positioning & instant visibility on first mousemove
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;

        if (!isVisible) {
            isVisible = true;
            currentX = targetX;
            currentY = targetY;
            cursor.classList.add('is-visible');
        }
    });

    document.addEventListener('mouseenter', (e) => {
        if (e.clientX && e.clientY) {
            targetX = e.clientX;
            targetY = e.clientY;
            currentX = targetX;
            currentY = targetY;
            isVisible = true;
            cursor.classList.add('is-visible');
        }
    });

    document.addEventListener('mouseleave', () => {
        isVisible = false;
        cursor.classList.remove('is-visible');
    });

    // Tactile click / grab feedback
    document.addEventListener('mousedown', () => {
        cursor.classList.add('is-active');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('is-active');
    });

    // Comprehensive hover target delegation
    const hoverSelectors = 'a, button, [role="button"], .circular-gallery, .service-row, .pillar-item, .contact-cta-button, .showcase-item';

    document.addEventListener('mouseover', (e) => {
        if (e.target && e.target.closest && e.target.closest(hoverSelectors)) {
            cursor.classList.add('is-hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        const toEl = e.relatedTarget;
        if (!toEl || (toEl.closest && !toEl.closest(hoverSelectors))) {
            cursor.classList.remove('is-hover');
        }
    });

    let isMoving = false;
    let cursorRaf = null;

    function renderCursor() {
        cursorRaf = null;
        if (!isVisible) return;

        const dx = targetX - currentX;
        const dy = targetY - currentY;
        currentX += dx * 0.2;
        currentY += dy * 0.2;

        cursor.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            cursorRaf = requestAnimationFrame(renderCursor);
        } else {
            isMoving = false;
        }
    }

    function scheduleCursorRender() {
        if (!isMoving && isVisible) {
            isMoving = true;
            if (!cursorRaf) {
                cursorRaf = requestAnimationFrame(renderCursor);
            }
        }
    }

    document.addEventListener('mousemove', scheduleCursorRender, { passive: true });
    document.addEventListener('mouseenter', scheduleCursorRender, { passive: true });
};
