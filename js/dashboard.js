/* ============================================================
   HexaHold — Dashboard JavaScript (dashboard.js)
   ============================================================ */

const { createClient } = supabase
const SUPABASE_URL = 'https://lkgtpqkvkgicfxxbttba.supabase.co'
const SUPABASE_KEY = 'sb_publishable_zZGsFQQllmYYBhTz8U8DXA_G64oXaT0'
const client = createClient(SUPABASE_URL, SUPABASE_KEY)

/* ── Currency data ── */
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',     flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro',          flag: '🇪🇺', symbol: '€' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
  { code: 'NGN', name: 'Naira',         flag: '🇳🇬', symbol: '₦' },
  { code: 'GHS', name: 'Cedi',          flag: '🇬🇭', symbol: '₵' },
  { code: 'KES', name: 'Shilling',      flag: '🇰🇪', symbol: 'KSh' },
  { code: 'BTC', name: 'Bitcoin',       flag: '₿',   symbol: '₿' },
  { code: 'ETH', name: 'Ethereum',      flag: '⬡',   symbol: 'Ξ' },
  { code: 'USDT',name: 'Tether',        flag: '💵',  symbol: '₮' },
]

/* ── Toast ── */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast')
  t.textContent = (type === 'success' ? '✓ ' : '✕ ') + msg
  t.className = `toast ${type} show`
  setTimeout(() => t.classList.remove('show'), 3000)
}

/* ── Greeting ── */
function setGreeting() {
  const h = new Date().getHours()
  const g = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  document.getElementById('timeGreeting').textContent = g
  document.getElementById('dashDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

/* ── Render wallets ── */
function renderWallets(wallets) {
  const grid = document.getElementById('walletsGrid')

  if (!wallets.length) {
    grid.innerHTML = `
      <div class="wallets-empty">
        <div class="wallets-empty-icon">💳</div>
        <h3>No wallets yet</h3>
        <p>Add your first currency to get started</p>
        <button class="btn-add-wallet" onclick="openModal()">+ Add Currency</button>
      </div>`
    return
  }

  grid.innerHTML = wallets.map(w => {
    const cur = CURRENCIES.find(c => c.code === w.currency) || { flag: '💱', symbol: '', name: w.currency }
    const bal = parseFloat(w.balance).toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 8
    })
    return `
      <div class="wallet-card">
        <span class="wallet-flag">${cur.flag}</span>
        <div class="wallet-currency">${w.currency}</div>
        <div class="wallet-balance"><span class="symbol">${cur.symbol}</span>${bal}</div>
        <div class="wallet-name">${cur.name}</div>
      </div>`
  }).join('')
}

/* ── Load wallets ── */
async function loadWallets() {
  const { data, error } = await client.from('wallets').select('*').order('created_at')
  if (error) { showToast('Failed to load wallets', 'error'); return }
  renderWallets(data || [])
}

/* ── Modal ── */
let selectedCurrency = null

function openModal() {
  selectedCurrency = null
  document.getElementById('btnConfirmWallet').disabled = true
  document.getElementById('modalOverlay').classList.add('open')
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open')
}

async function buildCurrencyGrid() {
  // Find which currencies user already has
  const { data } = await client.from('wallets').select('currency')
  const existing = (data || []).map(w => w.currency)

  const grid = document.getElementById('currencyGrid')
  grid.innerHTML = CURRENCIES.map(c => {
    const has = existing.includes(c.code)
    return `
      <div class="currency-option ${has ? 'selected' : ''}"
           style="${has ? 'opacity:0.4;pointer-events:none' : ''}"
           onclick="selectCurrency('${c.code}', this)">
        <span class="flag">${c.flag}</span>
        <div class="code">${c.code}</div>
        <div class="name">${c.name}</div>
      </div>`
  }).join('')
}

function selectCurrency(code, el) {
  document.querySelectorAll('.currency-option').forEach(o => o.classList.remove('selected'))
  el.classList.add('selected')
  selectedCurrency = code
  document.getElementById('btnConfirmWallet').disabled = false
}

async function confirmAddWallet() {
  if (!selectedCurrency) return
  const btn = document.getElementById('btnConfirmWallet')
  btn.textContent = 'Adding…'
  btn.disabled = true

  const { error } = await client.from('wallets').insert({
    currency: selectedCurrency,
    balance: 0
  })

  if (error) {
    showToast(error.message, 'error')
    btn.textContent = 'Add Wallet'
    btn.disabled = false
  } else {
    showToast(`${selectedCurrency} wallet added`)
    closeModal()
    loadWallets()
  }
}

/* ── Auth ── */
async function initUser() {
  const { data: { user } } = await client.auth.getUser()

  if (!user) {
    window.location.href = 'login.html'
    return
  }

  const email = user.email || ''
  const initials = email.slice(0, 2).toUpperCase()
  document.getElementById('userAvatar').textContent = initials
  document.getElementById('userEmail').textContent = email
  document.getElementById('userName').textContent = email.split('@')[0]
}

document.getElementById('btnSignOut').addEventListener('click', async () => {
  await client.auth.signOut()
  window.location.href = 'login.html'
})

document.getElementById('btnAddWallet').addEventListener('click', () => {
  buildCurrencyGrid()
  openModal()
})

document.getElementById('modalClose').addEventListener('click', closeModal)
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal()
})
document.getElementById('btnConfirmWallet').addEventListener('click', confirmAddWallet)

/* ── Init ── */
setGreeting()
initUser()
loadWallets()
