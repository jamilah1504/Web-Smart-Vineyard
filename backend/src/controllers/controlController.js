// 🌟 IMPORT SEMUA MODEL & OPERATOR SEQUELIZE YANG DIBUTUHKAN
const { LogTandon, PerangkatIoT, Notification, LogSensorTanah, VarietasAnggur, LogPompa, sequelize } = require('../models');
const { Op } = require('sequelize'); 
const sendTelegram = require('../utils/telegram');

// Jangkauan fisik sensor ultrasonik ke dasar tandon
const TINGGI_MAX = 34.87;

// 🌟 CACHE UNTUK MENYIMPAN REF TIMEOUT (Mencegah overlapping / tumpang tindih timer jika diklik berkali-kali)
const activeTimers = {
  air: {},   // { perangkat_id: timeoutRef }
  pupuk: {}  // { perangkat_id: timeoutRef }
};

// ========================================================================
// 🌟 HELPER: Filter Cooldown Menggunakan Identifikasi Pesan Dinamis (Anti-Bocor)
// ========================================================================
const createNotificationWithCooldown = async ({ perangkat_id, pesan }) => {
  try {
    const cleanPesan = pesan.replace(/[\r\n]+/g, " "); 
    const pesanChunk = cleanPesan.substring(0, 20);
    const keyword = `%${pesanChunk}%`;

    const notifTerakhir = await Notification.findOne({
      where: {
        perangkat_id,
        pesan: { [Op.like]: keyword },
        createdAt: {
          [Op.gte]: sequelize.literal("NOW() - INTERVAL 5 MINUTE")
        }
      },
      order: [['createdAt', 'DESC']]
    });

    if (notifTerakhir) {
      console.log(`⏳ [COOLDOWN ACTIVE] Notifikasi sejenis "${pesanChunk}..." terdeteksi dalam 5 menit terakhir. Skip.`);
      return null;
    }

    return await Notification.create({ perangkat_id, pesan });
  } catch (err) {
    console.error("❌ Gagal memproses filter cooldown notifikasi:", err.message);
    return null;
  }
};

