'use strict';

/**
 * Methodology / Process Rail interactive behavior
 * - Exactly one step open at a time (Step 01 open on load)
 * - Clicking a step header opens that step and closes the others
 * - Marks active step with 'on', earlier steps with 'done' (filling node & line with tan)
 * - Manages aria-expanded on step buttons
 */
window.initProcessRail = function() {
    const rail = document.querySelector('.process-rail');
    if (!rail) return;

    const items = Array.from(rail.querySelectorAll('.process-rail-item'));
    if (!items.length) return;

    function setActiveStep(targetIndex) {
        items.forEach((item, index) => {
            const btn = item.querySelector('.process-rail-header');
            if (index < targetIndex) {
                item.classList.add('done');
                item.classList.remove('on');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            } else if (index === targetIndex) {
                item.classList.remove('done');
                item.classList.add('on');
                if (btn) btn.setAttribute('aria-expanded', 'true');
            } else {
                item.classList.remove('done');
                item.classList.remove('on');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Attach click and keyboard listeners to headers
    items.forEach((item, index) => {
        const header = item.querySelector('.process-rail-header');
        if (header) {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                setActiveStep(index);
            });

            header.addEventListener('keydown', (e) => {
                let targetIndex = -1;
                if (e.key === 'ArrowDown') {
                    targetIndex = (index + 1) % items.length;
                } else if (e.key === 'ArrowUp') {
                    targetIndex = (index - 1 + items.length) % items.length;
                } else if (e.key === 'Home') {
                    targetIndex = 0;
                } else if (e.key === 'End') {
                    targetIndex = items.length - 1;
                }

                if (targetIndex !== -1) {
                    e.preventDefault();
                    const targetBtn = items[targetIndex].querySelector('.process-rail-header');
                    if (targetBtn) {
                        targetBtn.focus();
                        setActiveStep(targetIndex);
                    }
                }
            });
        }
    });

    // Ensure step 01 is open on load
    setActiveStep(0);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initProcessRail);
} else {
    window.initProcessRail();
}
