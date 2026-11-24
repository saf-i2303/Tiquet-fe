# Pola Fetch & Keamanan

Panduan copy-paste untuk **file baru**. Semua request HTTP ke backend mengikuti pola ini.

---

## A. Fetching endpoint

### A.1 Alur

```
lib/api.ts  →  services/<domain>Services.ts  →  page / component
```

| Lapisan | Tanggung jawab | Contoh |
| --- | --- | --- |
| `lib/api.ts` | Satu-satunya tempat request HTTP dibangun: BASE_URL, token, header, 401, error. | `api.get`, `api.post`, `api.put`, `api.delete`, `api.upload` |
| `services/<domain>Services.ts` | Satu file per domain backend. Memanggil `api.*`, membuka envelope `{ success, message, data }` dengan `unwrap()`, dan menamai fungsi sesuai endpoint. | `authServices.ts`, `eventServices.ts`, `venueServices.ts`, `ticketServices.ts`, `organizerServices.ts`, `adminServices.ts`, `healthServices.ts` |
| Page / component | Hanya import dan memanggil fungsi service. **Tidak pernah** `fetch` langsung. | `import { listEvents } from "@/services/eventServices";` |

### A.2 Metode `api.*`

| Metode | Kapan dipakai | Contoh |
| --- | --- | --- |
| `api.get<T>(path, params?, options?)` | Ambil data / daftar. `params` menjadi query string (URLSearchParams). | `api.get<ApiResponse<Event[]>>("/events", { city: "Jakarta", page: 1 })` |
| `api.post<T>(path, body?, options?)` | Buat resource, aksi tanpa body, atau kirim JSON. Body objek otomatis di-`JSON.stringify`. | `api.post("/auth/login", { email, password })` |
| `api.put<T>(path, body?, options?)` | Update penuh resource yang sudah ada. | `api.put("/organizer/profile", payload)` |
| `api.delete<T>(path, options?)` | Hapus resource. Tanpa body. | `api.delete("/organizer/staff/" + encodeURIComponent(userId))` |
| `api.upload<T>(path, formData, options?)` | Kirim `FormData` / multipart. `Content-Type: application/json` **tidak** ditambahkan. | `api.upload("/uploads", formData)` |

> Backend saat ini belum punya endpoint multipart; `api.upload` disiapkan untuk endpoint baru.
> `POST /organizer/documents` mengirim **metadata JSON** (`doc_type`, `file_name`), bukan file.

### A.3 Aturan wajib

1. **Token dari localStorage.** `getAccessToken()` membaca `TOKEN_STORAGE_KEY = "tiketku_access_token"`. Simpan hasil login/refresh dengan `saveTokensToStorage(accessToken, refreshToken)`; hapus dengan `clearTokens()`. Jangan membaca token dari cookie di service.
2. **`Authorization: Bearer <token>`** ditambahkan otomatis oleh `lib/api.ts` untuk semua request. Untuk endpoint publik yang tidak boleh mengirim token, gunakan opsi `{ skipAuth: true }` (contoh: `/auth/login`, `/auth/refresh`, `/auth/logout`).
3. **Content-Type otomatis.** `application/json` ditambahkan untuk semua body kecuali `FormData`. Untuk `FormData`, gunakan `api.upload()` agar browser yang menentukan boundary.
4. **Handler 401 terpusat.** Jika respons `401`, `lib/api.ts` menghapus token (`clearTokens()`) lalu mengarahkan ke `/auth` (`UNAUTHORIZED_REDIRECT`). Jangan membuat handler 401 duplikat di service/page.
5. **Error memakai `data.message`.** Respons gagal dilempar sebagai `ApiError` dengan pesan dari `payload.message` (field `message` pada JSON backend), `status`, dan `payload`. Di UI, ambil pesan dengan `getApiErrorMessage(error, fallback)` dan validasi field dengan `getFieldErrors(error.payload?.details)`.
6. **Dilarang `fetch` manual / duplikat BASE_URL di service.** Semua request harus lewat `api.*`. `API_BASE_URL` hanya didefinisikan di `lib/api.ts` (dari `NEXT_PUBLIC_API_URL`; absolut → CORS, relatif `/api/v1` → fallback rewrite Next.js). Jangan menulis `fetch(...)`, `const BASE_URL = ...`, atau URL backend lengkap di file service maupun komponen.

### A.4 Template method service baru

