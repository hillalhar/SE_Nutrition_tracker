/*
 * NutriTrack: fitur stok & harga
 * Tandai bahan kosong, ubah harga per 100 g.
 */
'use strict'

function setPrice(id, value) {
  const n = Number(value)
  const next = { ...state.prices }
  if (!n || n === BASE_PRICE[id]) delete next[id]
  else next[id] = n
  setState('prices', next)
}

function viewStock(ctx) {
  const { foods } = ctx
  const S = ui.stockUi
  const q = S.query.trim().toLowerCase()
  const emptyCount = foods.filter((f) => !f.available).length
  const list = foods.filter((f) => (!S.onlyEmpty || !f.available) && (!q || f.name.toLowerCase().includes(q)))

  const groups = Object.keys(CATEGORIES)
    .map((cat) => [cat, list.filter((f) => f.category === cat)])
    .filter(([, items]) => items.length)
    .map(([cat, items]) => `
      <section class="panel">
        <h2 class="cat-title">${CATEGORIES[cat]}</h2>
        <ul class="rows">
          ${items.map((f) => {
            const edited = state.prices[f.id] !== undefined
            return `
              <li class="stock-row${f.available ? '' : ' is-empty'}">
                <div class="stock-main">
                  <span class="stock-name">${f.name}</span>
                  ${f.available ? '' : '<span class="stock-subs">Bahan ini sedang kosong</span>'}
                </div>
                <label class="price-field">
                  <span class="sr-only">Harga ${f.name} per 100 ${f.unit}</span>
                  <em>Rp</em>
                  <input type="number" min="0" step="100" value="${f.price}" data-change="price" data-id="${f.id}">
                  <em>/100 ${f.unit}</em>
                </label>
                ${edited ? `<button class="link small" data-action="price-reset" data-id="${f.id}" title="Harga awal ${formatRp(BASE_PRICE[f.id])}">Reset</button>` : ''}
                <button class="toggle${f.available ? ' is-on' : ''}" role="switch" aria-checked="${f.available}" data-action="stock-toggle" data-id="${f.id}">
                  ${f.available ? 'Tersedia' : 'Kosong'}
                </button>
              </li>`
          }).join('')}
        </ul>
      </section>`).join('')

  return `
  <div class="stack">
    <section class="panel">
      <div class="panel-head">
        <h2>Stok dan harga bahan</h2>
        <span class="muted">${emptyCount ? `${emptyCount} bahan kosong` : 'Semua bahan tersedia'}</span>
      </div>
      <p class="muted">Tandai bahan yang sedang kosong di tempat belanjamu, dan ubah harga supaya sesuai pasar di dekatmu.</p>
      <div class="toolbar">
        <input class="search" type="search" placeholder="Cari bahan" value="${esc(S.query)}" data-input="stock-query" data-focus="stock-query" aria-label="Cari bahan">
        <label class="check">
          <input type="checkbox" ${S.onlyEmpty ? 'checked' : ''} data-change="stock-only-empty">
          Hanya yang kosong
        </label>
        ${emptyCount ? '<button class="btn" data-action="stock-all">Tandai semua tersedia</button>' : ''}
      </div>
    </section>
    ${groups || '<p class="empty">Tidak ada bahan yang cocok dengan pencarian.</p>'}
  </div>`
}

App.registerTab({ id: 'stok', label: 'Stok & harga', order: 3, view: viewStock })

App.on('click', {
  'stock-toggle': (el) => {
    const id = el.dataset.id
    setState('stock', { ...state.stock, [id]: !(state.stock[id] !== false) })
  },
  'stock-all': () => setState('stock', {}),
  'price-reset': (el) => setPrice(el.dataset.id, BASE_PRICE[el.dataset.id]),
})

App.on('input', {
  'stock-query': (el) => {
    ui.stockUi.query = el.value
    render()
  },
})

App.on('change', {
  'stock-only-empty': (el) => {
    ui.stockUi.onlyEmpty = el.checked
    render()
  },
  price: (el) => {
    // Harga wajar: Rp 1 sampai Rp 1.000.000 per 100 g
    if (Number(el.value) > 0 && Number(el.value) <= 1000000) setPrice(el.dataset.id, el.value)
    else render()
  },
})