// ========================================================================
// 1. UPDATE KONTROL POMPA (Ditembak oleh Web Frontend)
// ========================================================================
exports.updatePumpStatus = async (req, res) => {
  const { id } = req.params; 
  const { status_pompa_air, status_pompa_pupuk, mode_kerja } = req.body;

  try {
    // Proteksi hulu: Jangan ijinkan pompa menyala jika air tandon kritis
    if (status_pompa_air === true || status_pompa_pupuk === true) {
        const tandonTerakhir = await LogTandon.findOne({
            where: { perangkat_id: id, jenis_tandon: 'air' },
            order: [['timestamp', 'DESC']] 
        });

        if (tandonTerakhir && tandonTerakhir.ketinggian_air < 10.0) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'GAGAL: Air tandon habis (< 10 cm)! Pompa diblokir demi keamanan.' 
            });
        }
    }

    const updateData = {};
    if (mode_kerja !== undefined && mode_kerja !== null) {
        const cleanMode = String(mode_kerja).toLowerCase().trim();
        updateData.mode_kerja = (cleanMode === 'auto' || cleanMode === 'otomatis') ? 'auto' : 'manual';
    }

    if (status_pompa_air !== undefined) updateData.status_pompa_air = status_pompa_air;
    if (status_pompa_pupuk !== undefined) updateData.status_pompa_pupuk = status_pompa_pupuk;

    const perangkat = await PerangkatIoT.findOne({ where: { id: id } });
    if (!perangkat) {
        return res.status(404).json({ status: 'error', message: 'Perangkat tidak ditemukan' });
    }

    await PerangkatIoT.update(updateData, { 
        where: { id: id },
        individualHooks: true 
    });

    const currentModeString = String(updateData.mode_kerja || perangkat.mode_kerja).toUpperCase();

    // ----------------=======================================
    // LOGIKA BACKGROUND TIMER 5 DETIK (MANUAL TRIGGER FROM WEB)
    // ----------------=======================================
    
    // A. Manajemen Timer Pompa Air
    if (status_pompa_air === true) {
      // Catat Log Nyala
      await LogPompa.create({ perangkat_id: id, jenis_pompa: 'air', status: 'NYALA', mode_trigger: currentModeString });
      
      // Jika sebelumnya sudah ada timer berjalan, hapus dulu agar tidak tabrakan
      if (activeTimers.air[id]) clearTimeout(activeTimers.air[id]);

      // Pasang timer otomatis mati dalam 5 detik
      activeTimers.air[id] = setTimeout(async () => {
        try {
          await PerangkatIoT.update({ status_pompa_air: false }, { where: { id: id } });
          await LogPompa.create({ perangkat_id: id, jenis_pompa: 'air', status: 'MATI', mode_trigger: currentModeString });
          delete activeTimers.air[id];
          console.log(`[TIMER SERVED] Pompa Air ${id} sukses dimatikan otomatis setelah 5 detik.`);
        } catch (timerErr) {
          console.error("❌ Gagal mematikan pompa air via timer:", timerErr.message);
        }
      }, 5000);

    } else if (status_pompa_air === false) {
      // Jika user klik matikan secara manual dari web sebelum 5 detik habis
      if (activeTimers.air[id]) {
        clearTimeout(activeTimers.air[id]);
        delete activeTimers.air[id];
      }
      await LogPompa.create({ perangkat_id: id, jenis_pompa: 'air', status: 'MATI', mode_trigger: currentModeString });
    }

    // B. Manajemen Timer Pompa Pupuk
    if (status_pompa_pupuk === true) {
      // Catat Log Nyala
      await LogPompa.create({ perangkat_id: id, jenis_pompa: 'pupuk', status: 'NYALA', mode_trigger: currentModeString });
      
      if (activeTimers.pupuk[id]) clearTimeout(activeTimers.pupuk[id]);

      activeTimers.pupuk[id] = setTimeout(async () => {
        try {
          await PerangkatIoT.update({ status_pompa_pupuk: false }, { where: { id: id } });
          await LogPompa.create({ perangkat_id: id, jenis_pompa: 'pupuk', status: 'MATI', mode_trigger: currentModeString });
          delete activeTimers.pupuk[id];
          console.log(`[TIMER SERVED] Pompa Pupuk ${id} sukses dimatikan otomatis setelah 5 detik.`);
        } catch (timerErr) {
          console.error("❌ Gagal mematikan pompa pupuk via timer:", timerErr.message);
        }
      }, 5000);

    } else if (status_pompa_pupuk === false) {
      if (activeTimers.pupuk[id]) {
        clearTimeout(activeTimers.pupuk[id]);
        delete activeTimers.pupuk[id];
      }
      await LogPompa.create({ perangkat_id: id, jenis_pompa: 'pupuk', status: 'MATI', mode_trigger: currentModeString });
    }

    return res.status(200).json({ status: 'success', message: 'Kontrol berhasil diperbarui, batas durasi 5 detik aktif.' });

  } catch (err) {
    console.error("❌ Error updatePumpStatus:", err.message);
    res.status(500).json({ status: 'error', error: err.message });
  }
};

