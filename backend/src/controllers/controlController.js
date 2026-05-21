const { PerangkatIoT, LogTandon, VarietasAnggur, LogSensorTanah } = require('../models'); // Pastikan LogSensorTanah di-import

// ========================================================================
// 1. UPDATE KONTROL POMPA (Dari Web Frontend)
// ========================================================================
exports.updatePumpStatus = async (req, res) => {
  const { id } = req.params; 
  const { status_pompa_air, status_pompa_pupuk, mode_kerja } = req.body;

  try {
    // 🔒 BACKEND SAFETY OVERRIDE
    if (status_pompa_air === true || status_pompa_pupuk === true) {
        const tandonTerakhir = await LogTandon.findOne({
            where: { perangkat_id: id, jenis_tandon: 'air' },
            order: [['createdAt', 'DESC']] // Disarankan pakai createdAt bawaan sequelize jika timestamp error
        });

        // Di ESP32 batasnya 5cm, di backend 10cm (Bagus untuk double safety)
        if (tandonTerakhir && tandonTerakhir.ketinggian_air !== null && tandonTerakhir.ketinggian_air < 10.0) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'GAGAL: Air tandon habis (< 10 cm)! Pompa diblokir demi keamanan.' 
            });
        }
    }

    const [updated] = await PerangkatIoT.update(
      { status_pompa_air, status_pompa_pupuk, mode_kerja },
      { where: { id: id } }
    );

    if (updated) {
      // 🌟 PERBAIKAN: setTimeout 5 detik DIHAPUS dari sini.
      // Kontrol durasi 5 detik sepenuhnya diserahkan ke hardware ESP32 agar tidak race condition.
      res.json({ status: 'success', message: 'Kontrol berhasil diperbarui' });
    } else {
      res.status(404).json({ status: 'error', message: 'Perangkat tidak ditemukan' });
    }
  } catch (err) {
    console.error("❌ Error updatePumpStatus:", err.message);
    res.status(500).json({ status: 'error', error: err.message });
  }
};

// ========================================================================
// 2. GET STATUS & THRESHOLD (Ditembak oleh ESP32 tiap 3 detik)
// ========================================================================
exports.getPumpStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const perangkat = await PerangkatIoT.findOne({
            where: { id: id },
            include: [{
                model: VarietasAnggur,
                as: 'Varietas_Anggur' 
            }]
        });

        if (!perangkat) {
            return res.status(404).json({ status: 'error', message: 'Perangkat tidak ditemukan' });
        }

        const batasKering = perangkat.Varietas_Anggur ? perangkat.Varietas_Anggur.min_moisture : 40.0;

        // Struktur ini SUDAH SEMPURNA dan dikenali oleh ArduinoJson di ESP32
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
// 3. TAMBAHAN WAJIB: MENERIMA DATA SENSOR (Ditembak oleh ESP32 tiap 15 detik)
// ========================================================================
exports.saveSensorData = async (req, res) => {
    try {
        // Ekstrak data sesuai dengan nama key JSON yang dikirim dari Arduino IDE
        const {
            perangkat_id,
            kelembapan_tanah,
            suhu_tanah,
            ph_tanah,
            ketinggian_air,
            ec,
            nitrogen,
            fosfor,
            kalium,
            jenis_tandon
        } = req.body;

        console.log(`📥 Menerima data sensor dari perangkat: ${perangkat_id}`);

        // 1. Simpan data log tanah ke database
        await LogSensorTanah.create({
            perangkat_id,
            moisture: kelembapan_tanah,
            suhu: suhu_tanah,
            ph: ph_tanah,
            ec,
            n: nitrogen,
            p: fosfor,
            k: kalium
        });

        // 2. Simpan data log tandon ke database
        await LogTandon.create({
            perangkat_id,
            ketinggian_air,
            jenis_tandon: jenis_tandon || 'air'
        });

        res.status(201).json({
            status: 'success',
            message: 'Data sensor tanah dan tandon berhasil disimpan'
        });

    } catch (error) {
        console.error("❌ Error saveSensorData:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};