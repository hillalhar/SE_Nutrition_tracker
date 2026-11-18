/*
 * NutriTrack: fitur halaman Hari ini
 * Visual piring progres kalori & makro, status per makro, saran makanan berikutnya.
 */
'use strict'

function plateRing(totals, targets) {
  const ring = (r, width, value, target, color) => {
    const c = 2 * Math.PI * r
    const pct = target ? value / target : 0
    const stroke = pct > 1.1 ? 'var(--cabai)' : color
    return `
      <circle r="${r}" fill="none" stroke="var(--track)" stroke-width="${width}"></circle>
      <circle class="ring-arc" r="${r}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"
        stroke-dasharray="${c * Math.min(pct, 1)} ${c}" transform="rotate(-90)"></circle>`
  }
  const remaining = targets.kcal - totals.kcal
  return `
  <svg class="plate" viewBox="-130 -130 260 260" role="img" aria-label="${fmt(totals.kcal)} dari ${fmt(targets.kcal)} kilokalori">
    <circle r="126" fill="var(--surface)" stroke="var(--line)" stroke-width="1"></circle>
    ${ring(108, 16, totals.kcal, targets.kcal, 'var(--daun)')}
    ${ring(86, 9, totals.protein, targets.protein, 'var(--c-protein)')}
    ${ring(72, 9, totals.carbs, targets.carbs, 'var(--c-carbs)')}
    ${ring(58, 9, totals.fat, targets.fat, 'var(--c-fat)')}
    <text class="plate-num" y="-2" text-anchor="middle">${fmt(totals.kcal)}</text>
    <text class="plate-sub" y="20" text-anchor="middle">dari ${fmt(targets.kcal)} kkal</text>
    <text class="plate-sub" y="36" text-anchor="middle">${remaining >= 0 ? `sisa ${fmt(remaining)}` : `lewat ${fmt(-remaining)}`}</text>
  </svg>`
}

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'var(--c-protein)' },
  { key: 'carbs', label: 'Karbohidrat', color: 'var(--c-carbs)' },
  { key: 'fat', label: 'Lemak', color: 'var(--c-fat)' },
]

function viewDashboard(ctx) {
  const { profile, targets, todayEntries: entries, todayTotals: totals, foodById, foods } = ctx
  const suggestion = suggestNext(totals, targets, foods)
  const name = esc(profile.name || 'kamu')

  const meals = MEALS.map((meal) => {
    const list = entries.filter((e) => e.meal === meal && foodById[e.foodId])
    if (!list.length) return ''
    return `
      <div class="meal-group">
        <h3>${meal}</h3>
        <ul class="rows">
          ${list.map((e) => {
            const food = foodById[e.foodId]
            const n = nutrientsFor(food, e.grams)
            return `<li class="row">
              <span class="row-main">${food.name}<small>${fmt(e.grams)} ${food.unit}</small></span>
              <span class="row-num">${fmt(n.kcal)} kkal</span>
              <span class="row-num muted">${fmt(n.protein, 1)} g P</span>
            </li>`
          }).join('')}
        </ul>
      </div>`
  }).join('')

  return `
  <div class="dashboard">
    <section class="hero">
      ${plateRing(totals, targets)}
      <div class="hero-side">
        <p class="date-line">${dayLabel(todayKey(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 class="greeting">${entries.length ? `Piringmu hari ini, ${name}` : `Belum ada yang tercatat, ${name}`}</h1>
        <ul class="macro-list">
          ${MACROS.map((m) => `
            <li>
              <span class="swatch" style="background:${m.color}" aria-hidden="true"></span>
              <span class="macro-name">${m.label}</span>
              <span class="macro-val">${fmt(totals[m.key])} / ${targets[m.key]} g</span>
              ${statusBadge(statusOf(totals[m.key], targets[m.key]))}
            </li>`).join('')}
        </ul>
        <p class="suggestion tone-${suggestion.tone}">${suggestion.text}</p>
        <button class="btn primary" data-action="tab" data-tab="catat">Catat makan</button>
      </div>
    </section>

    <section class="panel">
      <div class="panel-head">
        <h2>Makanan hari ini</h2>
        <span class="muted">Target: ${GOALS[profile.goal].label}</span>
      </div>
      ${entries.length
        ? `<div class="meal-groups">${meals}</div>`
        : '<p class="empty">Catat sarapan atau makan terakhirmu supaya progres gizi terlihat di piring.</p>'}
    </section>

  </div>`
}

App.registerTab({ id: 'hari-ini', label: 'Hari ini', order: 1, view: viewDashboard })
