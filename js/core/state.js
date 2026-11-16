/*
 * NutriTrack: state & penyimpanan (lapisan data)
 * Semua data user disimpan di localStorage browser dengan awalan nt_.
 * Hanya file ini yang membaca dan menulis localStorage untuk data aplikasi.
 */
'use strict'

// Kunci localStorage untuk setiap jenis data
const KEYS = {
  profile: 'nt_profile',
}

const DEFAULT_PROFILE = { name: '', sex: 'male', age: 20, weight: 65, height: 170, activity: 'moderate', goal: 'maintenance' }

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
}

// State tampilan (tidak disimpan)
const ui = {
  tab: 'hari-ini',
  editingProfile: false,
  form: { ...(state.profile || DEFAULT_PROFILE) },
  toasts: [],
}

// Satu-satunya cara fitur mengubah data: simpan, kabari modul lain, lalu gambar ulang
function setState(key, value) {
  state[key] = value
  save(KEYS[key], value)
  render()
  App.runTicks()
}

// Data yang dibutuhkan semua halaman, dihitung sekali setiap render
function getContext() {
  return {
    profile: state.profile,
    targets: calcTargets(state.profile),
  }
}