```ts
// services/<domain>Services.ts
import { api, unwrap } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

type ItemRecord = {
  id: string;
  name: string;
};

export type ItemPayload = {
  name: string;
};

/** GET /api/v1/<domain> */
export async function listItems(): Promise<ItemRecord[]> {
  return unwrap(await api.get<ApiResponse<ItemRecord[]>>("/<domain>"));
}

/** GET /api/v1/<domain>/:id */
export async function getItem(id: string): Promise<ItemRecord> {
  return unwrap(
    await api.get<ApiResponse<ItemRecord>>(
      `/<domain>/${encodeURIComponent(id)}`,
    ),
  );
}

/** POST /api/v1/<domain> */
export async function createItem(payload: ItemPayload): Promise<ItemRecord> {
  return unwrap(
    await api.post<ApiResponse<ItemRecord>>("/<domain>", payload),
  );
}

/** PUT /api/v1/<domain>/:id */
export async function updateItem(
  id: string,
  payload: ItemPayload,
): Promise<ItemRecord> {
  return unwrap(
    await api.put<ApiResponse<ItemRecord>>(
      `/<domain>/${encodeURIComponent(id)}`,
      payload,
    ),
  );
}

/** DELETE /api/v1/<domain>/:id */
export async function deleteItem(id: string): Promise<void> {
  await api.delete(`/<domain>/${encodeURIComponent(id)}`);
}
```

Aturan penamaan: satu fungsi per endpoint, nama fungsi menjelaskan aksi dan domain
(`createEvent`, `listOrganizerTickets`, `verifyOrganizer`), dan komentar ` METHOD /api/v1/...`
dicantumkan di atas fungsi.

### A.5 Aturan query param & path param

- **Path param** (`/events/:id`, `/organizer/staff/:user_id`, dll.) wajib melalui
  `encodeURIComponent(nilai)`. Ini mencegah `/`, `?`, atau karakter khusus merusak URL.
- **Query param** jangan dirakit manual dengan string interpolation. Kirim objek sebagai
  argumen kedua `api.get()`; `lib/api.ts` memakai `URLSearchParams` yang melakukan encoding
  otomatis (setara `encodeURIComponent`):

  ```ts
  // BENAR
  api.get<ApiResponse<ApiEventList>>("/events", {
    q: "jazz",
    city: "Bandung",
    category: "konser",
    from: "2026-11-20",
    page: 1,
    limit: 20,
  });

  // SALAH
  api.get(`/events?q=${q}&city=${city}`);
  ```

- Nilai `undefined`, `null`, dan string kosong dilewati (tidak dikirim). Array dikirim
  sebagai beberapa key dengan nama sama (`?tag=a&tag=b`).
- Jika query sudah berupa `URLSearchParams`, langsung kirimkan objek tersebut:

  ```ts
  const params = new URLSearchParams({ status: "pending", page: "1" });
  api.get<ApiResponse<unknown>>("/admin/events", params);
  ```

### A.6 Daftar periksa sebelum menambah endpoint

- [ ] Endpoint sudah ada di backend (`/api/v1/...`), bukan asumsi frontend.
- [ ] Fungsi ditaruh di `services/<domain>Services.ts` yang sesuai.
- [ ] Memanggil `api.get/post/put/delete/upload`, bukan `fetch` langsung.
- [ ] Path param memakai `encodeURIComponent`; query param memakai objek/`URLSearchParams`.
- [ ] Envelope dibuka dengan `unwrap()` bila backend membalas `{ success, message, data }`.
- [ ] Endpoint publik memakai `{ skipAuth: true }` jika token tidak boleh dikirim.
- [ ] Page/component hanya mengimpor dari service, bukan dari `lib/api.ts`.

### A.7 CORS browser → backend

- `NEXT_PUBLIC_API_URL` berisi URL absolut backend, mis. `http://localhost:8080/api/v1`.
  Browser memanggilnya langsung, jadi origin frontend harus masuk
  `CORS_ALLOWED_ORIGINS` di backend (default dev: `http://localhost:3000`).
- Header yang dikirim `lib/api.ts`: `Accept`, `Content-Type` (kecuali `FormData`),
  dan `Authorization` bila ada token. Semuanya sudah ada di `AllowHeaders` backend.
  Jangan menambah header custom di service tanpa memperbarui `AllowHeaders`,
  karena preflight `OPTIONS` akan gagal.
- Token berada di `localStorage`; request memakai `credentials: "omit"` dan backend
  memakai `AllowCredentials: false`. Jangan mengandalkan cookie untuk auth.
- Kegagalan sebelum ada response (network down / CORS ditolak) dilempar sebagai
  `ApiError` dengan `status: 0` dan pesan yang bisa ditampilkan via
  `getApiErrorMessage(error, fallback)`.
- Fallback sementara: set `NEXT_PUBLIC_API_URL=/api/v1` untuk memakai rewrite
  Next.js bila CORS backend belum siap.
