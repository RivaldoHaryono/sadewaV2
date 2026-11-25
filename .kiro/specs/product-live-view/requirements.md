# Requirements Document

## Introduction

Fitur **Product Live View** adalah peningkatan menyeluruh terhadap modal detail produk yang saat ini ada di Sadewa Elektronik (`id="dlg"`). Saat ini modal menampilkan ilustrasi SVG sederhana dan kontrol dasar. Tujuan fitur ini adalah menghadirkan pengalaman melihat dan mengonfigurasi produk yang terasa profesional, elegan, dan fungsional — setara dengan standar situs e-commerce modern — tanpa mengganti stack vanilla HTML/CSS/JS yang sudah ada dan tanpa melanggar design system yang berlaku.

Fitur mencakup: tata letak modal yang diperbaiki, transisi dan animasi yang bermakna, kontrol interaktif per tipe produk yang lebih jelas, presentasi harga yang informatif, dan jalur konversi (WhatsApp) yang lebih kuat.

---

## Glossary

- **Modal**: Elemen `<dialog id="dlg">` yang muncul saat pengguna mengklik kartu produk.
- **Live_View**: Area visual di sisi kiri modal yang menampilkan simulasi atau ilustrasi produk secara interaktif.
- **Control_Panel**: Area di sisi kanan modal yang berisi nama produk, harga, kontrol konfigurasi, dan tombol aksi.
- **Product_Type**: Kategori teknis produk yang menentukan jenis kontrol dan live view yang ditampilkan. Nilai yang valid: `lamp`, `cable`, `fan`, `drill`, `tape`, `switch`, `qty`.
- **Config_State**: Nilai konfigurasi aktif yang dipilih pengguna (mis. kecepatan kipas, panjang kabel, warna cahaya lampu).
- **Derived_Price**: Harga yang dihitung ulang berdasarkan Config_State (berlaku untuk `cable` dan `qty`).
- **CTA**: Tombol atau tautan aksi utama — dalam konteks ini adalah tautan pesan via WhatsApp.
- **Design_System**: Kumpulan token CSS (`--bg`, `--bg2`, `--ink`, `--mute`, `--glow`, `--btn`, `--btnink`, `--line`, `--jacket`, `--sheen`), font Hanken Grotesk, dan pola komponen yang sudah dipakai di `in.css`.

---

## Requirements

### Requirement 1: Tata Letak Modal yang Profesional

**User Story:** Sebagai pengunjung toko, saya ingin modal detail produk terlihat terstruktur dan bersih seperti halaman produk e-commerce modern, sehingga saya merasa percaya dengan kualitas toko ini.

#### Acceptance Criteria

1. THE Modal SHALL menggunakan tata letak dua kolom pada lebar viewport ≥ 768px: kolom kiri untuk Live_View dan kolom kanan untuk Control_Panel, dengan rasio lebar 52:48.
2. WHEN lebar viewport < 768px, THE Modal SHALL beralih ke tata letak satu kolom dengan Live_View di atas dan Control_Panel di bawah.
3. THE Modal SHALL memiliki lebar maksimum 960px dan tinggi maksimum `calc(100dvh - 32px)`.
4. THE Modal SHALL menggunakan token warna dari Design_System (`--bg2` untuk latar, `--line` untuk border, `--ink` untuk teks utama) tanpa menambah nilai warna baru di luar token.
5. THE Modal SHALL dapat di-scroll secara vertikal pada sisi Control_Panel jika konten melebihi tinggi modal.
6. WHEN Modal dibuka, THE Live_View SHALL menampilkan ilustrasi produk yang sesuai dengan Product_Type secara langsung tanpa interaksi tambahan dari pengguna.

---

### Requirement 2: Live View yang Informatif per Tipe Produk

**User Story:** Sebagai pengunjung, saya ingin melihat simulasi atau ilustrasi produk yang bermakna sesuai jenisnya, sehingga saya bisa memahami produk sebelum memesan.

#### Acceptance Criteria