// ========================================================================
// 2. GET STATUS PERANGKAT (Ditembak oleh ESP32 tiap 1 detik)
// ========================================================================
exports.getPumpStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const perangkat = await PerangkatIoT.findOne({
            where: { id: id },
            include: [{ model: VarietasAnggur, as: 'Varietas_Anggur' }]
        });

        if (!perangkat) {
            return res.status(404).json({ status: 'error', message: 'Perangkat tidak ditemukan' });
        }

        const batasKering = perangkat.Varietas_Anggur ? perangkat.Varietas_Anggur.min_moisture : 40.0;

        res.status(200).json({
            status: 'success',
            data: {
                mode_kerja: perangkat.mode_kerja,
                status_pompa_air: perangkat.status_pompa_air,
                status_pompa_pupuk: perangkat.status_pompa_pupuk,
                batas_kering: batasKering
            }
        });
    } catch (error) {
        console.error("❌ Error getPumpStatus:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// ========================================================================
// 3. MENERIMA TELEMETRY SENSOR & OTOMASI NOTIFIKASI + KONTROL AUTO POMPA AIR
// ========================================================================
exports.saveSensorData = async (req, res) => {
    try {
        const {
            perangkat_id, kelembapan_tanah, suhu_tanah, ph_tanah,
            ketinggian_air, ec, nitrogen, fosfor, kalium, jenis_tandon
        } = req.body;

        console.log(`📥 Menerima telemetry dari perangkat: ${perangkat_id}`);

        // 1. Simpan ke database log
        await LogSensorTanah.create({
            perangkat_id, moisture: kelembapan_tanah, suhu: suhu_tanah, ph: ph_tanah,
            ec, n: nitrogen, p: fosfor, k: kalium
        });

        await LogTandon.create({
            perangkat_id, ketinggian_air, jenis_tandon: jenis_tandon || 'air'
        });

        // 2. Ambil acuan batas dari varietas anggur perangkat
        const perangkat = await PerangkatIoT.findOne({
            where: { id: perangkat_id },
            include: [{ model: VarietasAnggur, as: 'Varietas_Anggur' }]
        });

        if (perangkat && perangkat.mode_kerja === 'auto') {
            const minNitrogen = perangkat.Varietas_Anggur ? perangkat.Varietas_Anggur.min_n : 30.0;
            const minMoisture = perangkat.Varietas_Anggur ? perangkat.Varietas_Anggur.min_moisture : 40.0;

            // 🌟 A. OTOMASI CHECK & EKSEKUSI: TANAH KERING (AUTO TIMED WATERING)
            if (kelembapan_tanah > 0 && kelembapan_tanah < minMoisture) {
                
                // Eksekusi penyiraman HANYA JIKA pompa sedang MATI dan tidak ada timer aktif
                if (perangkat.status_pompa_air === false && !activeTimers.air[perangkat_id]) {
                    
                    // 1. Nyalakan pompa di database & buat log histori
                    await PerangkatIoT.update({ status_pompa_air: true }, { where: { id: perangkat_id } });
                    await LogPompa.create({ perangkat_id: perangkat_id, jenis_pompa: 'air', status: 'NYALA', mode_trigger: 'AUTO' });

                    // 2. Pasang background timer 5 detik untuk mematikan kembali
                    activeTimers.air[perangkat_id] = setTimeout(async () => {
                        try {
                            await PerangkatIoT.update({ status_pompa_air: false }, { where: { id: perangkat_id } });
                            await LogPompa.create({ perangkat_id: perangkat_id, jenis_pompa: 'air', status: 'MATI', mode_trigger: 'AUTO' });
                            delete activeTimers.air[perangkat_id];
                            console.log(`[AUTO TIMER SERVED] Pompa Air ${perangkat_id} otomatis mati (5 detik selesai).`);
                        } catch (autoErr) {
                            console.error("❌ Gagal mematikan pompa air otomatis:", autoErr.message);
                        }
                    }, 5000);

                    // 3. Kirim alarm alert ke Telegram
                    const alertPesan = `⚠️ *AETERA AUTO WATERING*\n\nNode: ${perangkat_id}\nStatus: Tanah Kering (${kelembapan_tanah}%)\nTindakan: Menyiram otomatis selama 5 detik.`;
                    const isCreated = await createNotificationWithCooldown({ perangkat_id, pesan: alertPesan });
                    if (isCreated) {
                        sendTelegram(alertPesan);
                        console.log("🚀 Telegram Alarm Otomatis Menyiram berhasil terkirim.");
                    }
                }
            }

            // 🌟 B. OTOMASI CHECK: NITROGEN RENDAH (Tetap Manual sesuai aturan awal Anda)
            if (nitrogen > 0 && nitrogen < minNitrogen) {
                const rekomendasiPesan = `⚠️ *REKOMENDASI NUTRISI*\nNode: ${perangkat_id}\nKadar N: *${nitrogen} mg/kg* (Batas: ${minNitrogen} mg/kg)\n\n_Mohon nyalakan Pompa Pupuk via Web secara manual._`;

                const isCreated = await createNotificationWithCooldown({ perangkat_id, pesan: rekomendasiPesan });
                if (isCreated) {
                    sendTelegram(rekomendasiPesan);
                    console.log("🚀 Telegram Rekomendasi Nutrisi berhasil terkirim.");
                }
            }
        }

        return res.status(201).json({ status: 'success' });
    } catch (error) {
        console.error("❌ Error saveSensorData:", error.message);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

// ========================================================================
// 4. MENCATAT PROTEKSI KETINGGIAN AIR (Fungsi recordWaterLevel)
// ========================================================================
exports.recordWaterLevel = async (req, res) => {
    try {
        const { perangkat_id, ketinggian_air, jenis_tandon } = req.body;
        const persentase = (ketinggian_air / TINGGI_MAX) * 100;

        await LogTandon.create({ perangkat_id, ketinggian_air, jenis_tandon });

        // LOGIKA PROTEKSI KONDISI AIR TANDON
        if (jenis_tandon === 'air') {
            // Air kritis (< 10%) -> Matikan paksa ke manual
            if (persentase < 10) {
                // Clear any active timers if running to prevent them turning the pump back on
                if (activeTimers.air[perangkat_id]) { clearTimeout(activeTimers.air[perangkat_id]); delete activeTimers.air[perangkat_id]; }
                if (activeTimers.pupuk[perangkat_id]) { clearTimeout(activeTimers.pupuk[perangkat_id]); delete activeTimers.pupuk[perangkat_id]; }

                await PerangkatIoT.update(
                    { status_pompa_air: false, status_pompa_pupuk: false, mode_kerja: 'manual' }, 
                    { where: { id: perangkat_id } }
                );

                const alarmPesan = `🚨 *ALARM*: Air kritis (${persentase.toFixed(1)}%). Pompa dimatikan otomatis oleh sistem!`;
                const isCreated = await createNotificationWithCooldown({ perangkat_id, pesan: alarmPesan });

                if (isCreated) {
                    sendTelegram(alarmPesan);
                }
            } 
            // Air sudah terisi kembali (> 25%) -> Kembalikan ke AUTO
            else if (persentase > 25) {
                const perangkat = await PerangkatIoT.findByPk(perangkat_id);
                if (perangkat && perangkat.mode_kerja === 'manual' && perangkat.status_pompa_air === false) {
                    await PerangkatIoT.update({ mode_kerja: 'auto' }, { where: { id: perangkat_id } });

                    const infoPesan = `✅ *INFO*: Air terisi (${persentase.toFixed(1)}%). Sistem kembali ke Mode AUTO.`;
                    const isCreated = await createNotificationWithCooldown({ perangkat_id, pesan: infoPesan });

                    if (isCreated) {
                        sendTelegram(infoPesan);
                    }
                }
            }
        }
        return res.status(201).json({ status: 'success' });
    } catch (error) {
        console.error("❌ Error recordWaterLevel:", error.message);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

// ========================================================================
// 5. GET LATEST WATER LEVEL (Untuk UI Dashboard Tandon)
// ========================================================================
exports.getLatestWaterLevel = async (req, res) => {
    try {
        const { perangkat_id } = req.params;
        const logs = await LogTandon.findAll({
            where: { perangkat_id },
            order: [['timestamp', 'DESC']], 
            limit: 100
        });

        if (!logs || logs.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan.' });
        }

        const dataWithPercentage = logs.map(log => {
            const logJson = log.toJSON(); 
            const persentase = (logJson.ketinggian_air / TINGGI_MAX) * 100;
            return {
                ...logJson,
                tinggi_maks: TINGGI_MAX,
                persentase: parseFloat(persentase.toFixed(1)) 
            };
        });
        return res.status(200).json({ status: 'success', data: dataWithPercentage });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error.message });
    }
};

// ========================================================================
// 6. GET HISTORI POMPA (Untuk ditampilkan di Tabel Log Halaman Owner)
// ========================================================================
exports.getPumpHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const history = await LogPompa.findAll({
            where: { perangkat_id: id },
            order: [['createdAt', 'DESC']], 
            limit: 50 
        });
        res.status(200).json({ status: 'success', data: history });
    } catch (error) {
        console.error("❌ Error getPumpHistory:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};