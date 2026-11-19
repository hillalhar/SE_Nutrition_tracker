/*
 * NutriTrack: state & penyimpanan (lapisan data)
 * Semua data user disimpan di localStorage browser dengan awalan nt_.
 * Hanya file ini yang membaca dan menulis localStorage untuk data aplikasi.
 */
'use strict'

// Kunci localStorage untuk setiap jenis data
const KEYS = {
  profile: 'nt_profile',
  logs: 'nt_logs',
  stock: 'nt_stock',
  prices: 'nt_prices',
}

const DEFAULT_PROFILE = { name: '', sex: 'male', age: 20, weight: 65, height: 170, activity: 'moderate', goal: 'maintenance' }

// Harga awal dari database bahan, dipakai untuk tombol "Reset" harga
const BASE_PRICE = Object.fromEntries(FOODS.map((f) => [f.id, f.price]))

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage diblokir: data tetap ada selama halaman terbuka
  }
}

// Hapus semua data NutriTrack di browser ini
function clearLocalData() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith('nt_')).forEach((k) => localStorage.removeItem(k))
  } catch {
    // storage diblokir: tidak ada yang perlu dihapus
  }
}

// Data yang disimpan
const state = {
  profile: load(KEYS.profile, null),
  logs: load(KEYS.logs, {}),
  stock: load(KEYS.stock, DEFAULT_STOCK),
  prices: load(KEYS.prices, {}),
}

// State tampilan (tidak disimpan)
const ui = {
  tab: 'hari-ini',
  editingProfile: false,
  form: { ...(state.profile || DEFAULT_PROFILE) },
  log: { date: todayKey(), query: '', category: 'semua', selectedId: null, grams: 100, meal: defaultMeal() },
  stockUi: { query: '', onlyEmpty: false },
  toasts: [],
  scrollToForm: false,
}

// Satu-satunya cara fitur mengubah data: simpan, kabari modul lain, lalu gambar ulang
function setState(key, value) {
  state[key] = value
  save(KEYS[key], value)
  render()
  App.runTicks()
}

function defaultMeal() {
  const h = new Date().getHours()
  if (h < 10) return 'Sarapan'
  if (h < 15) return 'Makan siang'
  if (h < 18) return 'Camilan'
  return 'Makan malam'
}

// Database bahan digabung dengan stok & harga yang diubah user
function getFoods() {
  return FOODS.map((f) => ({ ...f, price: state.prices[f.id] ?? f.price, available: state.stock[f.id] !== false }))
}

// Data yang dibutuhkan semua halaman, dihitung sekali setiap render
function getContext() {
  const foods = getFoods()
  const foodById = Object.fromEntries(foods.map((f) => [f.id, f]))
  const todayEntries = state.logs[todayKey()] || []
  return {
    profile: state.profile,
    targets: calcTargets(state.profile),
    foods, foodById, todayEntries, todayTotals: sumNutrients(todayEntries, foodById),
  }
}
