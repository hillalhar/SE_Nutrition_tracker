# NutriTrack

Aplikasi web untuk mencatat asupan gizi, menentukan kebutuhan nutrisi sesuai tujuan (bulking, cutting, diet, atau kebutuhan harian), mengecek stok bahan pangan beserta alternatifnya, dan menyusun rencana makan sesuai budget bulanan.

Project mata kuliah Software Engineering, Kelompok 5. Mendukung SDG 3: Good Health and Well-Being.

## Status pengembangan (versi React)

| Tahap | Fitur | Isi | Status |
|---|---|---|---|
| 01 | Kerangka aplikasi | Struktur proyek React + Vite, navigasi 6 menu, tampilan dasar | Selesai |
| 02 | Profil & target gizi | Onboarding profil, hitung BMR/TDEE (Mifflin-St Jeor) dan target makro sesuai tujuan | Selesai |
| 03 | Catat makan | Database 35 bahan pangan, pencarian, filter kategori, porsi, catatan per tanggal | Belum |
| 04 | Halaman Hari ini | Visual piring progres kalori & makro, status kurang/pas/lebih, saran makanan | Belum |
| 05 | Stok & substitusi | Tandai bahan kosong, bahan pengganti dengan gizi mirip, ubah harga bahan | Belum |
| 06 | Rencana budget | Menu 7 hari + daftar belanja sesuai budget bulanan (mode normal/hemat/minimal) | Belum |
| 07 | Ringkasan mingguan | Grafik kalori 7 hari, rata-rata gizi, hari paling konsisten, pengeluaran bulan ini | Belum |
| 08 | Pengingat & notifikasi | Pengingat jam makan, notifikasi target tercapai / kalori berlebih, ringkasan harian | Belum |

## Cara menjalankan

Butuh [Node.js](https://nodejs.org) versi 18 ke atas.

```bash
npm install      # install dependency (sekali saja)
npm run dev      # jalankan di http://localhost:5173
npm test         # jalankan unit test
```

Testing: 5 unit test perhitungan gizi.

## Tech stack

- React 18 + Vite 5
- CSS murni
- Vitest untuk unit test
- Data disimpan di `localStorage` browser

## Disclaimer

Perhitungan gizi bersifat perkiraan dan bukan pengganti saran ahli gizi atau dokter.
