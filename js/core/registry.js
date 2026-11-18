/*
 * NutriTrack: registry fitur
 * Setiap file di js/features/ mendaftarkan menu, aksi, dan tugas berkalanya di sini.
 * Menambah fitur baru = menambah satu file fitur + satu tag <script> di index.html.
 */
'use strict'

const App = (() => {
  const tabs = []
  const handlers = { click: {}, input: {}, change: {}, submit: {} }
  const ticks = []

  return {
    tabs,
    // tab = { id, label, order, view(ctx) }
    registerTab(tab) {
      tabs.push(tab)
      tabs.sort((a, b) => a.order - b.order)
    },
    has(id) {
      return tabs.some((t) => t.id === id)
    },
    // type = 'click' | 'input' | 'change' | 'submit'; map = { namaAksi: (elemen, event) => {} }
    on(type, map) {
      Object.assign(handlers[type], map)
    },
    handler(type, name) {
      return handlers[type][name]
    },
    // Tugas yang dijalankan setiap data berubah dan setiap 20 detik (misalnya cek pengingat)
    onTick(fn) {
      ticks.push(fn)
    },
    runTicks() {
      ticks.forEach((fn) => fn())
    },
  }
})()
