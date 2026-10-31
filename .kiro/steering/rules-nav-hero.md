---
inclusion: always
---
ATURAN NAVBAR DAN HERO SADEWA ELEKTRONIK
Lanjutan dari rules-ui.md. Nomor melanjutkan 30.
F. NAVBAR
31. Menempel di atas. Tinggi 48px desktop, 56px mobile.
32. Susunan: logo kiri, maksimal 6 tautan teks di tengah, ikon cari dan tombol WhatsApp di kanan.
33. Tautan teks 14px, berat 400, warna var(--mute). Hover jadi var(--ink). Hanya warna yang berubah.
34. Latar var(--bg) opasitas 80% dengan backdrop-filter blur(20px). Beri latar solid sebagai cadangan.
35. Garis 1px var(--line) di bawah navbar muncul hanya setelah halaman di-scroll.
36. Halaman aktif ditandai warna var(--ink) dan garis bawah 1px. Jangan hanya warna.
37. Mobile: tautan masuk ke menu layar penuh. Tombolnya ikon garis, minimal 44px.
38. Menu mobile: fokus terkunci di dalam, tombol Esc menutup, pakai aria-expanded.
39. Ada tautan "Lewati ke konten" yang muncul saat fokus keyboard.
40. Jangan pasang badge angka atau titik notifikasi jika fiturnya belum ada.
G. HERO
41. Tinggi minimal 100svh dikurangi tinggi navbar. Dilarang pakai 100vh.
42. Urutan: judul, satu kalimat, aksi, produk. Semua rata tengah.
43. Judul maksimal 4 kata. Berat 300. Ukuran clamp(40px, 8vw, 96px). Line-height 1.05. Letter-spacing -0.02em.
44. Kalimat pendukung maksimal 12 kata. Ukuran 19px sampai 21px. Warna var(--mute).
45. Isi hero harus fakta nyata. Kalau belum ada, tulis [ISI DATA ASLI].
EOFcat >> docs/antislop/rules-nav-hero.md <<'EOF'
46. Dilarang kata "terbaik", "premium", "revolusioner" tanpa bukti.
47. Aksi: satu tombol pill WhatsApp terisi. Satu tautan teks "Lihat produk" dengan panah. Tautan teks bukan tombol kedua.
48. Satu produk, satu foto asli, latar bersih, bayangan lembut. Format WebP.
49. Foto hero pakai aspect-ratio tetap agar layout tidak bergeser. Pakai fetchpriority="high". Jangan lazy-load foto hero.
50. Efek utama: cahaya var(--glow) di belakang produk, menyala pelan sekali saat halaman dibuka (0,8 sampai 1,2 detik).
51. Dilarang carousel otomatis, video autoplay, dan parallax berat.
52. Teks di atas gambar tetap kontras minimal 4.5:1.
H. RITME DAN RASA
53. Setelah hero, satu blok produk satu pesan. Jarak antar blok 96px desktop, 64px mobile.
54. Jarak memakai kelipatan 8px. Hanya satu skala ukuran huruf di seluruh halaman.
55. Transisi 150ms sampai 250ms. Easing cubic-bezier(.2,.8,.2,1).
56. Tombol memberi respons saat ditekan (skala 0.98 atau cahaya). Maksimal 100ms.
57. Data Firestore dimuat dengan kerangka (skeleton), bukan spinner.
58. Kondisi kosong ditulis jujur, misalnya "Produk belum tersedia".
UJI HERO: buka di 360, 768, 1024, 1280. Nyalakan reduced motion. Pastikan tidak ada geser horizontal.
