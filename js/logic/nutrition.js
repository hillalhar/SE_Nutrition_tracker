/*
 * NutriTrack: perhitungan gizi
 * BMR (Mifflin-St Jeor), TDEE, target makro, nilai gizi makanan, saran makanan.
 * Lapisan logika: tidak menyentuh tampilan maupun penyimpanan, jadi bisa diuji di test.html.
 */
'use strict'

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Jarang bergerak', desc: 'Kerja/kuliah duduk, hampir tidak olahraga', factor: 1.2 },
  { id: 'light', label: 'Ringan', desc: 'Olahraga 1–3 kali seminggu', factor: 1.375 },
  { id: 'moderate', label: 'Sedang', desc: 'Olahraga 3–5 kali seminggu', factor: 1.55 },
  { id: 'active', label: 'Aktif', desc: 'Olahraga berat 6–7 kali seminggu', factor: 1.725 },
  { id: 'very-active', label: 'Sangat aktif', desc: 'Atlet atau kerja fisik berat', factor: 1.9 },
]

// kcalFactor dikali TDEE; proteinPerKg per kg berat badan; fatPct porsi kalori dari lemak.
const GOALS = {
  bulking: { label: 'Bulking', desc: 'Menambah massa otot, surplus kalori ±10%', kcalFactor: 1.1, proteinPerKg: 2.0, fatPct: 0.25 },
  cutting: { label: 'Cutting', desc: 'Membakar lemak sambil jaga otot, defisit ±20%', kcalFactor: 0.8, proteinPerKg: 2.2, fatPct: 0.25 },
  diet: { label: 'Diet', desc: 'Turun berat badan bertahap, defisit ±15%', kcalFactor: 0.85, proteinPerKg: 1.6, fatPct: 0.3 },
  maintenance: { label: 'Kebutuhan harian', desc: 'Menjaga berat badan dan memenuhi gizi tubuh', kcalFactor: 1.0, proteinPerKg: 1.2, fatPct: 0.3 },
}

const MEALS = ['Sarapan', 'Makan siang', 'Makan malam', 'Camilan']

// Batas bawah kalori harian supaya rekomendasi tetap aman
const MIN_KCAL = { male: 1500, female: 1200 }

// Rumus Mifflin-St Jeor
function calcBMR({ sex, weight, height, age }) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return sex === 'female' ? base - 161 : base + 5
}

function calcTDEE(profile) {
  const level = ACTIVITY_LEVELS.find((a) => a.id === profile.activity) || ACTIVITY_LEVELS[0]
  return calcBMR(profile) * level.factor
}

function calcTargets(profile) {
  const goal = GOALS[profile.goal] || GOALS.maintenance
  const bmr = calcBMR(profile)
  const tdee = calcTDEE(profile)
  const kcal = Math.round(Math.max(tdee * goal.kcalFactor, MIN_KCAL[profile.sex] || 1200))
  const protein = Math.round(profile.weight * goal.proteinPerKg)
  const fat = Math.round((kcal * goal.fatPct) / 9)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, fat, carbs }
}

function nutrientsFor(food, grams) {
  const k = (Number(grams) || 0) / 100
  return {
    kcal: food.kcal * k,
    protein: food.protein * k,
    carbs: food.carbs * k,
    fat: food.fat * k,
    cost: food.price * k,
  }
}

const ZERO = { kcal: 0, protein: 0, carbs: 0, fat: 0, cost: 0 }

function addNutrients(a, b) {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
    cost: a.cost + b.cost,
  }
}

// entries: catatan makan [{ foodId, grams }]
function sumNutrients(entries = [], foodById = {}) {
  return entries.reduce((acc, e) => {
    const food = foodById[e.foodId]
    return food ? addNutrients(acc, nutrientsFor(food, e.grams)) : acc
  }, { ...ZERO })
}

