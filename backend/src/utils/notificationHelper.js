// ========================================================================
// 📁 utils/notificationHelper.js
// Helper terpusat untuk semua notifikasi dengan cooldown anti-spam
// Ekspor createNotificationWithCooldown agar bisa dipakai di controller manapun
// ========================================================================

const { Notification, sequelize } = require('../models');
const { Op } = require('sequelize');
const sendTelegram = require('../utils/telegram');

/**
 * Daftar keyword yang dikenali untuk filter cooldown per-jenis notifikasi.
 * Tambahkan keyword baru di sini jika ada jenis notif baru.
 * Urutan pengecekan: dari atas ke bawah (yang pertama cocok, itulah yang dipakai).
 */
const KEYWORD_RULES = [
  { match: 'kritis',        keyword: '%kritis%'        },  // Air tandon kritis
  { match: 'Nitrogen',      keyword: '%Nitrogen%'       },  // Kadar Nitrogen rendah
  { match: 'kembali',       keyword: '%kembali%'        },  // Sistem kembali normal
  { match: 'Kering',        keyword: '%Kering%'         },  // Tanah kering ← FIX UTAMA
  { match: 'tanah kering',  keyword: '%tanah kering%'   },  // Variasi lowercase
  { match: 'Tanah Kering',  keyword: '%Tanah Kering%'   },  // Variasi Title Case
  { match: 'kelembapan',    keyword: '%kelembapan%'     },  // Notif kelembapan tanah
  { match: 'pompa',         keyword: '%pompa%'           },  // Notif status pompa
  { match: 'ph',            keyword: '%ph%'              },  // Notif pH tanah
];

/**
 * Durasi cooldown default: 5 menit
 * Bisa di-override per pemanggilan dengan parameter cooldownMs
 */
const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;

// ========================================================================
// 🌟 CORE HELPER: Filter Cooldown Menggunakan Waktu Asli Server MySQL
// ========================================================================
/**
 * Membuat notifikasi baru ke DB dengan proteksi cooldown 5 menit.
 * Jika dalam 5 menit terakhir sudah ada notif sejenis → blokir & return null.
 *
 * @param {Object} params
 * @param {string|number} params.perangkat_id  - ID perangkat IoT
 * @param {string}        params.pesan         - Isi pesan notifikasi
 * @param {number}        [params.cooldownMs]  - Override durasi cooldown (ms), default 5 menit
 * @returns {Promise<Notification|null>}       - Objek Notification baru, atau null jika di-blok cooldown
 */
const createNotificationWithCooldown = async ({ perangkat_id, pesan, cooldownMs = DEFAULT_COOLDOWN_MS }) => {
  try {
    // Deteksi keyword dari daftar KEYWORD_RULES
    let keyword = '%'; // fallback: cocokkan semua jika tidak ada rule yang match
    for (const rule of KEYWORD_RULES) {
      if (pesan.toLowerCase().includes(rule.match.toLowerCase())) {
        keyword = rule.keyword;
        break;
      }
    }

    // Hitung interval MySQL dari cooldownMs (konversi ms → detik)
    const cooldownDetik = Math.floor(cooldownMs / 1000);

    // Cek apakah dalam window cooldown sudah ada notif sejenis di DB
    const notifTerakhir = await Notification.findOne({
      where: {
        perangkat_id,
        pesan: { [Op.like]: keyword },
        createdAt: {
          [Op.gte]: sequelize.literal(`NOW() - INTERVAL ${cooldownDetik} SECOND`)
        }
      },
      order: [['createdAt', 'DESC']]
    });

    if (notifTerakhir) {
      console.log(`⏳ [COOLDOWN AKTIF] Keyword "${keyword}" ditemukan dalam ${cooldownDetik}s terakhir → diblokir.`);
      return null;
    }

    // Lolos cooldown → simpan ke DB
    const newNotif = await Notification.create({ perangkat_id, pesan });
    console.log(`✅ [NOTIF DIBUAT] perangkat_id=${perangkat_id} | keyword="${keyword}"`);
    return newNotif;

  } catch (err) {
    console.error("❌ Gagal memproses filter cooldown notifikasi:", err.message);
    return null;
  }
};

// ========================================================================
// 🌟 SHORTCUT HELPER: Buat notif + kirim Telegram sekaligus (DRY)
// ========================================================================
/**
 * Wrapper praktis: cek cooldown, simpan ke DB, lalu kirim Telegram — dalam satu fungsi.
 * Gunakan ini di semua controller agar tidak ada duplikasi pola if (isCreated) sendTelegram().
 *
 * @param {Object} params
 * @param {string|number} params.perangkat_id   - ID perangkat IoT
 * @param {string}        params.pesanDB        - Pesan yang disimpan ke tabel Notification
 * @param {string}        params.pesanTelegram  - Pesan yang dikirim ke Telegram (bisa pakai Markdown)
 * @param {number}        [params.cooldownMs]   - Override cooldown, default 5 menit
 * @returns {Promise<boolean>}                  - true jika notif berhasil dikirim, false jika di-blok
 */
const sendNotificationWithCooldown = async ({ perangkat_id, pesanDB, pesanTelegram, cooldownMs }) => {
  const isCreated = await createNotificationWithCooldown({
    perangkat_id,
    pesan: pesanDB,
    cooldownMs
  });

  if (isCreated) {
    sendTelegram(pesanTelegram);
    return true;
  }
  return false;
};

module.exports = {
  createNotificationWithCooldown,
  sendNotificationWithCooldown,
};