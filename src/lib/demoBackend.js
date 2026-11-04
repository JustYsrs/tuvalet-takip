import { TOTAL_SLOTS } from './slots'

// Supabase olmadan arayüzü denemek için tarayıcı içi sahte arka uç.
// Veriler localStorage'da tutulur; her sekme ayrı bir kullanıcıdır ve sekmeler arası canlı senkronize olur.

const STORE_KEY = 'tuvalet-takip:demo-slots'
const USER_KEY = 'tuvalet-takip:demo-user'
const LATENCY_MS = 250

const FAKE_USERS = [
  { id: 'demo-ayse', name: 'Ayşe' },
  { id: 'demo-mehmet', name: 'Mehmet K.' },
  { id: 'demo-zeynep', name: 'Zeynep' },
  { id: 'demo-can', name: 'Can' },
  { id: 'demo-elif', name: 'Elif Su' },
]

const SEED = [
  [0, 0], [1, 0], [7, 1], [8, 1], [9, 1], [21, 2], [22, 2],
  [30, 3], [36, 4], [37, 4], [45, 0], [52, 2], [60, 1], [66, 3], [71, 4],
]

const listeners = new Set()
const wait = () => new Promise((r) => setTimeout(r, LATENCY_MS))

function makeRow(index, user) {
  return { slot_index: index, owner_name: user.name, owner_id: user.id, claimed_at: new Date().toISOString() }
}

function seedRows() {
  return Object.fromEntries(SEED.map(([index, u]) => [index, makeRow(index, FAKE_USERS[u])]))
}

function read() {
  const raw = localStorage.getItem(STORE_KEY)
  if (raw) return JSON.parse(raw)
  const rows = seedRows()
  localStorage.setItem(STORE_KEY, JSON.stringify(rows))
  return rows
}

function write(rows) {
  localStorage.setItem(STORE_KEY, JSON.stringify(rows))
  listeners.forEach((fn) => fn())
}

function currentUserId() {
  let id = sessionStorage.getItem(USER_KEY)
  if (!id) {
    id = `demo-${crypto.randomUUID()}`
    sessionStorage.setItem(USER_KEY, id)
  }
  return id
}

export const demoBackend = {
  async ensureSession() {
    return { id: currentUserId() }
  },

  async list() {
    return Object.values(read())
  },

  subscribe({ onResync, onStatus }) {
    const onStorage = (e) => {
      if (e.key === STORE_KEY) onResync()
    }
    window.addEventListener('storage', onStorage)
    listeners.add(onResync)
    onStatus('live')
    return () => {
      window.removeEventListener('storage', onStorage)
      listeners.delete(onResync)
    }
  },

  async claim(index, ownerName) {
    await wait()
    const rows = read()
    if (rows[index]) return { ok: false, reason: 'taken' }
    const row = makeRow(index, { id: currentUserId(), name: ownerName })
    rows[index] = row
    localStorage.setItem(STORE_KEY, JSON.stringify(rows))
    return { ok: true, row }
  },

  async release(index) {
    await wait()
    const rows = read()
    if (!rows[index] || rows[index].owner_id !== currentUserId()) return { ok: false, reason: 'forbidden' }
    delete rows[index]
    localStorage.setItem(STORE_KEY, JSON.stringify(rows))
    return { ok: true }
  },
}

export function resetDemo() {
  write(seedRows())
}

export function fillDemoRandomly() {
  const rows = read()
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    if (!rows[i]) rows[i] = makeRow(i, FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)])
  }
  write(rows)
}
