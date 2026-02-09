# AduJe - Pelapor Isu Komuniti

Progressive Web App (PWA) untuk komuniti Malaysia melapor isu setempat seperti lubang jalan, lampu jalan rosak, dan sampah sarap. Aplikasi ini direka bentuk untuk mudah digunakan di telefon, menggunakan reka bentuk MYDS, serta menyokong peta dan penjejakan status.

## Ciri Utama
- Log masuk Google (PocketBase OAuth) dan profil pengguna
- Laporan isu dengan foto, lokasi, kategori, dan status
- Suapan awam dengan penapis dan carian
- Paparan peta (Leaflet + OpenStreetMap)
- Perincian laporan dengan komen, sokongan (upvote), dan ikuti
- Sistem mata dan lencana (Pemula, Penolong, Penyelesai)
- Papan kedudukan komuniti
- PWA + mod luar talian asas
- i18n (Bahasa Malaysia sebagai lalai)
- Analitik Umami

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- MYDS (Malaysia Design System)
- Zustand (state)
- PocketBase (backend + auth)
- Leaflet + OpenStreetMap (peta)
- next-intl (i18n)
- boring-avatars (avatar)
- Umami (analytics)

## Prasyarat
- Node.js 20+
- pnpm 10+
- PocketBase server (local atau cloud)

## Persediaan Projek
1. Klon repo:
   - `git clone <repo-url>`
2. Pasang dependencies:
   - `pnpm install`
3. Sediakan `.env.local`:
   ```bash
   NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   POCKETBASE_URL=https://your-pocketbase-url.com
   POCKETBASE_SU_EMAIL=admin@example.com
   POCKETBASE_SU_PASSWORD=your-admin-password
   ```
4. Jalankan skrip skema PocketBase:
   - `pnpm dlx tsx scripts/pocketbase-schema.ts`
5. Jalankan aplikasi:
   - `pnpm dev`

## Konfigurasi PocketBase
- Aktifkan Google OAuth pada PocketBase.
- Tambahkan admin email di panel Admin (whitelist).
- Pastikan koleksi mengikut skema PRD (skrip disediakan).

## Deployment
- **Frontend (Vercel):**
  - Tambah `NEXT_PUBLIC_POCKETBASE_URL` dan `NEXT_PUBLIC_APP_URL`.
- **Backend (PocketBase):**
  - Deploy ke Railway/Fly.io/PocketHost.
  - Konfigurasi OAuth Google dan CORS.

## Analitik
- Umami dashboard: https://umami.muaz.app/share/seTdPt2PEeX4C1kk

## Keputusan Reka Bentuk & Andaian
- Reka bentuk mematuhi MYDS dan tema Malaysia.
- Bahasa lalai: Bahasa Malaysia.
- Data demo digunakan untuk UI; integrasi PocketBase siap untuk sambungan sebenar.

## Had Semasa
- Tiada ujian automasi penuh.
- Logik notifikasi/push masih asas dan demo.
- Penilaian prestasi Lighthouse belum dijalankan.

## Penambahbaikan Masa Depan
- Pengesahan laporan lebih pintar (AI/image).
- Notifikasi push penuh dan emel mingguan.
- Paparan peta dengan cluster dan radius filter.

## License
MIT
