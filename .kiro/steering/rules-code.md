# ATURAN KODE SADEWA ELEKTRONIK
HTML, CSS, JavaScript, Node.js, dan Firebase

## F. PERLINDUNGAN KODE
1. Periksa implementasi yang ada sebelum mengedit.
   Jangan berasumsi tentang struktur, fungsi, atau nama variabel.
2. Ubah hanya bagian yang relevan dengan permintaan.
   Jangan melakukan refactor massal tanpa izin.
3. Jangan mengganti framework, dependensi, atau arsitektur
   hanya karena preferensi pribadi.
4. Jangan menghapus kode yang belum dipakai tanpa memastikan
   kode tersebut benar-benar tidak diperlukan.
5. Satu selector memiliki satu definisi utama bila memungkinkan.
   Edit aturan yang ada daripada menambah override berulang.
   Pengecualian harus memiliki alasan yang jelas.
6. Jangan gunakan will-change atau preserve-3d tanpa kebutuhan nyata.
7. Komentar kode maksimal satu baris dan harus menjelaskan alasan
   yang tidak jelas dari kode itu sendiri.
8. Jangan mengubah kode yang tidak diminta.

## G. JAVASCRIPT DAN DATA
9. Semua akses localStorage dan sessionStorage harus menangani
   kegagalan melalui try/catch jika aksesnya dapat gagal.
10. Data dari Firestore ditampilkan menggunakan textContent,
    DOM API yang aman, atau proses sanitasi/escaping yang benar.
    Jangan masukkan data pengguna atau database ke innerHTML
    tanpa sanitasi yang sesuai konteks.
11. Data produk menggunakan objek dengan nama field yang jelas,
    seperti name, price, dan category, mengikuti skema sebenarnya.
    Jangan mengubah skema database secara sepihak.
12. Validasi input pengguna dan tangani error secara wajar.
13. Jangan membuat data produk, harga, stok, testimoni, atau
    status operasional palsu untuk mengisi antarmuka.

## H. FIREBASE DAN KEAMANAN
14. Jangan menyimpan API key rahasia, service account,
    token privat, atau kredensial server di frontend.
15. Panggilan RajaOngkir yang memerlukan rahasia harus melalui
    fungsi server yang aman.
16. Jangan melonggarkan Firestore Security Rules untuk mengatasi
    error frontend.
17. Pertahankan autentikasi, otorisasi, validasi, dan aturan akses.
18. Jangan mengubah struktur koleksi, query, listener, atau
    alur transaksi tanpa memahami dampak dan mendapat izin.
19. Hindari listener ganda dan pastikan listener dibersihkan
    ketika komponen atau halaman tidak lagi membutuhkannya.
20. Jangan mencetak token, kata sandi, atau data pribadi ke log.

## I. PERFORMA DAN KOMPATIBILITAS
21. Jangan membuat ulang canvas ketika resize jika dimensi
    relevan tidak berubah.
22. Hindari listener, event handler, atau request duplikat.
23. Jangan menambah dependensi untuk masalah yang dapat
    diselesaikan dengan kode yang sudah tersedia.
24. Jangan mengorbankan aksesibilitas demi animasi atau efek visual.
25. Pastikan perubahan kompatibel dengan struktur proyek
    dan lingkungan hosting yang sedang digunakan.

## J. GERBANG SEBELUM RILIS
26. Periksa responsive layout pada lebar 360, 768, 1024,
    dan 1280 piksel.
27. Jalankan pemeriksaan atau pengujian yang tersedia untuk
    memastikan tidak ada error baru.
28. Target Lighthouse mobile: performa dan aksesibilitas di atas 90.
    Ukur hasil nyata; jangan mengklaim lolos tanpa pengujian.
29. Uji di perangkat Android sungguhan jika tersedia.
30. Cari href="#", lorem, contoh, demo, dan [ISI DATA ASLI]
    pada halaman publik dan aset yang dirilis.
    Pastikan tidak ada placeholder yang belum diselesaikan.
31. Verifikasi bahwa pencarian, Firebase, autentikasi,
    produk, keranjang, checkout, dan RajaOngkir tidak rusak
    jika perubahan menyentuh atau berpotensi memengaruhinya.
32. Jangan menyatakan semua fitur aman hanya berdasarkan
    pemeriksaan visual atau build yang berhasil.
33. Jika pengujian tidak dapat dijalankan, laporkan keterbatasannya.

## CARA MENJAWAB
Untuk perubahan kecil, tampilkan hanya potongan kode atau diff
yang berubah.
Untuk permintaan komponen lengkap, tampilkan kode lengkap
komponen tersebut.
Sebutkan file yang berubah, pengujian yang benar-benar dilakukan,
dan satu baris aturan yang dipatuhi.
