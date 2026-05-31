// 🌟 PASTIKAN menambahkan LogPompa di baris import ini
const { PerangkatIoT, LogTandon, VarietasAnggur, LogSensorTanah, LogPompa } = require('../models'); 

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
            order: [['timestamp', 'DESC']] // Disarankan pakai createdAt bawaan sequelize jika timestamp error
        });

        // Di ESP32 batasnya 5cm, di backend 10cm (Bagus untuk double safety)
        if (tandonTerakhir && tandonTerakhir.ketinggian_air !== null && tandonTerakhir.ketinggian_air < 10.0) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'GAGAL: Air tandon habis (< 10 cm)! Pompa diblokir demi keamanan.' 
            });
        }
    }

    // 🔧 PERBAIKAN: Hanya update field yang dikirim, hindari undefined values
    const updateData = {};
    if (status_pompa_air !== undefined) updateData.status_pompa_air = status_pompa_air;
    if (status_pompa_pupuk !== undefined) updateData.status_pompa_pupuk = status_pompa_pupuk;
    if (mode_kerja !== undefined) updateData.mode_kerja = mode_kerja;

    console.log(`📨 updatePumpStatus - ID: ${id}, Data: `, updateData);

    const [updated] = await PerangkatIoT.update(
      updateData,
      { where: { id: id } }
    );

    if (updated) {
      // =======================================================
      // 🌟 TAMBAHAN: SIMPAN KE TABEL HISTORI POMPA
      // =======================================================
      try {
        const currentMode = mode_kerja ? String(mode_kerja).toUpperCase() : 'UNKNOWN';

        // Catat histori pompa air jika ada perubahan
        if (status_pompa_air !== undefined) {
          await LogPompa.create({
            perangkat_id: id,
            jenis_pompa: 'air',
            status: status_pompa_air ? 'NYALA' : 'MATI',
            mode_trigger: currentMode
          });
        }
        
        // Catat histori pompa pupuk jika ada perubahan
        if (status_pompa_pupuk !== undefined) {
          await LogPompa.create({
            perangkat_id: id,
            jenis_pompa: 'pupuk',
            status: status_pompa_pupuk ? 'NYALA' : 'MATI',
            mode_trigger: currentMode
          });
        }
      } catch (logErr) {
        // Jika histori gagal dicatat (misal tabel belum dibuat), tidak akan merusak sistem utama
        console.error("⚠️ Gagal mencatat histori pompa:", logErr.message);
      }
      // =======================================================

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

// ========================================================================
// 4. GET HISTORI POMPA (Untuk ditampilkan di Tabel/Frontend)
// ========================================================================
exports.getPumpHistory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const history = await LogPompa.findAll({
            where: { perangkat_id: id },
            order: [['createdAt', 'DESC']], // Diurutkan dari yang paling baru
            limit: 50 // Batasi 50 data terakhir agar ringan dimuat
        });

        res.status(200).json({
            status: 'success',
            data: history
        });

    } catch (error) {
        console.error("❌ Error getPumpHistory:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};