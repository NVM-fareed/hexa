/* ============================================================
   HexaHold — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Custom Cursor ── */
  const cur   = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');

  if (cur && trail) {
    let mx = 0, my = 0, tx = 0, ty = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cur.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
    });

    (function animTrail() {
      tx += (mx - tx - 18) * 0.13;
      ty += (my - ty - 18) * 0.13;
      trail.style.transform = `translate(${tx}px, ${ty}px)`;
      requestAnimationFrame(animTrail);
    })();

    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        trail.style.width        = '52px';
        trail.style.height       = '52px';
        trail.style.borderColor  = 'rgba(124,92,252,0.7)';
      });
      el.addEventListener('mouseleave', () => {
        trail.style.width        = '36px';
        trail.style.height       = '36px';
        trail.style.borderColor  = 'rgba(124,92,252,0.4)';
      });
    });
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
