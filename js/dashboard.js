/* ============================================================
   HexaHold — Dashboard JavaScript (dashboard.js)
   ============================================================ */

const { createClient } = supabase

const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_KEY = 'your-anon-key'
const client = createClient(SUPABASE_URL, SUPABASE_KEY)

/* ── Get current logged-in user ── */
async function getUser() {
  const { data: { user } } = await client.auth.getUser()
  return user
}

/* ── Fetch all wallets for current user ── */
async function getWallets() {
  const { data, error } = await client
    .from('wallets')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching wallets:', error.message)
    return []
  }
  return data
}

/* ── Add a new wallet ── */
async function addWallet(currency) {
  const { data, error } = await client
    .from('wallets')
    .insert({ currency: currency.toUpperCase(), balance: 0 })
    .select()
    .single()

  if (error) {
    console.error('Error creating wallet:', error.message)
    return null
  }
  return data
}