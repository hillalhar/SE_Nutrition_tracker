import { describe, it, expect } from 'vitest'
import { calcBMR, calcTargets } from './nutrition'

const profile = { sex: 'male', age: 25, weight: 70, height: 175, activity: 'moderate', goal: 'maintenance' }

describe('perhitungan kebutuhan gizi', () => {
  it('BMR laki-laki sesuai rumus Mifflin-St Jeor', () => {
    expect(calcBMR(profile)).toBeCloseTo(1673.75)
  })

  it('BMR perempuan lebih rendah 166 kkal dari laki-laki dengan data sama', () => {
    expect(calcBMR(profile) - calcBMR({ ...profile, sex: 'female' })).toBeCloseTo(166)
  })

  it('target cutting < maintenance < bulking', () => {
    const cut = calcTargets({ ...profile, goal: 'cutting' }).kcal
    const main = calcTargets(profile).kcal
    const bulk = calcTargets({ ...profile, goal: 'bulking' }).kcal
    expect(cut).toBeLessThan(main)
    expect(main).toBeLessThan(bulk)
  })

  it('kalori tidak turun di bawah batas aman', () => {
    const t = calcTargets({ sex: 'female', age: 60, weight: 40, height: 145, activity: 'sedentary', goal: 'cutting' })
    expect(t.kcal).toBeGreaterThanOrEqual(1200)
  })

  it('total makro mendekati target kalori', () => {
    const t = calcTargets(profile)
    const fromMacros = t.protein * 4 + t.carbs * 4 + t.fat * 9
    expect(Math.abs(fromMacros - t.kcal)).toBeLessThan(15)
  })
})
