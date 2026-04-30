/* Nav — hamburger + smooth scroll */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const burger = nav.querySelector('.nav__burger');
  const overlay = nav.querySelector('.nav__overlay');
  const links = nav.querySelectorAll('[data-scroll]');

  function setOpen(open) {
    if (open) nav.classList.add('menu-open');
    else nav.classList.remove('menu-open');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (burger) burger.addEventListener('click', () => {
    setOpen(!nav.classList.contains('menu-open'));
  });

  // Explicit close button inside the overlay
  const closeBtn = nav.querySelector('.nav__overlay-close');
  if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('menu-open')) setOpen(false);
  });

  // Smooth scroll on any [data-scroll="<id>"]
  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const id = el.getAttribute('data-scroll');
      setOpen(false);
      
      const target = id === 'top' ? 0 : document.getElementById(id);
      if (target === null && id !== 'top') return;

      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: -80 });
      } else {
        const y = id === 'top' ? 0 : target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
})();
