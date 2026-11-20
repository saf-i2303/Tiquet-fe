# Tests

Folder pengujian untuk `tiquet-frontend` sesuai **Phase 6 — Testing & Release**
pada `plan tiquet.md` (functional, API integration, end-to-end, payment,
security, dan UAT).

## Struktur yang disiapkan

```text
tests/
├── e2e/    # Playwright: alur customer, organizer, admin, pembayaran, refund
└── unit/   # Pengujian helper/service murni (Vitest)
```

## Status

Belum ada dependency test yang dipasang. Tambahkan Playwright/Vitest beserta
script `test` di `package.json` saat fase implementasi testing dimulai, lalu
letakkan spesifikasi di folder `e2e/` dan `unit/`.

Placeholder `.gitkeep` menjaga folder tetap tercatat di Git.
