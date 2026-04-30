/**
 * Aastha Tatia — Scroll & Reveal Animations
 * Uses Lenis for smooth scroll and IntersectionObserver for reveals.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Initialize Lenis Smooth Scroll
  window.lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 2. Intersection Observer for 'Reveal' effects
  const revealElements = document.querySelectorAll('.reveal, .fade-up');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    observer.observe(el);
  });

  // 3. Optional: Sync Lenis with anchor links if needed
  // (nav.js already handles this with scrollTo, which Lenis intercepts)
});
