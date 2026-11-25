# Design Document: Product Live View

## Overview

Fitur ini menyempurnakan modal detail produk (`<dialog id="dlg">`) yang sudah ada di Sadewa Elektronik. Perubahan difokuskan pada tiga area: tata letak modal yang lebih terstruktur, kontrol konfigurasi yang lebih jelas per tipe produk, dan jalur konversi WhatsApp yang lebih kuat — semuanya di atas stack vanilla HTML/CSS/JS yang sudah ada tanpa library tambahan.

Pendekatan implementasi adalah **progressive enhancement** di dalam `openDetail()`: fungsi yang sama tetap menjadi entry point, tetapi markup yang dihasilkan, kelas CSS, dan logika update diperbaiki secara bertarget. Tidak ada refactor arsitektur.

---

## Architecture

### Alur Data

```
Klik kartu produk (.btn[data-i])
  └── openDetail(i)
        ├── Baca D[i]  (array produk)
        ├── Tentukan Product_Type (t = d[3])
        ├── Bangun markup modal (innerHTML)
        ├── Set Config_State awal (st)
        ├── Pasang event listener kontrol
        └── upd()  ─────────────────────────────────────────────────┐
                                                                     │
              ├── Pilih fungsi live view (lvLamp / lvCable / …)     │
              ├── Update #lvs (innerHTML ← SVG baru)                │
              ├── Update #dp (harga / Derived_Price)                │
              ├── Update #dpc (keterangan perhitungan, jika ada)     │
              └── Update #dwa href (tautan WhatsApp)                 │
                                                                     │
  Event kontrol (chip click / range input) ──────────────────────────┘
        └── Perbarui st[key] → panggil upd()
```

### Hubungan Komponen

```
<dialog id="dlg">
  ├── <form method="dialog">
  │     └── <button class="x"> (tutup)
  └── <div class="dg">  ← grid 52:48
        ├── <div class="lv">  ← Live View
        │     ├── <span class="live">Ilustrasi</span>
        │     ├── <div id="lvs">  ← SVG dirender di sini
        │     └── <p class="lvn" id="lvn">  ← catatan ilustrasi
        └── <div class="dd">  ← Control Panel
              ├── <small class="sub">  (subkategori)
              ├── <h2 id="dt">  (nama produk) — aria-labelledby
              ├── <div class="price" id="dp">  (harga)
              ├── <p id="dpc" class="price-calc">  (keterangan harga)
              ├── <div id="ctl">  (kontrol konfigurasi)
              ├── <p class="stk">  (info stok)
              └── <div class="row">
                    ├── <a class="btn" id="dwa">  (CTA WhatsApp)
                    └── <button class="btn o" id="dchat">  (Tanya AI)
```

Semua elemen ini dihasilkan oleh `openDetail()` melalui satu `innerHTML` — konsisten dengan pola yang sudah ada.

---

## Components and Interfaces

### 1. `openDetail(i)` — Fungsi Utama

Fungsi ini sudah ada di `in.js`. Yang diubah:

- Markup yang dihasilkan ditambah `aria-labelledby="dt"`, `role="dialog"`, `aria-modal="true"` langsung di elemen `<dialog>` (sudah ada di HTML, dikonfirmasi tetap).
- Tambah elemen `<p id="dpc" class="price-calc">` untuk keterangan Derived_Price.
- Setelah `dlg.showModal()`, pindahkan fokus ke elemen pertama yang dapat difokus di dalam modal.

**Antarmuka:**
```js
openDetail(i: number): void
// i = indeks produk dalam array D
```

### 2. `upd()` — Fungsi Update State

Fungsi inner di dalam `openDetail`. Sudah ada, diperluas:

- Selain `svg`, `note`, `ex`, `price`, sekarang juga hitung `calcNote` untuk `cable` dan `qty`.
- Set `$("dpc").textContent = calcNote` (kosong jika tidak relevan).
- Update `$("dwa").href` setiap kali state berubah (sudah ada, tetap dipertahankan).

### 3. Fungsi Live View per Tipe

Fungsi-fungsi ini sudah ada: `lvLamp`, `lvCable`, `lvFan`, `lvDrill`, `lvTape`, `lvSwitch`, `lvQty`. Tidak ada perubahan fungsional pada fungsi-fungsi ini. Perbaikan tata letak dilakukan lewat CSS.

### 4. Kontrol Konfigurasi

Dua pola kontrol yang sudah ada:

| Tipe | Kontrol | Produk |
|------|---------|--------|
| Chip/tombol (diskret) | `.chips button[data-j]` | lamp, fan, drill, switch |
| Slider + label nilai | `input[type=range]#rg1` | cable, tape, qty |

