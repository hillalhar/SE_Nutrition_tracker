/*
 * NutriTrack: kerangka aplikasi
 * Menggambar halaman, meneruskan event ke fitur yang mendaftarkannya, dan memulai aplikasi.
 * File ini dimuat paling akhir.
 */
'use strict'

// ---------- Toast (pesan singkat di pojok layar) ----------
function pushToast(title, body) {
  const id = Date.now() + Math.random()
  ui.toasts.push({ id, title, body })
  renderToasts()
  setTimeout(() => {
    ui.toasts = ui.toasts.filter((t) => t.id !== id)
    renderToasts()
  }, 6000)
}

function renderToasts() {
  document.getElementById('toasts').innerHTML = ui.toasts
    .map((t) => `<div class="toast"><strong>${esc(t.title)}</strong><span>${esc(t.body)}</span></div>`)
    .join('')
}

// ---------- Kerangka halaman ----------
function viewShell() {
  const ctx = getContext()
  const tabs = App.tabs
  return `
  <div class="shell">
    <header class="topbar">
      ${brand()}
      <div class="topbar-side">
        <button class="profile-chip" data-action="edit-profile">
          <span class="profile-name">${esc(state.profile.name || 'Profil')}</span>
          <span class="profile-goal">${GOALS[state.profile.goal].label}</span>
        </button>
      </div>
    </header>
    <nav class="tabs" aria-label="Menu utama">
      ${tabs.map((t) => `<button class="tab${ui.tab === t.id ? ' is-active' : ''}" data-action="tab" data-tab="${t.id}" ${ui.tab === t.id ? 'aria-current="page"' : ''}>${t.label}</button>`).join('')}
    </nav>
    <main class="content">${(tabs.find((t) => t.id === ui.tab) || tabs[0]).view(ctx)}</main>
  </div>`
}

// ---------- Render utama ----------
// Seluruh isi #app digambar ulang. Fokus input & posisi scroll list dipertahankan
// supaya mengetik di kolom pencarian tidak terputus.
function render() {
  const active = document.activeElement
  const focus = active && active.dataset && active.dataset.focus
    ? { key: active.dataset.focus, start: safeSelection(active, 'selectionStart'), end: safeSelection(active, 'selectionEnd') }
    : null
  const scrolls = {}
  document.querySelectorAll('[data-keep-scroll]').forEach((el) => (scrolls[el.dataset.keepScroll] = el.scrollTop))

  const app = document.getElementById('app')
  app.innerHTML = !state.profile || ui.editingProfile ? viewSetup() : viewShell()

  document.querySelectorAll('[data-keep-scroll]').forEach((el) => {
    if (scrolls[el.dataset.keepScroll]) el.scrollTop = scrolls[el.dataset.keepScroll]
  })
  if (focus) {
    const el = document.querySelector(`[data-focus="${focus.key}"]`)
    if (el) {
      el.focus()
      try { if (focus.start !== null) el.setSelectionRange(focus.start, focus.end) } catch { /* input number */ }
    }
  }
  if (ui.scrollToForm) {
    ui.scrollToForm = false
    document.getElementById('entry-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function safeSelection(el, prop) {
  try {
    return el[prop]
  } catch {
    return null
  }
}

// ---------- Event ----------
// Satu listener per jenis event; elemen ditandai data-action / data-input / data-change / data-submit,
// lalu diteruskan ke handler yang didaftarkan fitur lewat App.on().
App.on('click', {
  tab: (el) => {
    ui.tab = el.dataset.tab
    render()
    window.scrollTo(0, 0)
  },
})

function dispatch(type, attr) {
  return (e) => {
    const el = type === 'click' ? e.target.closest(`[data-${attr}]`) : e.target
    if (!el || el.disabled || !el.dataset) return
    const fn = App.handler(type, el.dataset[attr])
    if (fn) fn(el, e)
  }
}

function init() {
  document.addEventListener('click', dispatch('click', 'action'))
  document.addEventListener('input', dispatch('input', 'input'))
  document.addEventListener('change', dispatch('change', 'change'))
  document.addEventListener('submit', dispatch('submit', 'submit'))
  if (!App.tabs.some((t) => t.id === ui.tab)) ui.tab = App.tabs[0].id
  render()
  App.runTicks()
  setInterval(() => App.runTicks(), 20000)
}

if (document.getElementById('app')) init()
