# Tiquet Frontend (Tiquet-fe)

Frontend service untuk platform **Event Ticketing Marketplace** (konser/event, multi-organizer). Dibangun dengan **Next.js 16 (App Router)**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**.

Frontend ini terhubung ke [`Tiquet-be`](https://github.com/saf-i2303/Tiquet-be) (Go/Fiber + PostgreSQL) melalui REST API. Untuk keperluan pengembangan UI, frontend juga dapat dijalankan sepenuhnya dengan **data mock lokal** tanpa backend.

---

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Cara Menjalankan](#cara-menjalankan)
- [Mode Mock vs API Real](#mode-mock-vs-api-real)
- [Struktur Proyek](#struktur-proyek)
- [Halaman & Rute](#halaman--rute)
- [Integrasi API Backend](#integrasi-api-backend)
- [Autentikasi & Session](#autentikasi--session)
- [Konvensi Arsitektur & Pengembangan](#konvensi-arsitektur--pengembangan)
- [Testing](#testing)
- [Konvensi Git & Commit](#konvensi-git--commit)
- [Troubleshooting](#troubleshooting)
- [Referensi](#referensi)

---

## Prasyarat

| Kebutuhan | Versi / Catatan |
|---|---|
| Node.js | **>= 20.9.0** (disarankan LTS 22) |
| npm | Bundled bersama Node.js |
| Git | Untuk branching & version control |
| Backend `Tiquet-be` | Opsional. Diperlukan hanya saat `NEXT_PUBLIC_USE_MOCK=false` |
| Repository | `https://github.com/saf-i2303/Tiquet-fe.git` |

> Versi Next.js yang dipakai adalah `16.3.1`. Beberapa konvensi sudah berubah dari versi sebelumnya, antara lain `proxy.ts` menggantikan `middleware.ts`. Lihat [referensi](#referensi).

---

## Konfigurasi Environment

Next.js memuat file `.env.local` untuk development. File ini **tidak di-commit** (`.gitignore` sudah mengabaikan `.env*`).

Buat file `.env.local` di root proyek:

```bash
cp .env.example .env.local
```

Jika `.env.example` belum tersedia, buat `.env.local` manual dengan isi berikut:

```env
# Alamat API backend (tanpa trailing slash)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# true  = pakai data mock lokal (default)
# false = panggil backend sungguhan
NEXT_PUBLIC_USE_MOCK=true
```

### Catatan penting

- `NEXT_PUBLIC_USE_MOCK` defaultnya `true` bila tidak diset (lihat `lib/api.ts`).
- Variabel berprefix `NEXT_PUBLIC_` **di-inline ke JavaScript bundle** saat build dan dapat dibaca browser. Jangan pernah menyimpan JWT secret, password database, atau kredensial privat di sini.
- Saat `NEXT_PUBLIC_USE_MOCK=false`, `NEXT_PUBLIC_API_URL` wajib diisi. Jika kosong, `apiFetch` melempar error `NEXT_PUBLIC_API_URL belum dikonfigurasi.`
- Setelah mengubah file environment, **restart dev server**. Nilai `NEXT_PUBLIC_*` dibekukan saat `next build`.
- Jika ingin meng-commit `.env.example`, gunakan `git add -f .env.example` atau sesuaikan pola `.gitignore`, karena `.env*` saat ini diabaikan.

---

## Cara Menjalankan

### 1. Install dependency

```bash
npm install
```

### 2. Development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### 3. Lint

```bash
npm run lint
```

### 4. Build & jalankan production

```bash
npm run build
npm run start
```

### 5. Terhubung ke backend sungguhan

1. Pastikan backend `Tiquet-be` dan PostgreSQL sudah berjalan (lihat README backend; default API port `8080`, prefix `/api/v1`).
2. Set `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_USE_MOCK=false
```

3. Restart dev server.

---

## Mode Mock vs API Real

| Mode | `NEXT_PUBLIC_USE_MOCK` | Sumber data | Kapan dipakai |
|---|---|---|---|
| Mock (default) | `true` atau tidak diset | `lib/mocks/*.ts` | Pengembangan UI tanpa backend |
| Integrasi API | `false` | Backend `Tiquet-be` | Integrasi, UAT, production |

Service yang saat ini sudah memiliki jalur API aktif:

| Service | Path yang dipanggil |
|---|---|
| `services/event.service.ts` | `GET /events`, `GET /events/featured`, `GET /events/:id`, `PATCH /events/:id/status` |
| `services/order.service.ts` | `GET /orders?customerId=`, `GET /orders/:id` |
| `services/ticket.service.ts` | `GET /tickets?customerId=` |
| `services/payment.service.ts` | `GET /payments/methods` |

Service lain (`auth`, `organizer`, `admin`, `checkin`, `refund`) masih memakai data mock lokal. Beberapa path di atas juga masih bersifat **placeholder** dan perlu diselaraskan dengan kontrak final backend saat integrasi, misalnya `PATCH /events/:id/status` versus `POST /admin/events/:id/approve|reject`.

Seluruh request melalui `apiFetch` di `lib/api.ts`, yang secara otomatis:

- menggabungkan `NEXT_PUBLIC_API_URL` dengan path,
- mengirim header `Accept: application/json` dan `Content-Type: application/json`,
- menambahkan `Authorization: Bearer <token>` saat token diberikan,
- memakai `cache: "no-store"`,
- mengubah response gagal menjadi `ApiError` (`status` + `payload`).

---

## Struktur Proyek

```text
tiquet-frontend/
├── app/
│   ├── (admin)/            # Halaman Super Admin (/admin/*)
│   ├── (auth)/             # Login, register, lupa password
│   ├── (customer)/         # Landing, katalog event (/events/*)
│   │   └── (member)/       # Checkout, order, tiket, profil
│   ├── (organizer)/        # Dashboard organizer (/organizer/*)
│   ├── globals.css
│   └── layout.tsx          # Root layout
├── components/
│   ├── admin/              # Komponen khusus admin
│   ├── event/              # Kartu event, filter, ticket selector
│   ├── forms/              # Form auth & organizer
│   ├── landing/            # Hero, discovery, CTA
│   ├── layout/             # Navbar, footer, dashboard layout
│   ├── organizer/          # Form event, staff, payout
│   ├── shared/             # Komponen lintas modul
│   ├── ticket/             # Kartu & aksi tiket
│   └── ui/                 # Primitive UI (button, card, input, dll.)
├── config/
│   ├── navigation.ts       # Menu navigasi per role
│   ├── routes.ts           # Sumber kebenaran semua URL
│   └── site.ts             # Nama, tagline, kontak situs
├── hooks/                  # Client hook (mis. use-countdown)
├── lib/
│   ├── actions/            # Server actions (mutasi)
│   ├── mocks/              # Data dummy untuk mode mock
│   ├── api.ts              # Fetch wrapper ke backend
│   ├── auth.ts             # get/set/clear session
│   ├── constants.ts        # Metadata status, kategori, batas bisnis
│   ├── guards.ts           # Guard akses berbasis role
│   ├── session.ts          # Encode/decode cookie session
│   └── utils.ts            # Helper (cn, formatter)
├── services/               # Satu service per modul bisnis
├── tests/
│   ├── e2e/                # Playwright (disiapkan)
│   └── unit/               # Vitest (disiapkan)
├── types/                  # Kontrak tipe TypeScript
├── proxy.ts                # Network boundary (menggantikan middleware.ts)
├── next.config.ts
├── postcss.config.mjs      # Tailwind CSS v4 via PostCSS
├── components.json         # Konfigurasi komponen UI
└── tsconfig.json
```

Nama route group `(...)` tidak muncul di URL. Misalnya `app/(customer)/events/page.tsx` menghasilkan `/events`.

---

## Halaman & Rute

Sumber kebenaran rute adalah `config/routes.ts`. **Gunakan helper `routes.*`**, jangan menuliskan string URL secara langsung di komponen.

### Publik (tanpa autentikasi)

| Rute | Deskripsi |
|---|---|
| `/` | Landing page |
| `/events` | Discovery event. Filter: `q`, `city`, `category`, `date`, `minPrice`, `maxPrice`, `sort`, `page`, `perPage` |
| `/events/:id` | Detail event (venue, kategori, organizer) |
| `/events/:id/tickets` | Pemilihan tipe tiket |
| `/login` | Login |
| `/register` | Registrasi (role `customer` / `organizer`) |
| `/forgot-password` | Permintaan reset password |

### Customer / Member

| Rute | Deskripsi |
|---|---|
| `/checkout/:orderId` | Checkout pesanan |
| `/checkout/:orderId/status?status=<status>` | Status pembayaran |
| `/orders` | Riwayat pesanan |
| `/orders/:id` | Detail pesanan |
| `/tickets` | Daftar tiket milik user |
| `/tickets/:id` | Detail tiket |
| `/profile` | Profil user |

### Organizer

Membutuhkan peran `organizer`.

| Rute | Deskripsi |
|---|---|
| `/organizer` | Dashboard |
| `/organizer/profile` | Profil organizer |
| `/organizer/verification` | Status verifikasi |
| `/organizer/events` | Daftar event |
| `/organizer/events/new` | Buat event baru |
| `/organizer/events/:id` | Detail event |
| `/organizer/events/:id/edit` | Ubah event |
| `/organizer/events/:id/tickets` | Kelola tipe tiket |
| `/organizer/events/:id/attendees` | Daftar peserta |
| `/organizer/events/:id/attendees/export` | Route handler export CSV |
| `/organizer/reports` | Laporan |
| `/organizer/transactions` | Transaksi |
| `/organizer/team` | Anggota tim & staff |
| `/organizer/payouts` | Pencairan dana |

### Admin (Super Admin)

Membutuhkan peran `super_admin`.

| Rute | Deskripsi |
|---|---|
| `/admin` | Dashboard |
| `/admin/users`, `/admin/users/:id` | Kelola user |
| `/admin/organizers`, `/admin/organizers/:id` | Moderasi organizer |
| `/admin/events`, `/admin/events/:id` | Moderasi event |
| `/admin/transactions` | Transaksi |
| `/admin/refunds`, `/admin/refunds/:id` | Pengelolaan refund |
| `/admin/payouts` | Pencairan dana |
| `/admin/activity` | Log aktivitas |
| `/admin/settings` | Pengaturan |

---

## Integrasi API Backend

Prefix backend: `/api/v1`.

Endpoint yang dipakai frontend mengikuti modul backend:

| Modul | Endpoint (contoh) |
|---|---|
| Health | `GET /api/v1/health` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Organizer | `/organizer/profile`, `/organizer/documents`, `/organizer/submit-verification`, `/organizer/staff` |
| Admin | `/admin/organizers`, `/admin/organizers/:id/verify`, `/admin/organizers/:id/reject` |
| Event & Venue | `/event-categories`, `/events`, `/events/:id`, `/organizer/venues`, `/organizer/events`, `/admin/events` |
| Order & Payment | Order, pembayaran, dan status checkout |
| Ticket & Check-in | Tiket milik user, verifikasi check-in |
| Refund | Pengajuan & proses refund |

Detail kontrak, aturan status, dan validasi ada di `README.md` repository `Tiquet-be`.

> Saat menambah endpoint baru, perbarui service yang bersangkutan di `services/` dan tipe respons di `types/`. Jangan melakukan `fetch` langsung dari komponen.

---

## Autentikasi & Session

1. Form di `components/forms/` memanggil server action di `lib/actions/auth.action.ts`.
2. Setelah berhasil, `setSession(user)` dari `lib/auth.ts` dipanggil.
3. Data session disimpan dalam cookie **`tiketku_session`** (`lib/session.ts`) berupa base64url dari payload user.
4. Cookie memakai:

   - `httpOnly: true`
   - `sameSite: "lax"`
   - `secure: true` saat production
   - `maxAge` 30 hari bila opsi *remember* dipilih

5. `getSession()` dipakai server component/server action untuk membaca user aktif dan perannya.
6. `lib/guards.ts` berisi pembatasan akses berbasis role di sisi UI.
7. Role yang dikenal: `customer`, `organizer`, `gate_staff`, `super_admin`.

### Perhatian keamanan

`proxy.ts` saat ini hanya meneruskan request (`NextResponse.next()`) untuk path:

```text
/tickets, /orders, /profile, /checkout, /organizer, /admin
```

File ini **belum** melakukan pengecekan login maupun role. Otorisasi akhir tetap wajib diterapkan di backend pada setiap endpoint. Session frontend hanya untuk pengalaman pengguna (menyembunyikan menu, redirect, dll.), bukan sebagai perlindungan data.

---

## Konvensi Arsitektur & Pengembangan

1. **Route groups** — `(auth)`, `(customer)`, `(customer)/(member)`, `(organizer)`, `(admin)` digunakan untuk mengelompokkan halaman tanpa memengaruhi URL.

2. **Pembagian layer**

   - `app/**/page.tsx` — routing dan komposisi halaman (server component).
   - `components/ui` — primitive UI (button, card, input, badge, dll.).
   - `components/forms`, `components/layout`, `components/event`, dll. — komponen per domain.
   - `lib/actions/*.action.ts` — server action untuk mutasi data.
   - `services/*.service.ts` — satu file per modul bisnis; memilih data mock atau `apiFetch`.
   - `lib/api.ts` — satu-satunya tempat melakukan `fetch` ke backend.
   - `lib/guards.ts`, `lib/auth.ts`, `lib/session.ts` — autentikasi & otorisasi sisi frontend.
   - `lib/constants.ts` — metadata status, kategori, filter, dan batas bisnis.
   - `lib/mocks/*.ts` — data dummy untuk mode mock.
   - `config/*` — konstanta aplikasi (`routes`, `navigation`, `site`).
   - `types/*.ts` — kontrak tipe data.
   - `hooks/*.ts` — client hook.

3. **Aturan**

   - Dilarang memanggil `fetch` langsung dari komponen. Selalu lewat `services/*` → `apiFetch`.
   - Gunakan metadata status di `lib/constants.ts` (`orderStatusMeta`, `eventStatusMeta`, `organizerStatusMeta`, `refundStatusMeta`, dll.). Jangan hardcode label atau warna.
   - Uang disimpan sebagai **integer Rupiah tanpa desimal**. Konstanta terkait: `SERVICE_FEE = 15_000`, `MAX_TICKETS_PER_ORDER = 6`.
   - Waktu mengikuti format backend (UTC / ISO 8601).
   - Semua URL dibangun dari `config/routes.ts`.
   - Gunakan session/cookie HttpOnly untuk data sesi; jangan menyimpan token akses di `localStorage`.
   - Ikuti dokumentasi Next.js 16 di `node_modules/next/dist/docs/` sebelum menulis API atau struktur baru, karena beberapa konvensi berubah dari versi sebelumnya.

---

## Testing

Folder `tests/` sudah disiapkan:

```text
tests/
├── e2e/    # Playwright: alur customer, organizer, admin, pembayaran, refund
└── unit/   # Pengujian helper/service murni (Vitest)
```

Saat ini **belum ada dependency test dan script `test`** di `package.json`, serta belum ada spesifikasi aktif. Tambahkan Playwright/Vitest beserta script npm ketika fase testing dimulai, lalu letakkan spesifikasi di folder tersebut.

---

## Konvensi Git & Commit

- Satu branch = satu unit kerja. Format: `<type>/<nama-singkat>`, misalnya `feat/auth-login-register` atau `fix/checkout-total-harga`.
- Base branch: `dev`. Setiap branch di-PR ke `dev`, lalu dihapus setelah merge.
- Pesan commit: `<type>: <deskripsi singkat>`.

| Type | Penggunaan |
|---|---|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `docs` | Perubahan dokumentasi |
| `style` | Format kode |
| `refactor` | Refactoring kode |
| `test` | Penambahan test |
| `chore` | Update dependencies / maintenance |

Contoh:

```text
feat: tambah alur checkout dan riwayat order
fix: perbaiki kalkulasi total saat diskon
docs: perbarui panduan setup frontend
style: rapikan format kode landing page
refactor: pindahkan pemanggilan API ke layer service
test: tambah test untuk order action
chore: perbarui dependency dan config project
```

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| `NEXT_PUBLIC_API_URL belum dikonfigurasi.` | Mode API aktif tetapi env kosong | Isi `NEXT_PUBLIC_API_URL`, lalu restart dev server |
| Data tidak berubah saat development | Mode mock memakai array statis di `lib/mocks/` | Set `NEXT_PUBLIC_USE_MOCK=false` untuk memakai backend |
| Env sudah diubah tapi tidak berlaku | `NEXT_PUBLIC_*` dibekukan saat build | Restart dev server atau build ulang |
| Error/404 setelah integrasi API | Path service belum sesuai kontrak backend | Samakan path di `services/*.service.ts` dengan endpoint `Tiquet-be` |
| Rute terasa tidak terlindungi | `proxy.ts` masih pass-through | Pastikan backend memvalidasi token & role pada setiap endpoint |
| `proxy.ts` tidak dikenal | Versi Next.js lama | Gunakan Next.js >= 16, atau `middleware.ts` bila tetap di versi lama |

---

## Referensi

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Panduan upgrade Next.js 16](https://nextjs.org/docs/app/guides/upgrading/version-16) — perubahan `middleware` → `proxy`
- [Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- Dokumentasi panduan internal: `node_modules/next/dist/docs/`
- Backend: [`Tiquet-be`](https://github.com/saf-i2303/Tiquet-be)
