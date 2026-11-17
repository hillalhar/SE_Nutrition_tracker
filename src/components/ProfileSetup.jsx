import { useState } from 'react'
import { ACTIVITY_LEVELS, GOALS, calcTargets } from '../utils/nutrition'
import { fmt } from '../utils/format'

const EMPTY = { name: '', sex: 'male', age: 20, weight: 65, height: 170, activity: 'moderate', goal: 'maintenance' }

function validate(p) {
  const errors = {}
  if (!(p.age >= 15 && p.age <= 80)) errors.age = 'Umur 15–80 tahun'
  if (!(p.weight >= 30 && p.weight <= 250)) errors.weight = 'Berat 30–250 kg'
  if (!(p.height >= 120 && p.height <= 230)) errors.height = 'Tinggi 120–230 cm'
  return errors
}

export default function ProfileSetup({ initial, onSave, onCancel, onReset }) {
  const [form, setForm] = useState(initial || EMPTY)
  const errors = validate(form)
  const valid = Object.keys(errors).length === 0
  const preview = valid ? calcTargets(form) : null

  const set = (key, numeric = false) => (e) =>
    setForm((f) => ({ ...f, [key]: numeric ? Number(e.target.value) : e.target.value }))

  return (
    <div className="setup">
      <div className="setup-intro">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>NutriTrack</span>
        </div>
        <h1>{initial ? 'Ubah profil gizi' : 'Isi piringmu sesuai tujuan dan budget'}</h1>
        <p className="lead">
          Data ini dipakai untuk menghitung kebutuhan kalori dan makronutrien harianmu.
          Semua tersimpan di browser ini saja.
        </p>
      </div>

      <form
        className="setup-form"
        onSubmit={(e) => { e.preventDefault(); if (valid) onSave(form) }}
      >
        <fieldset className="field-grid">
          <legend>Tentang kamu</legend>
          <label className="field span-2">
            <span>Nama panggilan</span>
            <input value={form.name} onChange={set('name')} placeholder="Contoh: Seb" />
          </label>
          <div className="field span-2">
            <span>Jenis kelamin</span>
            <div className="segmented">
              {[['male', 'Laki-laki'], ['female', 'Perempuan']].map(([v, l]) => (
                <label key={v} className={form.sex === v ? 'is-on' : ''}>
                  <input type="radio" name="sex" value={v} checked={form.sex === v} onChange={set('sex')} />
                  {l}
                </label>
              ))}
            </div>
          </div>
          {[['age', 'Umur', 'tahun'], ['weight', 'Berat', 'kg'], ['height', 'Tinggi', 'cm']].map(([k, l, u]) => (
            <label key={k} className="field">
              <span>{l}</span>
              <div className="input-unit">
                <input type="number" inputMode="decimal" value={form[k]} onChange={set(k, true)} aria-invalid={!!errors[k]} />
                <em>{u}</em>
              </div>
              {errors[k] && <small className="error">{errors[k]}</small>}
            </label>
          ))}
          <label className="field span-2">
            <span>Aktivitas harian</span>
            <select value={form.activity} onChange={set('activity')}>
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.id} value={a.id}>{a.label} — {a.desc}</option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Tujuanmu</legend>
          <div className="goal-grid">
            {Object.entries(GOALS).map(([id, g]) => (
              <label key={id} className={'goal-option' + (form.goal === id ? ' is-on' : '')}>
                <input type="radio" name="goal" value={id} checked={form.goal === id} onChange={set('goal')} />
                <strong>{g.label}</strong>
                <span>{g.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {preview && (
          <div className="target-preview">
            <div className="target-kcal">
              <b>{fmt(preview.kcal)}</b>
              <span>kkal per hari</span>
            </div>
            <dl>
              <div><dt>Protein</dt><dd>{preview.protein} g</dd></div>
              <div><dt>Karbohidrat</dt><dd>{preview.carbs} g</dd></div>
              <div><dt>Lemak</dt><dd>{preview.fat} g</dd></div>
              <div><dt>TDEE</dt><dd>{fmt(preview.tdee)} kkal</dd></div>
            </dl>
          </div>
        )}

        <p className="fineprint">
          Perhitungan memakai rumus Mifflin-St Jeor dan bersifat perkiraan, bukan saran medis.
          Konsultasikan ke ahli gizi untuk kondisi kesehatan khusus.
        </p>

        <div className="actions">
          <button type="submit" className="btn primary" disabled={!valid}>Simpan profil</button>
          {onCancel && <button type="button" className="btn" onClick={onCancel}>Batal</button>}
          {onReset && <button type="button" className="btn danger-text" onClick={onReset}>Hapus semua data</button>}
        </div>
      </form>
    </div>
  )
}
