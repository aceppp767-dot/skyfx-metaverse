# SKYFX Metaverse — Multiplayer Prototype

Website 3D kantor SKYFX dengan avatar procedural, berjalan/berlari, duduk di bangku, gesture menyapa, chat real-time, dan sinkronisasi posisi avatar melalui WebSocket.

## Persyaratan
- Node.js 18 atau lebih baru
- Koneksi internet untuk memuat Three.js dari jsDelivr CDN

## Menjalankan di komputer / Termux Android

1. Ekstrak folder proyek.
2. Buka terminal di folder `skyfx-metaverse`.
3. Jalankan:

```bash
npm install
npm start
```

4. Buka `http://localhost:3000` di Chrome.
5. Untuk uji multiplayer lokal, buka URL yang sama di dua browser/perangkat yang berada pada jaringan/server yang sama.

## Kontrol
- WASD / tombol panah: bergerak
- Shift: berlari
- E: duduk / berdiri saat dekat bangku taman
- Q: menyapa
- Tombol bawah layar: kontrol gerak untuk HP
- Seret layar: putar kamera
- Scroll / pinch: zoom

## Struktur
- `server.js`: Express static server dan WebSocket relay
- `public/index.html`: scene Three.js, avatar, UI, chat client
- `package.json`: dependencies dan perintah npm

## Deploy online
Upload folder proyek ke VPS atau layanan Node.js yang mendukung WebSocket.
Set `PORT` sesuai port dari penyedia hosting. Pastikan reverse proxy meneruskan koneksi WebSocket pada path `/ws`.
Gunakan HTTPS/WSS di domain publik. Jangan menaruh secret/API key di `index.html`.

## Catatan penting
Ini adalah prototipe multiplayer satu ruang (single room). Server meneruskan posisi dan chat antar-koneksi, tetapi belum memiliki akun, autentikasi, database, moderasi admin, voice chat, persistence, atau sistem anti-cheat tingkat produksi. Harga pasar pada panel tidak real-time dan hanya ilustrasi.
Untuk produksi, tambahkan autentikasi, validasi gerak di server, rate limit/IP controls, moderasi chat, logging, database, dan kebijakan privasi. Jangan gunakan untuk transaksi atau login sungguhan sebelum sistem keamanan dibangun.
