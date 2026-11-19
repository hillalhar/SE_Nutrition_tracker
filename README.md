# NutriTrack

Aplikasi web untuk mencatat asupan gizi, menentukan kebutuhan nutrisi sesuai tujuan (bulking, cutting, diet, atau kebutuhan harian), mengecek stok bahan pangan beserta alternatifnya, dan menyusun rencana makan sesuai budget bulanan.

Project mata kuliah Software Engineering, Kelompok 5. Mendukung SDG 3: Good Health and Well-Being.

## Status pengembangan

| Tahap | Fitur | Dikerjakan | Status |
|---|---|---|---|
| 01 | Profil & target gizi | Anggota 1 | ✅ Selesai |
| 02 | Catat makan | Anggota 2 | ✅ Selesai |
| 03 | Progres Hari ini | Anggota 3 | ✅ Selesai |
| 04 | Stok & harga | Anggota 4 | 🆕 Tahap ini |
| 05 | Bahan pengganti | Anggota 5 | ⏳ Belum |
| 06 | Rencana budget | Anggota 1 | ⏳ Belum |
| 07 | Ringkasan mingguan | Anggota 2 | ⏳ Belum |
| 08 | Pengingat & notifikasi | Anggota 3 | ⏳ Belum |
| 09 | Koneksi Supabase | Anggota 4 | ⏳ Belum |
| 10 | Login & daftar akun | Anggota 5 | ⏳ Belum |
| 11 | Profil ke database | Anggota 1 | ⏳ Belum |
| 12 | Catatan makan ke database | Anggota 2 | ⏳ Belum |
| 13 | Stok, harga & budget ke database | Anggota 3 | ⏳ Belum |
| 14 | Pengingat ke database | Anggota 4 | ⏳ Belum |
| 15 | Versi final | Anggota 5 | ⏳ Belum |

## Yang baru di tahap 04

- Menu baru Stok & harga: tandai bahan yang kosong dan ubah harga per 100 g.
- Bahan kosong diberi label "Kosong" di daftar Catat makan.

## Cara menjalankan

Tidak perlu install apa pun. **Double-click `index.html`**, aplikasi langsung terbuka di browser.
Untuk menjalankan unit test, buka `test.html` di browser. Hasilnya harus **"Semua 9 test lulus"**.

## Arsitektur

Aplikasi memakai **layered architecture** di dalam browser. Setiap lapisan hanya memanggil lapisan di bawahnya:

1. **Tampilan**: `css/`, fungsi `view...()` di `js/features/`, dan `render()` di `js/core/app.js`.
2. **Event handler**: `App.on(...)` di setiap file `js/features/`, diteruskan oleh `dispatch()` di `js/core/app.js`.
3. **Logika**: `js/logic/`. Murni perhitungan, tidak menyentuh HTML maupun penyimpanan, jadi bisa diuji di `test.html`.
4. **Data**: `js/data/foods.js` dan `js/core/state.js` (satu-satunya yang membaca/menulis localStorage).

## Struktur file

```
nutritrack/
├── css/
│   └── style.css
├── js/
│   ├── core/
│   │   ├── app.js
│   │   ├── helpers.js
│   │   ├── registry.js
│   │   └── state.js
│   ├── data/
│   │   └── foods.js
│   ├── features/
│   │   ├── dashboard.js
│   │   ├── foodlog.js
│   │   ├── profile.js
│   │   └── stock.js
│   ├── logic/
│   │   └── nutrition.js
│   └── utils/
│       └── format.js
├── README.md
├── index.html
└── test.html
```

## Disclaimer

Perhitungan gizi bersifat perkiraan dan bukan pengganti saran ahli gizi atau dokter.
