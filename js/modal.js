/* Modal — reservation form + toast */
(function () {
  const modal = document.querySelector('[data-modal]');
  const toast = document.querySelector('[data-toast]');
  if (!modal) return;

  const card = modal.querySelector('.modal__card');
  const closeBtns = modal.querySelectorAll('[data-modal-close]');
  const form = modal.querySelector('form');

  function open() {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const first = modal.querySelector('input');
      if (first) first.focus();
    }, 320);
  }
  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Open from any [data-modal-open]
  document.querySelectorAll('[data-modal-open]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  closeBtns.forEach((btn) => btn.addEventListener('click', close));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (form.elements['name']?.value || 'friend').trim().split(' ')[0];
      close();
      showToast(`Seat reserved, ${name}. Watch for a quiet email shortly.`);
      form.reset();
    });
  }

  function showToast(msg) {
    if (!toast) return;
    const slot = toast.querySelector('[data-toast-msg]');
    if (slot) slot.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toast.__timer);
    toast.__timer = setTimeout(() => toast.classList.remove('is-show'), 4200);
  }
})();
