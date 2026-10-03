// ---- About / contact ----
// Desktop (mouse): hovering a word previews its panel; leaving the menu area closes it.
//   Clicking a word "pins" its panel so it stays open. Click the same word again,
//   click anywhere outside the menu, or press Esc to close it.
// Touch screens: tap to open, tap again to close.
const menu = document.querySelector('.menu');
const navButtons = [...document.querySelectorAll('.side-nav button')];
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let pinned = null;   // name of the panel that was clicked open, if any

function openPane(name) {
  navButtons.forEach(b => {
    const on = b.dataset.pane === name;
    b.setAttribute('aria-expanded', on);
    document.getElementById('pane-' + b.dataset.pane).hidden = !on;
  });
}
function closeAll() { pinned = null; openPane(null); }

navButtons.forEach(btn => {
  const name = btn.dataset.pane;
  if (canHover) btn.addEventListener('mouseenter', () => openPane(name));
  btn.addEventListener('click', () => {
    if (pinned === name) { closeAll(); return; }   // second click closes
    pinned = name;
    openPane(name);
  });
});

if (canHover) {
  // Leaving the menu: go back to the pinned panel (if any) — otherwise close,
  // unless someone is typing in the signup box.
  menu.addEventListener('mouseleave', () => {
    if (pinned) { openPane(pinned); return; }
    const typing = menu.contains(document.activeElement) && document.activeElement.tagName === 'INPUT';
    if (!typing) openPane(null);
  });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
document.addEventListener('click', e => { if (!menu.contains(e.target)) closeAll(); });

// ---- Each book: image carousel + info panel ----
// Images advance on their own every 6.5 seconds (no transition) until the visitor
// clicks, taps, swipes or uses the arrow keys — then auto-advance stops for good.
const AUTOPLAY_MS = 6500;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.viewer').forEach(viewer => {
  const slides = [...viewer.querySelectorAll('.slide')];
  const count = viewer.querySelector('.count');
  const book = viewer.closest('.book');
  const infoBtn = book.querySelector('.info-toggle');
  let i = 0;
  let timer = null;

  const show = n => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    if (count) count.textContent = slides.length > 1 ? `${i + 1} / ${slides.length}` : '';
  };
  const stopAuto = () => {
    clearInterval(timer); timer = null;
  };
  const step = d => { stopAuto(); show(i + d); };

  viewer.querySelector('.prev').addEventListener('click', () => step(-1));
  viewer.querySelector('.next').addEventListener('click', () => step(1));
  viewer.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  // swipe on phones
  let x0 = null;
  viewer.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    x0 = null;
  });

  // Info: click (or tap) to open; any click after that — on the panel or elsewhere — closes it.
  const setInfo = on => {
    viewer.classList.toggle('show-info', on);
    infoBtn.setAttribute('aria-expanded', on);
  };
  infoBtn.addEventListener('click', e => {
    e.stopPropagation();
    setInfo(!viewer.classList.contains('show-info'));
  });
  document.addEventListener('click', () => setInfo(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setInfo(false); });

  show(0);
  if (slides.length > 1 && !reduceMotion) {
    timer = setInterval(() => {
      if (!viewer.classList.contains('show-info') && !document.hidden) show(i + 1);
    }, AUTOPLAY_MS);
  }
});

// ---- Newsletter pop-up: appears once after 10 seconds ----
// Won't reappear for 30 days after someone closes it or signs up.
(() => {
  const DELAY_MS = 10000;
  const KEY = 'tkp-newsletter-popup';
  const popup = document.getElementById('nl-popup');
  if (!popup) return;

  const recentlySeen = () => {
    try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < 30 * 864e5; }
    catch (e) { return false; }
  };
  const remember = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} };
  const close = () => {
    popup.classList.remove('visible');
    setTimeout(() => { popup.hidden = true; }, 300);
    remember();
  };

  if (recentlySeen()) return;
  setTimeout(() => {
    // Skip it if the contact panel (which already has the signup) is open.
    if (!document.getElementById('pane-contact').hidden) return;
    popup.hidden = false;
    requestAnimationFrame(() => popup.classList.add('visible'));
  }, DELAY_MS);

  popup.querySelector('.nl-close').addEventListener('click', close);
  popup.querySelector('form').addEventListener('submit', remember);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !popup.hidden) close(); });
})();
