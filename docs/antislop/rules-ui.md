# ATURAN UI SADEWA ELEKTRONIK

## A. IDENTITAS VISUAL
1. Gunakan design system dan token CSS yang sudah ada.
   Warna hanya melalui token seperti var(--bg), var(--ink),
   var(--mute), var(--glow), var(--btn), dan var(--line).
   Sesuaikan nama token dengan yang benar-benar tersedia.
   Jangan mengarang nilai warna atau mengganti token global.
2. Aksen hanya amber melalui token --glow.
   Jangan menambah aksen kedua, gradient ungu/biru, atau orb dekoratif.
3. Font utama Hanken Grotesk.
   Heading 300, isi 400, tombol dan judul kecil 500.
   Jangan memuat ulang font jika sudah tersedia.
4. Ikon menggunakan SVG garis dengan stroke 1.3-1.5 dan tanpa fill,
   kecuali ikon yang sudah menjadi bagian dari sistem yang ada.
   Jangan gunakan emoji sebagai ikon antarmuka.
5. Tombol dan chip berbentuk pill 999px.
   Kartu menggunakan radius kecil dan pembatas 1px var(--line).
   Pertahankan komponen lama jika sudah konsisten.
6. Animasi hanya untuk interaksi yang relevan dengan cahaya atau listrik.
   Dilarang menambahkan animasi dekoratif tanpa fungsi.
7. Hindari visual AI-slop:
   - Gradient mencolok dan glow berlebihan.
   - Glassmorphism yang tidak diperlukan.
   - Kartu berulang untuk setiap potongan konten.
   - Badge, ikon, bayangan, dan dekorasi tanpa fungsi.
   - Heading besar berlebihan dan layout template generik.
8. Prioritaskan kesederhanaan, keterbacaan, negative space,
   hierarki visual, dan konsistensi antarkomponen.

## B. REFERENSI DESAIN EKSTERNAL
9. Referensi Apple hanya untuk struktur dan kualitas interaksi,
   bukan untuk menyalin identitas visual atau keseluruhan desain.
10. Untuk Mega Menu, pelajari prinsip berikut jika relevan:
    - Panel navigasi lebar yang tersusun dalam kolom.
    - Hubungan yang jelas antara navbar dan panel menu.
    - Spacing dan hierarki tipografi yang konsisten.
    - Overlay atau backdrop blur yang terkendali.
    - Transisi buka/tutup yang halus dan tidak mengganggu.
11. Adaptasikan prinsip tersebut ke design system Sadewa Elektronik.
    Pertahankan warna, font, logo, tombol, dan identitas visual yang ada.
12. Jangan membuat Mega Menu atau mengubah navbar kecuali diminta.
    Referensi bukan izin untuk mendesain ulang seluruh halaman.

## C. KONTEN DAN KEJUJURAN
13. Semua teks antarmuka menggunakan bahasa Indonesia yang ringkas.
    Hindari kata kosong, jargon yang tidak perlu, dan em dash.
14. Jangan mengarang angka, rating, testimoni, kurir, bank,
    garansi, jam buka, stok, harga, atau status operasional.
    Data yang belum tersedia harus ditandai [ISI DATA ASLI]
    hanya pada catatan pengembangan, bukan halaman publik.
15. Halaman publik tidak boleh berisi catatan kerja, instruksi pemilik,
    placeholder, atau kata "demo".
16. Jangan memberi label AI pada fitur yang bukan AI.
    Jangan tampilkan "Online" atau indikator live tanpa data nyata.
17. Ilustrasi harus diberi label "Simulasi" atau "Ilustrasi".
    Foto produk harus berasal dari foto produk yang sebenarnya.
18. Satu CTA utama adalah WhatsApp.
    Jangan menambah tombol mengambang kedua tanpa alasan UX yang jelas.
19. Hindari href="#" dan tautan ke halaman generik pada versi rilis.
    Jangan merusak tautan atau navigasi yang sudah berfungsi.

## D. TATA LETAK DAN AKSESIBILITAS
20. Gunakan pendekatan mobile-first.
    Periksa lebar 360, 768, 1024, dan 1280 piksel.
21. Target sentuh minimal 44px dan teks isi minimal 16px.
22. Pastikan kontras teks minimal 4.5:1 untuk kedua tema.
    Amber terang #c47a14 hanya untuk ikon besar dan outline,
    bukan teks kecil.
    Gunakan token warna yang sesuai dan jangan menambah hex baru.
23. Batas input dan tombol memiliki kontras minimal 3:1 terhadap latar.
24. Jangan menghapus outline fokus.
    Pastikan fungsi penting dapat digunakan dengan keyboard.
25. Hormati prefers-reduced-motion.
    Kurangi atau hentikan animasi sesuai preferensi pengguna.
26. Warna bukan satu-satunya penanda status.
27. Pastikan menu, modal, dan dropdown tidak terpotong viewport.
    Perhatikan scroll, Escape, klik di luar, dan fokus keyboard
    sesuai perilaku komponen yang bersangkutan.

## E. ATURAN PERUBAHAN
28. Ubah hanya yang diminta.
29. Jangan mengganti desain keseluruhan untuk menyelesaikan
    masalah pada satu komponen.
30. Jangan membuat komponen atau CSS baru jika solusi dapat
    menggunakan implementasi yang sudah ada.
31. Jangan mengubah logo, font, palet, atau design system
    tanpa persetujuan eksplisit.

## CARA MENJAWAB
Untuk perubahan kecil, tampilkan potongan kode yang berubah saja.
Untuk komponen lengkap yang diminta, tampilkan kode lengkap komponen.
Akhiri dengan satu baris singkat mengenai aturan yang dipatuhi.
