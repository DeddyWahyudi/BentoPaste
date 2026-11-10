import { NoteItem, NoteDocument } from '../types';

export const INITIAL_NOTE_ITEMS: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Alamat Pengiriman & Detail Kontak',
    content: 'Jalan Danau Sunter Barat No. 88, Blok C2, Sunter Agung, Tanjung Priok, Jakarta Utara, DKI Jakarta 14350.\n(Penerima: Dimas Prasetyo - 0812-9876-5432)',
    folder: 'Pribadi',
    tags: ['Alamat', 'Kontak', 'Pengiriman'],
    copyCount: 48,
    isPinned: true,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'note-work-1',
    title: 'Template Email & Balasan Profesional Pekerjaan',
    content: 'Yth. Bapak/Ibu,\n\nTerima kasih atas pesan dan dokumen yang telah dikirimkan. Saat ini berkas sedang kami tinjau bersama tim terkait dan kami akan segera mengirimkan pembaruan lebih lanjut sebelum akhir hari kerja ini.\n\nSalam hangat,\nTim Operasional',
    folder: 'Pekerjaan',
    tags: ['Pekerjaan', 'Email', 'Kantor', 'Bisnis'],
    copyCount: 76,
    isPinned: true,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'note-pass-1',
    title: 'Akses Wi-Fi Kantor & Kredensial Guest',
    content: 'SSID Utama: BentoCorp_5G_Fast\nPassword Wi-Fi: BentoJatim#2026!Secure\n\nSSID Tamu: BentoGuest_Lobby\nPassword Tamu: WelcomeBento88',
    folder: 'Password',
    tags: ['Password', 'WiFi', 'Akses', 'Kredensial'],
    copyCount: 65,
    isPinned: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'note-3',
    title: 'Bio Ringkas & Perkenalan Diri',
    content: 'Halo! Saya seorang profesional yang fokus pada manajemen operasional, produktivitas kerja, dan pengembangan strategi berbasis data. Senang bisa berkenalan dan berdiskusi.',
    folder: 'Pribadi',
    tags: ['Bio', 'Perkenalan', 'Profil'],
    copyCount: 32,
    isPinned: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'note-4',
    title: 'Catatan Pengingat Checklist Harian',
    content: '1. Periksa email prioritas & pesan masuk penting\n2. Selesaikan draf laporan kerja mingguan\n3. Koordinasi singkat dengan tim pukul 14:00\n4. Review dan arsip dokumen harian',
    folder: 'Tugas',
    tags: ['Daily', 'Checklist', 'Prioritas'],
    copyCount: 29,
    isPinned: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'note-work-2',
    title: 'Format Laporan Harian & Standup Meeting',
    content: 'Laporan Update Harian:\n• Selesai Kemarin: Finalisasi dokumen penawaran & sinkronisasi data klien\n• Target Hari Ini: Presentasi progres proyek pukul 10.00 WIB & review laporan\n• Kendala (Blocker): Tidak ada, berjalan sesuai jadwal',
    folder: 'Pekerjaan',
    tags: ['Pekerjaan', 'Standup', 'Laporan', 'Tim'],
    copyCount: 41,
    isPinned: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'note-pass-2',
    title: 'Kredensial Akun Staging & Portal Internal',
    content: 'URL Portal: https://staging.internal-workspace.id\nUsername: admin.operasional@bentocorp.id\nPassword Sementara: Stg$9948_BentoKey!\nCatatan: Gunakan 2FA Authenticator saat login pertama.',
    folder: 'Password',
    tags: ['Password', 'Login', 'Portal', 'Akun'],
    copyCount: 44,
    isPinned: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'note-5',
    title: 'Pesan Konfirmasi Ramah & Tanda Terima',
    content: 'Terima kasih banyak atas informasinya kak! Sudah saya terima dan cek dengan baik. Nanti akan saya kabari kembali setelah semuanya selesai diproses ya.',
    folder: 'Pribadi',
    tags: ['Konfirmasi', 'Sopan', 'Chat'],
    copyCount: 54,
    isPinned: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'note-6',
    title: 'Catatan Prioritas & Tindak Lanjut Penting',
    content: 'PENTING: Segera lakukan verifikasi berkas sebelum pukul 17.00 WIB. Pastikan lampiran data identitas, formulir konfirmasi, dan catatan revisi telah terunggah dengan lengkap.',
    folder: 'Penting',
    tags: ['Urgent', 'Prioritas', 'Deadline'],
    copyCount: 39,
    isPinned: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1,
  },
];

export const INITIAL_DOCUMENTS: NoteDocument[] = [
  {
    id: 'doc-1',
    title: 'Rencana Kerja & Catatan Strategi Bulanan',
    folder: 'Pribadi',
    content: `## Fokus Utama Bulan Ini

1. Optimalisasi Alur Kerja:
Merapikan semua catatan yang sering dipakai agar dapat disalin seketika hanya dengan tombol angka keyboard (1-9) tanpa perlu menyentuh mouse.

2. Evaluasi Efisiensi Waktu:
Mencatat penghematan waktu saat menggunakan pintasan keyboard (shortcut) vs klik manual mouse.

3. Rencana Tindak Lanjut:
Meninjau kembali draf penting di akhir pekan dan memperbarui kalimat sapaan harian.`,
    wordCount: 68,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'doc-work',
    title: 'Notulensi Rapat & SOP Koordinasi Pekerjaan',
    folder: 'Pekerjaan',
    content: `## Ringkasan Proyek & Pembagian Tugas Tim

1. Target Kuartal Ini:
Menyelesaikan integrasi layanan utama tepat waktu dan memastikan seluruh dokumentasi teknis maupun operasional tersimpan dengan rapi.

2. Standar Komunikasi & Respons:
- Email masuk dari mitra/klien dijawab maksimal dalam 2 jam kerja.
- Setiap pembaruan status tugas wajib dicatat pada papan proyek harian.
- Gunakan template standar yang sudah disiapkan di Bento Grid untuk mempercepat balasan rutin.`,
    wordCount: 74,
    updatedAt: Date.now() - 86400000 * 1,
  },
];
