# GilangAI Generator — MVP

Website SaaS AI Generator berbasis Next.js.

## Fitur MVP
- Dashboard modern responsive
- 10 AI generators
- OpenAI Responses API melalui server route
- Sistem kredit demo (10 kredit per sesi browser)
- Copy hasil
- Riwayat hasil selama halaman terbuka
- Landing/dashboard siap dikembangkan menjadi SaaS

## Persyaratan
Node.js 20.9+ direkomendasikan untuk Next.js terbaru.

## Instalasi

```bash
npm install
```

Buat `.env.local`:

```env
OPENAI_API_KEY=isi_api_key_kamu
OPENAI_MODEL=gpt-5-mini
```

Jalankan:

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Build production

```bash
npm run build
npm start
```

## Catatan produksi
MVP ini sengaja tidak memasukkan autentikasi, database, payment gateway, dan rate limiting produksi. Kredit saat ini hanya simulasi di browser. Untuk versi komersial, tambahkan:
- Auth.js/Clerk/Supabase Auth
- PostgreSQL/Supabase + Prisma/Drizzle
- Stripe/Xendit/Midtrans
- server-side credit ledger
- rate limiting
- logging dan abuse prevention
- halaman Terms/Privacy
- admin dashboard

Next.js mendukung aplikasi full-stack dengan App Router dan routing berbasis file. Lihat dokumentasi resmi Next.js untuk deployment dan fitur lanjutan.
