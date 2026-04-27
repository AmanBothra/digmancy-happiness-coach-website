/* FAQ — accordion (single-open) */
(function () {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  // Open the first by default
  if (items[0]) items[0].classList.add('is-open');

  items.forEach((item) => {
    const head = item.querySelector('.faq__head-row');
    if (!head) return;
    head.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      items.forEach((i) => i.classList.remove('is-open'));
      if (willOpen) item.classList.add('is-open');
    });
  });
})();
