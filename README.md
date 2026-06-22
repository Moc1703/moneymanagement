# Money Management 💰

Aplikasi kas keuangan keluarga & usaha. Web-based, mobile-first, untuk ngetrack uang 3 rekening (istri, pribadi, usaha) yang sebelumnya nyampur.

## Features

- ✅ **Quick input** transaksi (pengeluaran/pemasukan) dari HP — mobile-first
- ✅ **3 rekening**: Istri, Pribadi, Usaha (auto-seeded)
- ✅ **Saldo real-time** per rekening + total gabungan
- ✅ **Dashboard visual**: total saldo, cashflow chart 8 minggu, expense pie chart per kategori, bar chart per project
- ✅ **Transfer antar rekening** (atomic via Postgres RPC)
- ✅ **Project tracking** — pisahin uang pribadi vs uang project usaha
- ✅ **Laporan** dengan filter date range, rekening, project, kategori
- ✅ **Settings**: edit rekening, kategori, project (rename, color, icon, saldo awal)
- ✅ **Single shared login** untuk berdua (suami-istri) dari device manapun
- ✅ **Multi-device sync** — input dari HP, langsung keliatan di laptop

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Recharts
- **Backend**: Supabase (Postgres + Auth + RLS)
- **Server**: Server Actions untuk semua mutations
- **Hosting**: Vercel
- **Bahasa**: Full Bahasa Indonesia
- **Currency**: IDR (Rp 1.500.000)

## Setup Lokal

### 1. Install dependencies
```bash
cd money-management
npm install
```

### 2. Setup Supabase
1. Buka [supabase.com](https://supabase.com) → sign up free
2. **New project** — pilih region Singapore (dekat Indo)
3. Tunggu ~2 menit sampe project ready
4. Pergi ke **SQL Editor** di sidebar
5. Copy-paste & run migration files **satu per satu, berurutan**:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
   - `supabase/migrations/0003_functions_and_triggers.sql`
6. Pergi ke **Authentication → Users** → **Add user → Create new user**
   - Email: `keluarga@email.com` (atau terserah lo)
   - Password: minimal 6 char (catat baik-baik!)
   - **Auto Confirm User**: ✅ ON
7. **Settings → API** — copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Setup env vars lokal
```bash
cp .env.example .env.local
# Edit .env.local, paste 3 nilai dari Supabase
```

### 4. Generate types (opsional, biar IDE suggestions lengkap)
```bash
npx supabase gen types typescript --project-id <your-project-ref> > src/lib/types.ts
```

### 5. Run dev server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) → login dengan email & password dari step 2.6.

Trigger `handle_new_user` akan otomatis bikin 3 rekening + 15 kategori + 4 project.

## Deploy ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/money-management.git
git push -u origin main
```

### 2. Import di Vercel
1. Buka [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → pilih repo `money-management`
3. **Environment Variables** — tambahkan 3 var:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy** 🚀

### 3. Update Supabase Auth URLs
Setelah deploy dapet URL Vercel (misal `https://money-management-abc.vercel.app`):
1. Balik ke Supabase → **Authentication → URL Configuration**
2. **Site URL**: paste URL Vercel lo
3. **Redirect URLs**: tambah `https://money-management-abc.vercel.app/**`
4. Save

### 4. Akses dari HP
Buka URL Vercel di HP browser. Untuk pengalaman "app-like":
- **iOS Safari**: tap Share → "Add to Home Screen"
- **Android Chrome**: tap menu → "Add to Home screen" / "Install app"

App akan jalan kayak native app dengan icon di home screen.

## Daily Use

1. **Login** dengan akun yang dibuat
2. **Set saldo awal** tiap rekening: Settings → Rekening → edit saldo awal
3. **Input transaksi**: tap tombol "+" di tengah bottom nav
4. **Cek dashboard**: total saldo + chart otomatis update
5. **Transfer antar rekening**: menu Transfer
6. **Lihat laporan**: filter per project / kategori / periode

## Struktur Folder

```
money-management/
├── proxy.ts                    # Next.js 16: middleware → proxy
├── supabase/migrations/        # SQL migration files (run berurutan)
└── src/
    ├── app/
    │   ├── (auth)/login/       # Halaman login
    │   └── (app)/              # Protected routes
    │       ├── dashboard/      # Visual cards + charts
    │       ├── input/          # Form input transaksi
    │       ├── transfers/      # Transfer antar rekening
    │       ├── reports/        # Laporan + filter
    │       └── settings/       # Manage rekening, kategori, project
    ├── actions/                # Server actions (mutations)
    ├── components/             # React components
    └── lib/
        ├── supabase/           # Supabase clients
        ├── utils/              # format, date, validators, chart-data
        ├── constants.ts        # Default seed data
        └── types.ts            # Database types
```

## Notes

- **Single shared login**: 1 akun Supabase untuk berdua. Schema tetap multi-user-ready (RLS keys off `auth.uid()`) — kalo nanti mau pisah akun per orang, tinggal invite user kedua di Supabase dashboard.
- **Saldo awal** diset manual di Settings → Rekening. App ngitung saldo berjalan = saldo awal + income - expense.
- **Transfers** atomic: 1 transfer = 2 transaksi (expense + income) yang berpasangan via `transfer_group_id`. Gak akan ada partial transfer.
- **Umum** (project) tidak bisa dihapus — semua transaksi non-project otomatis ke "Umum".

## Troubleshooting

**"relation does not exist"**: Migration belum jalan. Run SQL files di Supabase SQL Editor.

**Trigger handle_new_user gak jalan**: Cek Supabase → Database → Triggers, pastikan `on_auth_user_created` ada. Kalau auth user dibuat SEBELUM trigger di-push, dia gak ke-seed — solusinya delete user, lalu create ulang (setelah trigger aktif).

**Login loop / redirect balik ke /login**: Cek `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di Vercel env vars. Pastiin Site URL di Supabase Auth = URL Vercel.

**Charts gak muncul**: Pastiin Recharts ke-render di client (`"use client"` di chart component). udah di-handle.

## Stack Highlights

- **Next.js 16** dengan Turbopack default, async `cookies()` & `params`
- **`proxy.ts`** (bukan `middleware.ts` — Next.js 16 convention)
- **Server Actions** untuk mutations, **revalidatePath** untuk refresh
- **shadcn/ui** primitives + Tailwind v4
- **Postgres RLS** key off `auth.uid()` — secure by default

## License

Personal use only.
