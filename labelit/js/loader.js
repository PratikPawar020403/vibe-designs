'use strict';

window.initLoader = function() {
  const loader = document.querySelector('.loader');
  const barInner = document.querySelector('.loader-bar-inner');
  
  if (!loader || !barInner) return;
  
  document.body.style.overflow = 'hidden';
  barInner.style.width = '10%';
  
  let loaded = false;
  
  const finishLoading = () => {
    if (loaded) return;
    loaded = true;
    barInner.style.width = '100%';
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.style.overflow = '';
      setTimeout(() => { loader.style.display = 'none'; }, 600);
    }, 300);
  };
  
  // Listen for frame loading progress
  window.addEventListener('frameProgress', (e) => {
    const { loaded: count, total } = e.detail;
    const pct = Math.round((count / total) * 90) + 10; // 10-100%
    barInner.style.width = pct + '%';
  });
  
  // All frames loaded
  window.addEventListener('framesReady', finishLoading);
  
  // Safety fallback: dismiss loader in at most 4s
  setTimeout(finishLoading, 4000);
};
