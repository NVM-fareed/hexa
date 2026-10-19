/* ============================================================
   HexaHold — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

      /* ── Mobile menu (hamburger) ── */
    const burger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (burger && mobileMenu) {
      const setMenuOpen = open => {
        burger.classList.toggle('open', open);
        mobileMenu.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        mobileMenu.setAttribute('aria-hidden', String(!open));
        document.body.classList.toggle('menu-open', open);
      };
      burger.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('open')));
      mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuOpen(false)));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenuOpen(false); });
      window.addEventListener('resize', () => { if (window.innerWidth > 768) setMenuOpen(false); });
    }
  /* ── Navbar Shrink on Scroll ── */
  const navbar = document.getElementById('nav');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  /* ── Scroll Reveal ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
