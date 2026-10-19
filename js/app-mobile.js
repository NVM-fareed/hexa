/* ============================================================
   HexaHold — mobile navigation for the logged-in app pages
   Adds a top bar with a menu button and turns the existing sidebar into a drawer.
   The styling lives in css/app-mobile.css. Nothing here changes on desktop.
   ============================================================ */
(function () {
  const layout  = document.querySelector('.dash-layout');
  const sidebar = layout && layout.querySelector(':scope > .sidebar');
  if (!layout || !sidebar) return;

  sidebar.id = sidebar.id || 'appSidebar';

  // Top bar (only visible below 900px, see the CSS)
  const bar = document.createElement('header');
  bar.className = 'm-topbar';
  bar.innerHTML =
    '<button type="button" class="m-menu-btn" aria-label="Open menu" ' +
    'aria-controls="' + sidebar.id + '" aria-expanded="false">' +
    '<span></span><span></span><span></span></button>' +
    '<a class="m-brand" href="dashboard.html">Hexa<span>Hold</span></a>';
  layout.insertBefore(bar, layout.firstChild);

  const backdrop = document.createElement('div');
  backdrop.className = 'm-backdrop';
  document.body.appendChild(backdrop);

  const btn = bar.querySelector('.m-menu-btn');
  const mq  = window.matchMedia('(max-width: 900px)');

  function setOpen(open) {
    sidebar.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
    document.body.classList.toggle('m-nav-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      const first = sidebar.querySelector('a.nav-item');
      if (first) first.focus({ preventScroll: true });
    } else if (document.activeElement && sidebar.contains(document.activeElement)) {
      btn.focus({ preventScroll: true });
    }
  }

  btn.addEventListener('click', () => setOpen(!sidebar.classList.contains('open')));
  backdrop.addEventListener('click', () => setOpen(false));
  sidebar.addEventListener('click', e => { if (e.target.closest('a.nav-item')) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

  // Rotating a tablet or resizing a window past the breakpoint: reset to the desktop layout
  const onChange = () => { if (!mq.matches) setOpen(false); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else mq.addListener(onChange);
})();
