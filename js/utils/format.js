/*
 * NutriTrack: format angka, Rupiah, dan tanggal
 * Fungsi bantu kecil tanpa ketergantungan.
 */
'use strict'

const formatRp = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID')

const fmt = (n, digits = 0) =>
  Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: digits })

const pad = (n) => String(n).padStart(2, '0')

// Kunci tanggal lokal: YYYY-MM-DD
function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const todayKey = () => dateKey(new Date())

const monthKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`

// n hari terakhir, urut dari yang paling lama ke hari ini
function lastNDays(n, from = new Date()) {
  const keys = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from)
    d.setDate(d.getDate() - i)
    keys.push(dateKey(d))
  }
  return keys
}

function dayLabel(key, opts = { weekday: 'short', day: 'numeric' }) {
  return new Date(key + 'T00:00:00').toLocaleDateString('id-ID', opts)
}

function nowHHMM(d = new Date()) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

function formatAmount(grams, unit = 'g') {
  if (grams >= 1000) return `${fmt(grams / 1000, 2)} ${unit === 'ml' ? 'L' : 'kg'}`
  return `${fmt(grams)} ${unit}`
}
