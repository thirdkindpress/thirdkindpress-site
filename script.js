// ---- About / contact ----
// Desktop (mouse): hovering a word opens its panel; leaving the whole menu area closes it.
// Touch screens: tap to open, tap again to close.
const menu = document.querySelector('.menu');
const navButtons = [...document.querySelectorAll('.side-nav button')];
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function openPane(name) {
  navButtons.forEach(b => {
    const on = b.dataset.pane === name;
    b.setAttribute('aria-expanded', on);
    document.getElementById('pane-' + b.dataset.pane).hidden = !on;
  });
}

navButtons.forEach(btn => {
  if (canHover) btn.addEventListener('mouseenter', () => openPane(btn.dataset.pane));
  if (canHover) btn.addEventListener('focus', () => openPane(btn.dataset.pane));
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (!canHover) openPane(isOpen ? null : btn.dataset.pane);
  });
});

if (canHover) {
  // Close when the mouse leaves — unless someone is typing in the signup box.
  menu.addEventListener('mouseleave', () => {
    if (!menu.contains(document.activeElement) || document.activeElement.tagName === 'BUTTON') openPane(null);
  });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') openPane(null); });
document.addEventListener('click', e => { if (!menu.contains(e.target)) openPane(null); });

// ---- Each book: image carousel + info overlay ----
document.querySelectorAll('.viewer').forEach(viewer => {
  const slides = [...viewer.querySelectorAll('.slide')];
  const count = viewer.querySelector('.count');
  const infoBtn = viewer.querySelector('.info-toggle');
  let i = 0;

  const show = n => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    count.textContent = slides.length > 1 ? `${i + 1} / ${slides.length}` : '';
  };

  viewer.querySelector('.prev').addEventListener('click', () => show(i - 1));
  viewer.querySelector('.next').addEventListener('click', () => show(i + 1));
  infoBtn.addEventListener('click', () => {
    const on = viewer.classList.toggle('show-info');
    infoBtn.setAttribute('aria-expanded', on);
    infoBtn.textContent = on ? 'close' : 'info';
  });

  // swipe on phones
  let x0 = null;
  viewer.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  show(0);
});
