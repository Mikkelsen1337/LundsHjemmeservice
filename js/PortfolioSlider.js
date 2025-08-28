// js/PortfolioSlider.js
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.slider-track');
  const prev  = document.querySelector('.slider-arrow.prev');
  const next  = document.querySelector('.slider-arrow.next');

  if (!track || !prev || !next) return;

  let isAnimating = false;

  const getGap = () => {
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.gap || cs.columnGap || 0);
    return isNaN(gap) ? 0 : gap;
  };

  const getStep = () => {
    const card = track.querySelector('.card');
    if (!card) return 0;
    const w = card.getBoundingClientRect().width;
    return w + getGap();
  };

  const slideNext = () => {
    if (isAnimating) return;
    const step = getStep();
    if (!step) return;

    isAnimating = true;
    track.style.transition = 'transform 300ms ease';
    track.style.transform  = `translateX(-${step}px)`;

    const onEnd = () => {
      track.style.transition = 'none';
      track.appendChild(track.firstElementChild); // flyt første til slut
      track.style.transform = 'translateX(0)';
      // force reflow før vi tillader næste animation
      requestAnimationFrame(() => { isAnimating = false; });
      track.removeEventListener('transitionend', onEnd);
    };
    track.addEventListener('transitionend', onEnd);
  };

  const slidePrev = () => {
    if (isAnimating) return;
    const step = getStep();
    if (!step) return;

    isAnimating = true;
    // læg sidste kort forrest, og start med -step uden transition
    track.style.transition = 'none';
    track.insertBefore(track.lastElementChild, track.firstElementChild);
    track.style.transform = `translateX(-${step}px)`;

    // næste frame: animer tilbage til 0
    requestAnimationFrame(() => {
      track.style.transition = 'transform 300ms ease';
      track.style.transform  = 'translateX(0)';
      const onEnd = () => {
        track.style.transition = 'none';
        isAnimating = false;
        track.removeEventListener('transitionend', onEnd);
      };
      track.addEventListener('transitionend', onEnd);
    });
  };

  // Klik
  next.addEventListener('click', slideNext);
  prev.addEventListener('click', slidePrev);

  // Swipe (touch)
  let startX = 0, deltaX = 0;
  const THRESHOLD = 40;

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    deltaX = 0;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (Math.abs(deltaX) > THRESHOLD) {
      deltaX < 0 ? slideNext() : slidePrev();
    }
    startX = 0; deltaX = 0;
  });

  // Tastatur (for a11y)
  prev.setAttribute('tabindex', '0');
  next.setAttribute('tabindex', '0');
  [prev, next].forEach(btn => btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') btn.click();
  }));

  // Reflow ved resize (bevarer korrekt step)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
    }, 150);
  });
});