1. WHEN Product_Type adalah `lamp`, THE Live_View SHALL menampilkan simulasi cahaya yang berubah secara visual sesuai Config_State warna (hangat/netral/putih) dan daya watt produk.
2. WHEN Product_Type adalah `fan`, THE Live_View SHALL menampilkan animasi putaran kipas dengan kecepatan berbeda sesuai Config_State kecepatan (1, 2, atau 3).
3. WHEN Product_Type adalah `cable`, THE Live_View SHALL menampilkan ilustrasi penampang kabel dan indikator panjang yang berubah sesuai Config_State meter.
4. WHEN Product_Type adalah `drill`, THE Live_View SHALL menampilkan animasi kepala bor yang berputar dengan kecepatan berbeda sesuai Config_State (rendah atau tinggi).
5. WHEN Product_Type adalah `tape`, THE Live_View SHALL menampilkan ilustrasi meteran yang ditarik sesuai Config_State panjang (cm).
6. WHEN Product_Type adalah `switch`, THE Live_View SHALL menampilkan ilustrasi sakelar menyala/mati sesuai Config_State.
7. WHEN Product_Type adalah `qty`, THE Live_View SHALL menampilkan representasi visual jumlah unit sesuai Config_State jumlah.
8. THE Live_View SHALL selalu menyertakan label deskriptif yang menjelaskan bahwa tampilan adalah simulasi atau ilustrasi, bukan foto produk.
9. IF Config_State berubah, THE Live_View SHALL memperbarui tampilannya dalam waktu ≤ 150ms.

---

### Requirement 3: Kontrol Konfigurasi yang Jelas dan Mudah Digunakan

**User Story:** Sebagai pengunjung, saya ingin mengatur spesifikasi produk (kecepatan, panjang, warna cahaya, dsb.) dengan cara yang intuitif, sehingga saya dapat menentukan kebutuhan sebelum memesan.

#### Acceptance Criteria

1. WHEN Product_Type memiliki pilihan diskret (lamp: warna cahaya; fan: kecepatan; drill: mode putaran; switch: nyala/mati), THE Control_Panel SHALL menampilkan chip/tombol pilihan dengan label teks yang jelas.
2. WHEN Product_Type memiliki nilai kontinu (cable: panjang meter; tape: panjang cm; qty: jumlah unit), THE Control_Panel SHALL menampilkan slider dengan label, nilai aktif, dan satuan yang selalu terlihat.
3. WHEN pengguna memilih chip atau menggeser slider, THE Control_Panel SHALL memperbarui tampilan nilai aktif secara real-time tanpa jeda yang terasa.
4. THE Control_Panel SHALL menandai pilihan chip yang aktif dengan state visual yang berbeda menggunakan token `--ink`/`--btn` dari Design_System.
5. THE Control_Panel SHALL memastikan setiap kontrol memiliki label yang dapat dibaca oleh pembaca layar (label teks eksplisit atau `aria-label`).
6. THE Control_Panel SHALL memastikan semua chip dan tombol memiliki ukuran target sentuh minimal 44px.

---

### Requirement 4: Presentasi Harga yang Informatif

**User Story:** Sebagai pengunjung, saya ingin melihat harga produk dengan jelas — termasuk harga yang berubah saat saya mengatur jumlah atau panjang — sehingga saya tahu total yang harus saya bayar.

#### Acceptance Criteria

1. THE Control_Panel SHALL selalu menampilkan harga produk dalam format `Rp X.XXX` menggunakan locale `id-ID`.
2. WHEN Product_Type adalah `cable` dan Config_State meter berubah, THE Control_Panel SHALL menampilkan Derived_Price yang dihitung dari harga per meter × jumlah meter, dan memperbarui tampilan dalam ≤ 100ms.
3. WHEN Product_Type adalah `qty` dan Config_State jumlah berubah, THE Control_Panel SHALL menampilkan Derived_Price yang dihitung dari harga satuan × jumlah unit, dan memperbarui tampilan dalam ≤ 100ms.
4. WHEN Derived_Price berbeda dari harga dasar, THE Control_Panel SHALL menampilkan keterangan perhitungan (mis. "5 meter × Rp 9.500") di bawah harga total.
5. THE Control_Panel SHALL menggunakan ukuran teks yang lebih besar dari teks isi biasa untuk menampilkan harga, dengan font-weight 300 sesuai Design_System.

---

### Requirement 5: Jalur Konversi yang Kuat

**User Story:** Sebagai pengunjung yang tertarik dengan produk, saya ingin bisa langsung menghubungi toko via WhatsApp dengan pesan yang sudah terisi detail produk dan konfigurasi saya, sehingga proses pemesanan terasa mudah.

#### Acceptance Criteria

