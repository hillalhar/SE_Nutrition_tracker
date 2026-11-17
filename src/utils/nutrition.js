import { fmt } from './format'

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Jarang bergerak', desc: 'Kerja/kuliah duduk, hampir tidak olahraga', factor: 1.2 },
  { id: 'light', label: 'Ringan', desc: 'Olahraga 1–3 kali seminggu', factor: 1.375 },
  { id: 'moderate', label: 'Sedang', desc: 'Olahraga 3–5 kali seminggu', factor: 1.55 },
  { id: 'active', label: 'Aktif', desc: 'Olahraga berat 6–7 kali seminggu', factor: 1.725 },
  { id: 'very-active', label: 'Sangat aktif', desc: 'Atlet atau kerja fisik berat', factor: 1.9 },
]

// kcalFactor dikali TDEE; proteinPerKg per kg berat badan; fatPct porsi kalori dari lemak.
export const GOALS = {
  bulking: { label: 'Bulking', desc: 'Menambah massa otot, surplus kalori ±10%', kcalFactor: 1.1, proteinPerKg: 2.0, fatPct: 0.25 },
  cutting: { label: 'Cutting', desc: 'Membakar lemak sambil jaga otot, defisit ±20%', kcalFactor: 0.8, proteinPerKg: 2.2, fatPct: 0.25 },
  diet: { label: 'Diet', desc: 'Turun berat badan bertahap, defisit ±15%', kcalFactor: 0.85, proteinPerKg: 1.6, fatPct: 0.3 },
  maintenance: { label: 'Kebutuhan harian', desc: 'Menjaga berat badan dan memenuhi gizi tubuh', kcalFactor: 1.0, proteinPerKg: 1.2, fatPct: 0.3 },
}

export const MEALS = ['Sarapan', 'Makan siang', 'Makan malam', 'Camilan']

// Batas bawah kalori harian supaya rekomendasi tetap aman
const MIN_KCAL = { male: 1500, female: 1200 }

// Rumus Mifflin-St Jeor
export function calcBMR({ sex, weight, height, age }) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return sex === 'female' ? base - 161 : base + 5
}

export function calcTDEE(profile) {
  const level = ACTIVITY_LEVELS.find((a) => a.id === profile.activity) || ACTIVITY_LEVELS[0]
  return calcBMR(profile) * level.factor
}

export function calcTargets(profile) {
  const goal = GOALS[profile.goal] || GOALS.maintenance
  const bmr = calcBMR(profile)
  const tdee = calcTDEE(profile)
  const kcal = Math.round(Math.max(tdee * goal.kcalFactor, MIN_KCAL[profile.sex] || 1200))
  const protein = Math.round(profile.weight * goal.proteinPerKg)
  const fat = Math.round((kcal * goal.fatPct) / 9)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, fat, carbs }
}

export function nutrientsFor(food, grams) {
  const k = (Number(grams) || 0) / 100
  return {
    kcal: food.kcal * k,
    protein: food.protein * k,
    carbs: food.carbs * k,
    fat: food.fat * k,
    cost: food.price * k,
  }
}

export const ZERO = { kcal: 0, protein: 0, carbs: 0, fat: 0, cost: 0 }

export function addNutrients(a, b) {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    cost: a.cost + b.cost,
  }
}

// entries: catatan makan [{ foodId, grams }]
export function sumNutrients(entries = [], foodById = {}) {
  return entries.reduce((acc, e) => {
    const food = foodById[e.foodId]
    return food ? addNutrients(acc, nutrientsFor(food, e.grams)) : acc
  }, { ...ZERO })
}

// items: [{ food, grams }] (dipakai meal planner)
export function sumItems(items = []) {
  return items.reduce((acc, { food, grams }) => addNutrients(acc, nutrientsFor(food, grams)), { ...ZERO })
}

// 90–110% dianggap pas
export function statusOf(value, target) {
  if (!target) return 'pas'
  const r = value / target
  if (r < 0.9) return 'kurang'
  if (r > 1.1) return 'lebih'
  return 'pas'
}

// withName=false dipakai di tabel yang sudah menampilkan nama bahan
export function portionText(food, grams, withName = true) {
  const n = Math.round((grams / food.portion.grams) * 2) / 2
  const approx = n >= 0.5 ? ` (±${fmt(n, 1)} ${food.portion.unit})` : ''
  const name = withName ? ` ${food.name.toLowerCase()}` : ''
  return `${fmt(grams)} ${food.unit}${name}${approx}`
}

const round10 = (g) => Math.max(10, Math.round(g / 10) * 10)

const isProtein = (f) => f.category === 'protein-hewani' || f.category === 'protein-nabati'

// Saran makanan berikutnya berdasarkan sisa target hari ini
export function suggestNext(totals, targets, foods) {
  const available = foods.filter((f) => f.available !== false)
  const remKcal = targets.kcal - totals.kcal
  const remProtein = targets.protein - totals.protein

  if (totals.kcal > targets.kcal * 1.1) {
    return { tone: 'lebih', text: `Kalori sudah lewat ${fmt(-remKcal)} kkal dari target. Kalau masih lapar, pilih sayur atau buah.` }
  }
  if (remProtein > 10) {
    const best = available
      .filter((f) => isProtein(f) && (f.protein * 4) / f.kcal >= 0.3)
      .sort((a, b) => b.protein / b.price - a.protein / a.price)[0]
    if (best) {
      const grams = round10((Math.min(remProtein, 40) / best.protein) * 100)
      return { tone: 'kurang', text: `Protein masih kurang ${fmt(remProtein)} g. Coba tambah ${portionText(best, grams)}.` }
    }
  }
  if (remKcal > 150) {
    const best = available
      .filter((f) => f.category === 'karbohidrat')
      .sort((a, b) => b.kcal / b.price - a.kcal / a.price)[0]
    if (best) {
      const grams = round10((Math.min(remKcal, 600) / best.kcal) * 100)
      return { tone: 'kurang', text: `Masih ada ruang ${fmt(remKcal)} kkal. Contohnya ${portionText(best, grams)}.` }
    }
  }
  return { tone: 'pas', text: 'Kebutuhan kalori dan protein hari ini sudah terpenuhi.' }
}

export function dailyMessage(totals, targets) {
  const parts = [`Hari ini ${fmt(totals.kcal)} dari ${fmt(targets.kcal)} kkal.`]
  const gap = targets.protein - totals.protein
  if (gap > 5) parts.push(`Protein kurang ${fmt(gap)} g.`)
  else parts.push('Target protein tercapai.')
  return parts.join(' ')
}
