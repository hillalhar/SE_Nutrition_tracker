import { GOALS } from '../utils/nutrition'
import { fmt } from '../utils/format'

// Ringkasan target gizi harian. Sementara dipakai di halaman Hari ini
// sampai halaman progres lengkap (Dashboard) selesai di tahap 04.
export default function TargetSummary({ profile, targets, todayKcal }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Target gizi harianmu</h2>
        <span className="muted">Tujuan: {GOALS[profile.goal].label}</span>
      </div>
      <div className="target-preview">
        <div className="target-kcal">
          <b>{fmt(targets.kcal)}</b>
          <span>kkal per hari</span>
        </div>
        <dl>
          <div><dt>Protein</dt><dd>{targets.protein} g</dd></div>
          <div><dt>Karbohidrat</dt><dd>{targets.carbs} g</dd></div>
          <div><dt>Lemak</dt><dd>{targets.fat} g</dd></div>
          <div><dt>TDEE</dt><dd>{fmt(targets.tdee)} kkal</dd></div>
        </dl>
      </div>
      {todayKcal === undefined ? (
        <p className="muted">Pencatatan makanan sedang dikembangkan di tahap berikutnya.</p>
      ) : (
        <p>Hari ini sudah tercatat <b>{fmt(todayKcal)} kkal</b> dari target {fmt(targets.kcal)} kkal.</p>
      )}
    </section>
  )
}