1. THE Control_Panel SHALL menampilkan satu tombol CTA utama "Pesan lewat WhatsApp" yang mencolok menggunakan token `--btn` dan `--btnink`.
2. WHEN pengguna mengklik CTA, THE Control_Panel SHALL membuka tautan WhatsApp dengan pesan pra-isi yang menyertakan nama produk dan Config_State aktif saat itu.
3. WHEN Config_State berubah, THE Control_Panel SHALL memperbarui pesan pra-isi di tautan CTA secara otomatis.
4. THE Control_Panel SHALL menampilkan tombol sekunder "Tanya AI" dengan style outline untuk mengakses asisten teks.
5. THE Control_Panel SHALL menampilkan catatan stok singkat yang menginformasikan bahwa konfirmasi stok dilakukan via WhatsApp, tanpa menampilkan angka stok palsu.

---

### Requirement 6: Aksesibilitas dan Navigasi Keyboard

**User Story:** Sebagai pengguna yang mengandalkan keyboard atau pembaca layar, saya ingin dapat menggunakan modal detail produk secara penuh tanpa mouse, sehingga aksesibilitas toko terpenuhi.

#### Acceptance Criteria

1. WHEN Modal dibuka, THE Modal SHALL memindahkan fokus keyboard ke elemen pertama yang dapat difokus di dalam Modal.
2. WHILE Modal terbuka, THE Modal SHALL menjaga fokus keyboard tetap di dalam Modal (focus trap).
3. WHEN pengguna menekan tombol Escape, THE Modal SHALL menutup dirinya sendiri.
4. WHEN Modal ditutup, THE Modal SHALL mengembalikan fokus keyboard ke elemen yang memicunya (tombol "Lihat detail" pada kartu produk).
5. THE Modal SHALL memiliki atribut `aria-labelledby` yang merujuk ke judul produk di dalam Modal.
6. THE Modal SHALL memiliki atribut `role="dialog"` dan `aria-modal="true"`.
7. WHEN pengguna mengklik area backdrop di luar Modal, THE Modal SHALL menutup dirinya sendiri.

---

### Requirement 7: Animasi dan Transisi yang Bermakna

**User Story:** Sebagai pengunjung, saya ingin modal dan live view bergerak dengan halus saat dibuka, ditutup, dan saat konfigurasi berubah, sehingga pengalaman terasa profesional dan tidak mengagetkan.

#### Acceptance Criteria

1. WHEN Modal dibuka, THE Modal SHALL menampilkan animasi masuk (fade + scale kecil) dengan durasi 200ms–280ms dan easing `cubic-bezier(.2,.8,.2,1)`.
2. WHEN Modal ditutup, THE Modal SHALL menampilkan animasi keluar dengan durasi 150ms–200ms.
3. WHEN Config_State berubah dan Live_View diperbarui, THE Live_View SHALL menampilkan transisi yang halus (mis. opacity cross-fade) berdurasi 100ms–200ms.
4. WHEN pengguna menekan tombol atau chip, THE tombol SHALL memberikan respons visual (scale 0.97 atau perubahan opacity) dalam ≤ 100ms.
5. IF `prefers-reduced-motion: reduce` aktif, THE Modal SHALL menonaktifkan semua animasi dan transisi kecuali perubahan warna/opacity yang fungsional (≤ 1 frame).

---

### Requirement 8: Konsistensi dengan Design System

**User Story:** Sebagai pengembang, saya ingin perubahan live view mengikuti design system yang ada, sehingga tidak ada inkonsistensi visual antara modal dan bagian lain situs.

#### Acceptance Criteria

1. THE Modal SHALL menggunakan hanya token CSS yang terdefinisi di Design_System untuk semua warna, tanpa menambah nilai hex baru di stylesheet publik.
2. THE Modal SHALL menggunakan font Hanken Grotesk untuk semua teks dengan bobot 300 (heading), 400 (isi), dan 500 (label, tombol kecil).
3. THE Modal SHALL menggunakan border-radius yang konsisten dengan komponen lain: radius kecil (6px–8px) untuk kontainer dan 999px untuk chip dan tombol pill.
4. THE Modal SHALL menggunakan ikon SVG garis dengan stroke 1.3–1.5 tanpa fill untuk ikon antarmuka di dalam modal.
5. THE Control_Panel SHALL menggunakan pola chip/tombol yang sama dengan komponen `.chips` yang sudah ada di `in.css`.
