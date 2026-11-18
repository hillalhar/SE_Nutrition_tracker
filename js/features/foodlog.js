/*
 * NutriTrack: fitur catat makan
 * Pencarian & filter makanan, pengatur porsi, catatan per tanggal.
 */
'use strict'

function chooseFood(id) {
  const food = getFoods().find((f) => f.id === id)
  if (!food) return
  ui.log.selectedId = id
  ui.log.grams = food.portion.grams
  ui.scrollToForm = window.matchMedia('(max-width: 860px)').matches
  render()
}

function addLog() {
  const L = ui.log
  if (!L.selectedId || !(L.grams > 0 && L.grams <= 5000)) return
  const entry = { id: uid(), foodId: L.selectedId, grams: Number(L.grams), meal: L.meal, time: new Date().toISOString() }
  ui.log.selectedId = null
  setState('logs', { ...state.logs, [L.date]: [...(state.logs[L.date] || []), entry] })
}

function removeLog(id) {
  const date = ui.log.date
  setState('logs', { ...state.logs, [date]: (state.logs[date] || []).filter((e) => e.id !== id) })
}

function viewLog(ctx) {
  const { foods, foodById, targets } = ctx
  const L = ui.log
  const q = L.query.trim().toLowerCase()
  const filtered = foods.filter((f) => (L.category === 'semua' || f.category === L.category) && (!q || f.name.toLowerCase().includes(q)))
  const selected = L.selectedId ? foodById[L.selectedId] : null
  const dayEntries = state.logs[L.date] || []
  const dayTotals = sumNutrients(dayEntries, foodById)

  let form = '<p class="empty">Pilih makanan di daftar untuk mengatur porsi dan menambahkannya ke catatan.</p>'
  if (selected) {
    const preview = nutrientsFor(selected, L.grams)
    form = `
      <div class="entry-form">
        <h2>${selected.name}</h2>
        <div class="field-row">
          <label class="field">
            <span>Jumlah</span>
            <div class="input-unit">
              <input type="text" inputmode="numeric" value="${L.grams || ''}" data-input="log-grams" data-focus="log-grams">
              <em>${selected.unit}</em>
            </div>
          </label>
          <label class="field">
            <span>Waktu makan</span>
            <select data-change="log-meal">
              ${MEALS.map((m) => `<option ${m === L.meal ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="chips">
          ${[0.5, 1, 2].map((k) => `<button class="chip" data-action="log-portion" data-mult="${k}">${k === 0.5 ? '½' : k} ${selected.portion.unit} (${fmt(selected.portion.grams * k)} ${selected.unit})</button>`).join('')}
        </div>
        <dl class="nutri-grid">
          <div><dt>Kalori</dt><dd>${fmt(preview.kcal)} kkal</dd></div>
          <div><dt>Protein</dt><dd>${fmt(preview.protein, 1)} g</dd></div>
          <div><dt>Karbo</dt><dd>${fmt(preview.carbs, 1)} g</dd></div>
          <div><dt>Lemak</dt><dd>${fmt(preview.fat, 1)} g</dd></div>
          <div><dt>Biaya</dt><dd>${formatRp(preview.cost)}</dd></div>
        </dl>
        <button class="btn primary" data-action="log-add" ${L.grams > 0 && L.grams <= 5000 ? '' : 'disabled'}>Tambah ke ${L.meal.toLowerCase()}</button>
      </div>`
  }

  const entriesHtml = dayEntries.length ? `
    <ul class="rows">
      ${dayEntries.map((e) => {
        const food = foodById[e.foodId]
        if (!food) return ''
        const n = nutrientsFor(food, e.grams)
        return `<li class="row">
          <span class="row-main">${food.name}<small>${e.meal}, ${fmt(e.grams)} ${food.unit}</small></span>
          <span class="row-num">${fmt(n.kcal)} kkal</span>
          <button class="icon-btn" data-action="log-remove" data-id="${e.id}" aria-label="Hapus ${food.name}">×</button>
        </li>`
      }).join('')}
    </ul>
    <p class="total-line">Total ${fmt(dayTotals.kcal)} / ${fmt(targets.kcal)} kkal, protein ${fmt(dayTotals.protein)} / ${targets.protein} g, biaya ${formatRp(dayTotals.cost)}</p>`
    : '<p class="empty">Belum ada catatan di tanggal ini.</p>'

  return `
  <div class="split">
    <section class="panel">
      <div class="panel-head"><h2>Pilih makanan</h2></div>
      <input class="search" type="search" placeholder="Cari makanan, misal: tempe" value="${esc(L.query)}" data-input="log-query" data-focus="log-query" aria-label="Cari makanan">
      <div class="chips" role="group" aria-label="Kategori">
        ${[['semua', 'Semua'], ...Object.entries(CATEGORIES)].map(([id, label]) => `<button class="chip${L.category === id ? ' is-on' : ''}" data-action="log-category" data-cat="${id}">${label}</button>`).join('')}
      </div>
      <ul class="rows pick-list" data-keep-scroll="pick-list">
        ${filtered.map((f) => `
          <li>
            <button class="row row-btn${L.selectedId === f.id ? ' is-selected' : ''}" data-action="log-choose" data-id="${f.id}">
              <span class="row-main">${f.name}<small>${fmt(f.kcal)} kkal, ${fmt(f.protein, 1)} g protein per 100 ${f.unit}</small></span>
            </button>
          </li>`).join('')}
        ${filtered.length ? '' : '<li class="empty">Tidak ada makanan dengan nama itu. Coba kata lain atau pilih kategori Semua.</li>'}
      </ul>
    </section>

    <div class="stack">
      <section class="panel" id="entry-panel">${form}</section>
      <section class="panel">
        <div class="panel-head">
          <h2>Catatan ${L.date === todayKey() ? 'hari ini' : dayLabel(L.date, { day: 'numeric', month: 'short' })}</h2>
          <input type="date" class="date-input" value="${L.date}" max="${todayKey()}" data-change="log-date" aria-label="Tanggal catatan">
        </div>
        ${entriesHtml}
      </section>
    </div>
  </div>`
}

App.registerTab({ id: 'catat', label: 'Catat makan', order: 2, view: viewLog })

App.on('click', {
  'log-category': (el) => {
    ui.log.category = el.dataset.cat
    render()
  },
  'log-choose': (el) => chooseFood(el.dataset.id),
  'log-portion': (el) => {
    const food = getFoods().find((f) => f.id === ui.log.selectedId)
    ui.log.grams = food.portion.grams * Number(el.dataset.mult)
    render()
  },
  'log-add': () => addLog(),
  'log-remove': (el) => removeLog(el.dataset.id),
})

App.on('input', {
  'log-query': (el) => {
    ui.log.query = el.value
    render()
  },
  'log-grams': (el) => {
    ui.log.grams = toNumber(el.value)
    render()
  },
})

App.on('change', {
  'log-date': (el) => {
    if (el.value) ui.log.date = el.value
    render()
  },
  'log-meal': (el) => {
    ui.log.meal = el.value
    render()
  },
})
