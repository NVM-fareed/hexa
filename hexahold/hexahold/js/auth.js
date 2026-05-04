/* ============================================================
   HexaHold — Auth JavaScript (auth.js)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Password Strength Meter ── */
  const passwordInput = document.getElementById('password');
  const strengthFill  = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');

  if (passwordInput && strengthFill) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      let score = 0;

      if (val.length >= 8)  score++;
      if (val.length >= 12) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const levels = [
        { pct: '0%',   color: 'transparent', label: '' },
        { pct: '25%',  color: '#ef4444',     label: 'Weak' },
        { pct: '50%',  color: '#f97316',     label: 'Fair' },
        { pct: '75%',  color: '#eab308',     label: 'Good' },
        { pct: '100%', color: '#22c55e',     label: 'Strong' },
      ];

      const lvl = levels[Math.min(score, 4)];
      strengthFill.style.width      = lvl.pct;
      strengthFill.style.background = lvl.color;
      if (strengthLabel) strengthLabel.textContent = val.length > 0 ? lvl.label : '';
    });
  }

  /* ── Login Form ── */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = loginForm.querySelector('.btn-form');
      btn.textContent = 'Signing in…';
      btn.disabled = true;
      // Simulate — replace with real API call
      setTimeout(() => {
        btn.innerHTML = '✓ Signed in';
        btn.style.background = '#22c55e';
      }, 1500);
    });
  }

  /* ── Register Form ── */
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = registerForm.querySelector('.btn-form');
      btn.textContent = 'Creating account…';
      btn.disabled = true;
      // Simulate — replace with real API call
      setTimeout(() => {
        btn.innerHTML = '✓ Account created!';
        btn.style.background = '#22c55e';
      }, 1500);
    });
  }

});