Tidak ada perubahan pola kontrol. Yang diperbaiki: label slider menggunakan `<label for="rg1">` yang tepat (sudah ada, dikonfirmasi), dan chip menggunakan `aria-pressed` (sudah ada).

### 5. Focus Management

Setelah `dlg.showModal()`, fokus dipindah ke tombol tutup (`.x`) sebagai elemen pertama yang dapat difokus. Ketika modal ditutup, fokus dikembalikan ke tombol kartu yang memicunya.

```js
// Simpan referensi pemicu sebelum showModal
const trigger = document.activeElement;
dlg.showModal();
dlg.querySelector('.x').focus();

// Saat tutup
dlg.addEventListener('close', () => trigger?.focus(), { once: true });
```

### 6. Animasi Modal

Ditambah via CSS `@keyframes` dan `::backdrop`:

```
buka  → fade-in + scale(0.97 → 1), 220ms, cubic-bezier(.2,.8,.2,1)
tutup → fade-out, 160ms (via JS: tambah class .closing sebelum close())
```

Semua animasi dimatikan jika `prefers-reduced-motion: reduce`.

---

## Data Models

### Array Produk `D` (tidak berubah)

```js
D[i] = [
  name,       // string  — nama produk
  category,   // string  — "rumah" | "listrik" | "tukang"
  price,      // number  — harga dasar (Rp)
  type,       // string  — "lamp"|"cable"|"fan"|"drill"|"tape"|"switch"|"qty"
  spec,       // number  — spesifikasi utama (watt, inci, mm, meter, dsb.)
  label,      // string  — label subkategori
]
```

### Config State `st` (tidak berubah)

```js
st = {
  k: number,  // lamp: indeks warna KT (0-2)
  m: number,  // cable: panjang meter
  cm: number, // tape: panjang cm
  q: number,  // qty: jumlah unit
  s: number,  // fan: kecepatan (1-3), drill: mode (1-2)
  o: number,  // switch: 0=mati, 1=nyala
}
```

### Derived Price

Dihitung langsung di `upd()`, tidak disimpan di state:

| Tipe | Rumus |
|------|-------|
| `cable` | `d[2] × st.m` |
| `qty` | `d[2] × st.q` |
| lainnya | `d[2]` (harga dasar) |

### Keterangan Harga (`calcNote`)

```js
// cable
calcNote = `${st.m} meter × ${rp(d[2])}`

// qty
calcNote = `${st.q} unit × ${rp(d[2])}`

// lainnya
calcNote = ""
```

---

## Error Handling

### Indeks Produk Tidak Valid

`openDetail(i)` dipanggil dari `$("grid").onclick` dengan `+b.dataset.i`. Jika entah bagaimana `i` di luar jangkauan `D`:

```js
if (!d) return; // guard di awal openDetail
```

### Token CSS Tidak Tersedia

Tidak ada fallback khusus diperlukan — browser akan menggunakan nilai `initial` jika token tidak terdefinisi. Semua token yang dipakai (`--bg2`, `--line`, `--ink`, `--mute`, `--glow`, `--btn`, `--btnink`) sudah terdefinisi di `:root` pada `in.css`.

### Modal Sudah Terbuka

`<dialog>.showModal()` melempar `InvalidStateError` jika modal sudah terbuka. Guard:

```js
if (dlg.open) dlg.close();
```

Ini menutup modal lama sebelum membuka yang baru.

### Animasi Keluar (Closing)

Animasi keluar memerlukan delay sebelum `dialog.close()` dipanggil. Jika animasi tidak selesai (mis. pengguna menekan Escape dengan cepat), browser akan menutup modal langsung via `<form method="dialog">`. Ini adalah perilaku yang dapat diterima — keselamatan data (tidak ada data yang hilang) lebih penting dari animasi sempurna.

### `prefers-reduced-motion`

Variabel `reduce` sudah dideklarasikan di awal `in.js`:

```js
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
```

Semua animasi CSS baru menggunakan `@media (prefers-reduced-motion: reduce)` untuk menonaktifkan diri. Animasi JS (spin kipas, bor) sudah menggunakan `reduce` — tidak perlu perubahan.

---

## Testing Strategy

### Mengapa Property-Based Testing Tidak Diterapkan

Fitur ini adalah **UI rendering dan interaksi modal** — kategori yang tidak cocok untuk PBT. Alasannya:

1. Fungsi live view (`lvLamp`, `lvFan`, dst.) menghasilkan string SVG. Tidak ada "properti universal" yang dapat diverifikasi secara otomatis pada output SVG tanpa parser HTML penuh.
2. Logika inti (harga derived, update state) adalah operasi aritmetika sederhana yang lebih tepat diuji dengan contoh spesifik.
3. Interaksi DOM (fokus, chip click, slider) memerlukan lingkungan browser nyata atau jsdom — bukan input space yang besar.
4. Animasi dan transisi tidak dapat diverifikasi dengan PBT.

