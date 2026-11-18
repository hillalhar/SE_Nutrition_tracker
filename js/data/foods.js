/*
 * NutriTrack: database bahan pangan
 * Nilai gizi & estimasi harga per 100 g. Dipakai semua fitur.
 */
'use strict'

// Database bahan pangan.
// Nilai gizi per 100 g (atau 100 ml untuk minuman), perkiraan dari tabel komposisi pangan.
// Harga = estimasi Rupiah per 100 g/ml (harga pasar Jabodetabek, bisa diubah user di menu Stok & harga).
// group: bahan dengan group sama tidak dipasangkan dalam satu hari di meal plan (misal nasi putih + nasi merah).

const CATEGORIES = {
  karbohidrat: 'Karbohidrat',
  'protein-hewani': 'Protein hewani',
  'protein-nabati': 'Protein nabati',
  sayur: 'Sayur',
  buah: 'Buah',
  susu: 'Susu & olahan',
  lemak: 'Lemak & kacang',
}

const f = (id, name, category, kcal, protein, carbs, fat, price, portion, extra = {}) => ({
  id, name, category, kcal, protein, carbs, fat, price,
  unit: 'g', group: id, portion, ...extra,
})

const FOODS = [
  // Karbohidrat
  f('nasi-putih', 'Nasi putih', 'karbohidrat', 130, 2.7, 28.2, 0.3, 500, { grams: 150, unit: 'piring' }, { group: 'nasi' }),
  f('nasi-merah', 'Nasi merah', 'karbohidrat', 111, 2.6, 23, 0.9, 800, { grams: 150, unit: 'piring' }, { group: 'nasi' }),
  f('kentang', 'Kentang rebus', 'karbohidrat', 87, 1.9, 20, 0.1, 1800, { grams: 150, unit: 'buah' }),
  f('ubi-jalar', 'Ubi jalar rebus', 'karbohidrat', 86, 1.6, 20.1, 0.1, 1200, { grams: 130, unit: 'buah' }),
  f('jagung', 'Jagung rebus', 'karbohidrat', 96, 3.4, 21, 1.5, 1200, { grams: 100, unit: 'tongkol' }),
  f('oatmeal', 'Oatmeal (kering)', 'karbohidrat', 389, 16.9, 66.3, 6.9, 4500, { grams: 40, unit: 'porsi' }),
  f('roti-gandum', 'Roti gandum', 'karbohidrat', 247, 13, 41, 3.4, 3500, { grams: 30, unit: 'lembar' }),

  // Protein hewani
  f('dada-ayam', 'Dada ayam tanpa kulit', 'protein-hewani', 120, 22.5, 0, 2.6, 5500, { grams: 100, unit: 'potong' }, { group: 'ayam' }),
  f('paha-ayam', 'Paha ayam', 'protein-hewani', 180, 18, 0, 12, 4000, { grams: 100, unit: 'potong' }, { group: 'ayam' }),
  f('telur', 'Telur ayam', 'protein-hewani', 155, 12.6, 1.1, 10.6, 2800, { grams: 55, unit: 'butir' }),
  f('daging-sapi', 'Daging sapi', 'protein-hewani', 250, 26, 0, 15, 13000, { grams: 100, unit: 'potong' }),
  f('ikan-tongkol', 'Ikan tongkol', 'protein-hewani', 117, 25, 0, 1, 4000, { grams: 100, unit: 'potong' }),
  f('ikan-lele', 'Ikan lele', 'protein-hewani', 105, 18, 0, 2.9, 3000, { grams: 100, unit: 'ekor' }),
  f('udang', 'Udang', 'protein-hewani', 99, 24, 0.2, 0.3, 9000, { grams: 100, unit: 'porsi' }),

  // Protein nabati
  f('tempe', 'Tempe', 'protein-nabati', 193, 19, 9.4, 10.8, 1500, { grams: 50, unit: 'potong' }),
  f('tahu', 'Tahu putih', 'protein-nabati', 76, 8, 1.9, 4.8, 1200, { grams: 80, unit: 'potong' }),
  f('edamame', 'Edamame', 'protein-nabati', 121, 11.9, 8.9, 5.2, 4000, { grams: 100, unit: 'mangkuk' }),
  f('kacang-hijau', 'Kacang hijau (kering)', 'protein-nabati', 347, 23.9, 62.6, 1.2, 2500, { grams: 50, unit: 'porsi' }),

  // Sayur
  f('kangkung', 'Kangkung', 'sayur', 19, 2.6, 3.1, 0.2, 1000, { grams: 100, unit: 'mangkuk' }),
  f('sawi-hijau', 'Sawi hijau', 'sayur', 13, 1.5, 2.2, 0.2, 1000, { grams: 100, unit: 'mangkuk' }),
  f('bayam', 'Bayam', 'sayur', 23, 2.9, 3.6, 0.4, 1500, { grams: 100, unit: 'mangkuk' }),
  f('buncis', 'Buncis', 'sayur', 31, 1.8, 7, 0.1, 1500, { grams: 100, unit: 'mangkuk' }),
  f('wortel', 'Wortel', 'sayur', 41, 0.9, 9.6, 0.2, 1500, { grams: 80, unit: 'buah' }),
  f('brokoli', 'Brokoli', 'sayur', 34, 2.8, 6.6, 0.4, 3500, { grams: 100, unit: 'mangkuk' }),

  // Buah
  f('pepaya', 'Pepaya', 'buah', 43, 0.5, 10.8, 0.3, 1000, { grams: 150, unit: 'potong' }),
  f('semangka', 'Semangka', 'buah', 30, 0.6, 7.6, 0.2, 1000, { grams: 200, unit: 'potong' }),
  f('pisang', 'Pisang', 'buah', 89, 1.1, 22.8, 0.3, 1500, { grams: 100, unit: 'buah' }),
  f('jeruk', 'Jeruk', 'buah', 47, 0.9, 11.8, 0.1, 2500, { grams: 130, unit: 'buah' }),
  f('apel', 'Apel', 'buah', 52, 0.3, 13.8, 0.2, 4000, { grams: 150, unit: 'buah' }),

  // Susu & olahan
  f('susu-uht', 'Susu UHT full cream', 'susu', 61, 3.2, 4.8, 3.3, 1800, { grams: 250, unit: 'kotak' }, { unit: 'ml' }),
  f('susu-kedelai', 'Susu kedelai', 'susu', 54, 3.3, 6, 1.8, 1500, { grams: 250, unit: 'gelas' }, { unit: 'ml' }),
  f('yogurt', 'Yogurt plain', 'susu', 61, 3.5, 4.7, 3.3, 4000, { grams: 100, unit: 'cup' }),

  // Lemak & kacang
  f('minyak', 'Minyak goreng', 'lemak', 884, 0, 0, 100, 1800, { grams: 10, unit: 'sdm' }),
  f('kacang-tanah', 'Kacang tanah', 'lemak', 567, 25.8, 16.1, 49.2, 3500, { grams: 30, unit: 'genggam' }),
  f('selai-kacang', 'Selai kacang', 'lemak', 588, 25, 20, 50, 6000, { grams: 16, unit: 'sdm' }),
  f('alpukat', 'Alpukat', 'lemak', 160, 2, 8.5, 14.7, 3000, { grams: 100, unit: 'setengah buah' }),
]

