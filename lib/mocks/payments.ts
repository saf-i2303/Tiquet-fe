import type { PaymentMethod } from "@/types/payment";

export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm-bca-va",
    name: "BCA Virtual Account",
    group: "bank",
    fee: 0,
    instructions: [
      "Buka aplikasi BCA mobile atau ATM BCA.",
      "Pilih m-Transfer → BCA Virtual Account.",
      "Masukkan nomor VA yang tertera di halaman pembayaran.",
      "Periksa nominal, lalu konfirmasi pembayaran.",
    ],
  },
  {
    id: "pm-mandiri-va",
    name: "Mandiri Virtual Account",
    group: "bank",
    fee: 0,
    instructions: [
      "Buka Livin' by Mandiri.",
      "Pilih Bayar → Multipayment → TiketKu.",
      "Masukkan kode bayar yang tertera.",
      "Konfirmasi pembayaran sebelum batas waktu.",
    ],
  },
  {
    id: "pm-bni-va",
    name: "BNI Virtual Account",
    group: "bank",
    fee: 0,
    instructions: [
      "Buka aplikasi BNI Mobile Banking.",
      "Pilih Transfer → Virtual Account Billing.",
      "Masukkan nomor VA dan nominal.",
      "Simpan bukti pembayaran.",
    ],
  },
  {
    id: "pm-gopay",
    name: "GoPay",
    group: "ewallet",
    fee: 0,
    instructions: [
      "Tekan tombol Bayar Sekarang.",
      "Kamu akan diarahkan ke aplikasi Gojek.",
      "Pastikan saldo GoPay mencukupi.",
      "Selesaikan pembayaran dalam 15 menit.",
    ],
  },
  {
    id: "pm-ovo",
    name: "OVO",
    group: "ewallet",
    fee: 0,
    instructions: [
      "Tekan tombol Bayar Sekarang.",
      "Masukkan nomor HP OVO terdaftar.",
      "Setujui permintaan pembayaran di aplikasi OVO.",
      "Pembayaran otomatis terverifikasi.",
    ],
  },
  {
    id: "pm-card",
    name: "Kartu Kredit / Debit",
    group: "card",
    fee: 5_000,
    instructions: [
      "Pilih Kartu Kredit / Debit.",
      "Masukkan data kartu pada halaman payment gateway.",
      "Selesaikan verifikasi 3D Secure.",
      "Simpan bukti transaksi.",
    ],
  },
];

export const getPaymentMethod = (id: string) => paymentMethods.find((m) => m.id === id);