Pendekatan yang tepat: **unit test berbasis contoh** + **pengujian manual** di browser.

---

### Unit Tests (Berbasis Contoh)

Dijalankan di Node.js dengan mengekstrak fungsi murni dari `in.js` atau dengan jsdom.

#### 1. Derived Price

```js
// Harga kabel: panjang × harga satuan
assert(derivedPrice({type:'cable', price:9500}, {m:5}) === 47500)
assert(derivedPrice({type:'cable', price:9500}, {m:1}) === 9500)

// Harga qty: jumlah × harga satuan
assert(derivedPrice({type:'qty', price:45000}, {q:3}) === 135000)

// Tipe lain: harga dasar tidak berubah
assert(derivedPrice({type:'lamp', price:12000}, {k:1}) === 12000)
```

#### 2. Keterangan Harga

```js
assert(calcNote('cable', 9500, {m:5}) === '5 meter × Rp 9.500')
assert(calcNote('qty', 45000, {q:3}) === '3 unit × Rp 45.000')
assert(calcNote('lamp', 12000, {k:1}) === '')
```

#### 3. Pesan WhatsApp

```js
// Konfirmasi pesan pra-isi menyertakan nama produk dan config
const href = buildWAHref('Kabel NYM 2x1,5 mm', 'cable', {m:5})
assert(href.includes('Kabel NYM'))
assert(href.includes('5 meter'))
```

#### 4. Format Harga

```js
assert(rp(9500) === 'Rp 9.500')
assert(rp(47500) === 'Rp 47.500')
assert(rp(1000000) === 'Rp 1.000.000')
```

---

### Integration Tests (Manual di Browser)

Checklist yang dijalankan secara manual pada lebar 360, 768, 1024, dan 1280 piksel:

#### Tata Letak

- [ ] Modal dua kolom (Live View kiri, Control Panel kanan) pada ≥ 768px
- [ ] Modal satu kolom pada < 768px (Live View atas, Control Panel bawah)
- [ ] Modal tidak melebihi `calc(100dvh - 32px)` di semua ukuran
- [ ] Control Panel dapat di-scroll jika konten panjang

#### Live View per Tipe

- [ ] `lamp`: SVG berubah saat chip warna diganti
- [ ] `fan`: Animasi putaran berbeda di setiap kecepatan; berhenti jika `reduced-motion`
- [ ] `cable`: Indikator panjang berubah saat slider digeser
- [ ] `drill`: Animasi bor berubah kecepatan; berhenti jika `reduced-motion`
- [ ] `tape`: Pita bergerak sesuai nilai slider
- [ ] `switch`: Ilustrasi nyala/mati berubah sesuai chip
- [ ] `qty`: Jumlah kotak berubah sesuai slider

#### Harga

- [ ] Harga `cable`: berubah sesuai panjang meter × harga satuan
- [ ] Harga `qty`: berubah sesuai jumlah × harga satuan
- [ ] Keterangan perhitungan muncul di bawah harga untuk `cable` dan `qty`
- [ ] Format `Rp X.XXX` konsisten di semua tipe

#### Aksesibilitas dan Keyboard

- [ ] Fokus masuk ke tombol Tutup saat modal dibuka
- [ ] Tab tidak keluar dari modal (focus trap)
- [ ] Escape menutup modal
- [ ] Fokus kembali ke tombol kartu saat modal ditutup
- [ ] `aria-labelledby="dt"` terbaca oleh screen reader
- [ ] Semua chip dan slider terjangkau keyboard
- [ ] Kontras teks minimum 4.5:1 di tema gelap dan terang

#### Animasi

- [ ] Animasi masuk modal (fade + scale) terlihat pada 200–280ms
- [ ] Animasi keluar modal berjalan sebelum dialog menutup
- [ ] Semua animasi mati saat `prefers-reduced-motion: reduce`

#### Konversi

- [ ] Tautan WhatsApp membuka `wa.me` dengan pesan pra-isi yang benar
- [ ] Pesan pra-isi diperbarui setiap kali konfigurasi berubah
- [ ] Tombol "Tanya AI" membuka panel chat dan menutup modal

---

### Smoke Tests

- [ ] Tidak ada error di konsol browser saat modal dibuka untuk setiap tipe produk (7 tipe)
- [ ] Tidak ada error saat modal dibuka lalu langsung ditutup dengan Escape
- [ ] Tidak ada `href="#"` aktif di dalam modal pada versi rilis
