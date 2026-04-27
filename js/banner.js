/* Banner — dismissible top promo */
(function () {
  const STORAGE_KEY = 'aastha-banner-dismissed-v1';
  const banner = document.querySelector('[data-banner]');
  const nav = document.querySelector('.nav');
  if (!banner) return;

  function hideBanner() {
    banner.classList.add('is-hidden');
    if (nav) nav.classList.add('banner-hidden');
    sessionStorage.setItem(STORAGE_KEY, '1');
    // After transition, collapse out of layout
    setTimeout(() => { banner.style.display = 'none'; if (nav) nav.style.top = '0'; }, 300);
  }

  // If previously dismissed in this session, hide immediately
  if (sessionStorage.getItem(STORAGE_KEY) === '1') {
    banner.style.display = 'none';
    if (nav) { nav.classList.remove('with-banner'); nav.style.top = '0'; }
  }

  const close = banner.querySelector('[data-banner-close]');
  if (close) close.addEventListener('click', hideBanner);
})();
