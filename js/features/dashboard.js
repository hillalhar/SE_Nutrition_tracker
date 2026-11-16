/*
 * NutriTrack: fitur halaman Hari ini
 * Target kalori & makro harian sesuai profil.
 */
'use strict'

// Versi awal halaman Hari ini: menampilkan target harian dari profil.
// Progres makan ditambahkan setelah fitur Catat makan ada.
function viewDashboard(ctx) {
  const { profile, targets } = ctx
  return `
  <div class="stack">
    <section class="panel">
      <p class="date-line">${dayLabel(todayKey(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      <h1 class="greeting">Target harianmu, ${esc(profile.name || 'kamu')}</h1>
      <p class="muted">Tujuan: ${GOALS[profile.goal].label}. ${GOALS[profile.goal].desc}.</p>
      <div class="target-preview">
        <div class="target-kcal"><b>${fmt(targets.kcal)}</b><span>kkal per hari</span></div>
        <dl>
          <div><dt>Protein</dt><dd>${targets.protein} g</dd></div>
          <div><dt>Karbohidrat</dt><dd>${targets.carbs} g</dd></div>
          <div><dt>Lemak</dt><dd>${targets.fat} g</dd></div>
          <div><dt>TDEE</dt><dd>${fmt(targets.tdee)} kkal</dd></div>
        </dl>
      </div>
      <div class="actions">
        <button class="btn" data-action="edit-profile">Ubah profil</button>
      </div>
    </section>
  </div>`
}

App.registerTab({ id: 'hari-ini', label: 'Hari ini', order: 1, view: viewDashboard })
