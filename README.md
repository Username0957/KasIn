# KasIn - Aplikasi Kas Digital

Aplikasi manajemen kas digital untuk sekolah.

## Fitur

- Autentikasi pengguna dengan "Ingat Saya"
- Pencatatan transaksi secara real-time
- Konfirmasi pembayaran oleh admin
- Riwayat transaksi
- Statistik keuangan
- Pembayaran kas mingguan
- Notifikasi tunggakan
- Mode gelap

## Teknologi

- Next.js 14 (App Router)
- Supabase (Auth & Database)
- Tailwind CSS
- TypeScript

## Tentang Aplikasi

KasIn adalah aplikasi manajemen kas digital yang dirancang khusus untuk sekolah. Aplikasi ini memudahkan siswa untuk melakukan pembayaran kas dan membantu admin dalam mengelola keuangan kelas atau sekolah.

### Fitur Utama

- **Pembayaran Kas**: Siswa dapat melakukan pembayaran kas mingguan dengan mudah
- **Riwayat Transaksi**: Melihat riwayat pembayaran dan pengeluaran
- **Statistik**: Melihat statistik keuangan secara real-time
- **Notifikasi**: Pengingat pembayaran dan notifikasi tunggakan
- **Admin Dashboard**: Panel admin untuk mengelola transaksi dan pengguna

## Persiapan

1. Buat akun di [Vercel](https://vercel.com) dan [Supabase](https://supabase.com)
2. Buat project baru di Supabase
3. Jalankan SQL di file `supabase/schema.sql` di SQL Editor Supabase
4. Dapatkan URL dan Anon Key dari Supabase (Settings > API)

## Instalasi

1. Clone repository ini
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Buat file `.env.local` dan tambahkan:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret
\`\`\`

4. Jalankan aplikasi:

\`\`\`bash
npm run dev
\`\`\`

## Kontribusi

Kontribusi selalu diterima. Silakan buat pull request untuk perbaikan atau penambahan fitur.

## Lisensi

[MIT](https://choosealicense.com/licenses/mit/)
\`\`\`

Now, let's create the About page:
