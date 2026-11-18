/*
 * NutriTrack: fitur profil & target gizi
 * Onboarding profil, validasi input, dan pratinjau target kalori/makro.
 */
'use strict'

function validateProfile(p) {
  const errors = {}
  if (!(p.age >= 15 && p.age <= 80)) errors.age = 'Umur 15–80 tahun'
  if (!(p.weight >= 30 && p.weight <= 250)) errors.weight = 'Berat 30–250 kg'
  if (!(p.height >= 120 && p.height <= 230)) errors.height = 'Tinggi 120–230 cm'
  return errors
}

function viewSetup() {
  const form = ui.form
  const errors = validateProfile(form)
  const valid = Object.keys(errors).length === 0
  const preview = valid ? calcTargets(form) : null
  const editing = !!state.profile

  const numberField = (key, label, unit) => `
    <label class="field">
      <span>${label}</span>
      <div class="input-unit">
        <input type="text" inputmode="decimal" value="${form[key] || ''}" data-input="form" data-field="${key}" data-num="1" data-focus="form-${key}" ${errors[key] ? 'aria-invalid="true"' : ''}>
        <em>${unit}</em>
      </div>
      ${errors[key] ? `<small class="error">${errors[key]}</small>` : ''}
    </label>`

  return `
  <div class="setup">
    <div class="setup-intro">
      ${brand()}
      <h1>${editing ? 'Ubah profil gizi' : 'Isi piringmu sesuai tujuan dan budget'}</h1>
      <p class="lead">Data ini dipakai untuk menghitung kebutuhan kalori dan makronutrien harianmu. Semua tersimpan di browser ini saja.</p>
    </div>

    <form class="setup-form" data-submit="profile" novalidate>
      <fieldset class="field-grid">
        <legend>Tentang kamu</legend>
        <label class="field span-2">
          <span>Nama panggilan</span>
          <input value="${esc(form.name)}" maxlength="40" placeholder="Contoh: Seb" data-input="form" data-field="name" data-focus="form-name">
        </label>
        <div class="field span-2">
          <span>Jenis kelamin</span>
          <div class="segmented">
            ${[['male', 'Laki-laki'], ['female', 'Perempuan']].map(([v, l]) => `
              <label class="${form.sex === v ? 'is-on' : ''}">
                <input type="radio" name="sex" value="${v}" ${form.sex === v ? 'checked' : ''} data-input="form" data-field="sex">${l}
              </label>`).join('')}
          </div>
        </div>
        ${numberField('age', 'Umur', 'tahun')}
        ${numberField('weight', 'Berat', 'kg')}
        ${numberField('height', 'Tinggi', 'cm')}
        <label class="field span-2">
          <span>Aktivitas harian</span>
          <select data-input="form" data-field="activity">
            ${ACTIVITY_LEVELS.map((a) => `<option value="${a.id}" ${form.activity === a.id ? 'selected' : ''}>${a.label} — ${a.desc}</option>`).join('')}
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Tujuanmu</legend>
        <div class="goal-grid">
          ${Object.entries(GOALS).map(([id, g]) => `
            <label class="goal-option${form.goal === id ? ' is-on' : ''}">
              <input type="radio" name="goal" value="${id}" ${form.goal === id ? 'checked' : ''} data-input="form" data-field="goal">
              <strong>${g.label}</strong>
              <span>${g.desc}</span>
            </label>`).join('')}
        </div>
      </fieldset>

      ${preview ? `
        <div class="target-preview">
          <div class="target-kcal"><b>${fmt(preview.kcal)}</b><span>kkal per hari</span></div>
          <dl>
            <div><dt>Protein</dt><dd>${preview.protein} g</dd></div>
            <div><dt>Karbohidrat</dt><dd>${preview.carbs} g</dd></div>
            <div><dt>Lemak</dt><dd>${preview.fat} g</dd></div>
            <div><dt>TDEE</dt><dd>${fmt(preview.tdee)} kkal</dd></div>
          </dl>
        </div>` : ''}

      <p class="fineprint">Perhitungan memakai rumus Mifflin-St Jeor dan bersifat perkiraan, bukan saran medis. Konsultasikan ke ahli gizi untuk kondisi kesehatan khusus.</p>

      <div class="actions">
        <button type="submit" class="btn primary" ${valid ? '' : 'disabled'}>Simpan profil</button>
        ${editing ? '<button type="button" class="btn" data-action="cancel-profile">Batal</button>' : ''}
        ${editing ? '<button type="button" class="btn danger-text" data-action="reset-all">Hapus semua data</button>' : ''}
      </div>
    </form>
  </div>`
}

function resetAll() {
  if (!window.confirm('Hapus semua data (profil, catatan makan, stok, pengingat)?')) return
  clearLocalData()
  window.location.reload()
}

App.on('click', {
  'edit-profile': () => {
    ui.form = { ...state.profile }
    ui.editingProfile = true
    render()
  },
  'cancel-profile': () => {
    ui.editingProfile = false
    render()
  },
  'reset-all': () => resetAll(),
})

App.on('input', {
  form: (el) => {
    ui.form[el.dataset.field] = el.dataset.num ? toNumber(el.value) : el.value
    render()
  },
})

App.on('submit', {
  profile: (el, e) => {
    e.preventDefault()
    if (Object.keys(validateProfile(ui.form)).length) return
    ui.editingProfile = false
    setState('profile', { ...ui.form })
  },
})
