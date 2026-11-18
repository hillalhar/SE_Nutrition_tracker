/*
 * NutriTrack: helper tampilan
 * Fungsi kecil yang dipakai banyak fitur.
 */
'use strict'

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// "65,5" atau "65.5" -> 65.5; kosong -> 0
const toNumber = (v) => Number(String(v).replace(',', '.')) || 0

const STATUS_TEXT = { kurang: 'Kurang', pas: 'Pas', lebih: 'Lebih' }
const statusBadge = (st) => `<span class="status status-${st}">${STATUS_TEXT[st]}</span>`
const brand = () => '<div class="brand"><span class="brand-mark" aria-hidden="true"></span><span>NutriTrack</span></div>'
