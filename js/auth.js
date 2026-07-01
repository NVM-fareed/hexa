/* ============================================================
   HexaHold — Auth JavaScript (auth.js)
   ============================================================ */

const { createClient } = supabase
const SUPABASE_URL = 'https://lkgtpqkvkgicfxxbttba.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zZGsFQQllmYYBhTz8U8DXA_G64oXaT0'
const client = createClient(SUPABASE_URL, SUPABASE_KEY)

document.addEventListener('DOMContentLoaded', () => {

  /* ── Password Strength Meter ── */
  const passwordInput = document.getElementById('password')
  const strengthFill  = document.getElementById('strengthFill')
  const strengthLabel = document.getElementById('strengthLabel')

  if (passwordInput && strengthFill) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value
      let score = 0

      if (val.length >= 8)           score++
      if (val.length >= 12)          score++
      if (/[A-Z]/.test(val))         score++
      if (/[0-9]/.test(val))         score++
      if (/[^A-Za-z0-9]/.test(val))  score++

      const levels = [
        { pct: '0%',   color: 'transparent', label: '' },
        { pct: '25%',  color: '#ef4444',     label: 'Weak' },
        { pct: '50%',  color: '#f97316',     label: 'Fair' },
        { pct: '75%',  color: '#eab308',     label: 'Good' },
        { pct: '100%', color: '#22c55e',     label: 'Strong' },
      ]

      const lvl = levels[Math.min(score, 4)]
      strengthFill.style.width      = lvl.pct
      strengthFill.style.background = lvl.color
      if (strengthLabel) strengthLabel.textContent = val.length > 0 ? lvl.label : ''
    })
  }

  /* ── Register Form ── */
  const registerForm = document.getElementById('registerForm')
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault()
      const btn = registerForm.querySelector('.btn-form')
      btn.textContent = 'Creating account…'
      btn.disabled = true

      const firstName = document.getElementById('firstName').value.trim()
      const lastName  = document.getElementById('lastName').value.trim()
      const email     = document.getElementById('email').value.trim()
      const password  = document.getElementById('password').value
      const country   = document.getElementById('country').value
      const phone     = document.getElementById('phone').value.trim()

      // Sign up with Supabase Auth
      const { data, error } = await client.auth.signUp({ email, password })

      if (error) {
        btn.textContent = error.message
        btn.style.background = '#ef4444'
        btn.disabled = false
        return
      }

      // Save profile data
      const { error: profileError } = await client
        .from('profiles')
        .upsert({
          id: data.user.id,
          email,
          full_name: `${firstName} ${lastName}`,
          phone,
          country,
          default_currency: 'USD'
        })

      if (profileError) {
        btn.textContent = profileError.message
        btn.style.background = '#ef4444'
        btn.disabled = false
        return
      }

      btn.innerHTML = '✓ Account created!'
      btn.style.background = '#22c55e'
      setTimeout(() => { window.location.href = 'dashboard.html' }, 1000)
    })
  }

  /* ── Login Form ── */
  const loginForm = document.getElementById('loginForm')
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault()
      const btn = loginForm.querySelector('.btn-form')
      btn.textContent = 'Signing in…'
      btn.disabled = true

      const email    = document.getElementById('email').value
      const password = document.getElementById('password').value

      const { error } = await client.auth.signInWithPassword({ email, password })

      if (error) {
        btn.textContent = error.message
        btn.style.background = '#ef4444'
        btn.disabled = false
      } else {
        btn.innerHTML = '✓ Signed in'
        btn.style.background = '#22c55e'
        window.location.href = 'dashboard.html'
      }
    })
  }

})
