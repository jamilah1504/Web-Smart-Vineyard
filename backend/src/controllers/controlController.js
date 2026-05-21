const { PerangkatIoT, LogTandon, VarietasAnggur } = require('../models');

// ========================================================================
// 1. UPDATE KONTROL POMPA (Ditembak oleh Website/Frontend saat tombol diklik)
// ========================================================================
exports.updatePumpStatus = async (req, res) => {
  const { id } = req.params; 
  const { status_pompa_air, status_pompa_pupuk, mode_kerja } = req.body;

  try {
    // 🔒 BACKEND SAFETY OVERRIDE UNTUK SKENARIO DARURAT
    // Mencegah user memaksa menyalakan pompa dari web jika tandon air terdeteksi habis
    if (status_pompa_air === true || status_pompa_pupuk === true) {
        // Cek data tandon terakhir dari database
        const tandonTerakhir = await LogTandon.findOne({
            where: { perangkat_id: id, jenis_tandon: 'air' },
            order: [['timestamp', 'DESC']] // Sesuaikan dengan nama kolom waktu kamu (misal: createdAt)
        });

        // Jika ketinggian air di bawah 10 cm, tolak perintah nyala
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
      res.json({ status: 'success', message: 'Kontrol berhasil diperbarui' });

      // ==========================================================
      // FITUR TAMBAHAN: AUTO-OFF 5 DETIK SETELAH DISIMPAN
      // ==========================================================
      
      // Jika pompa air dinyalakan (1 / true), set timer 5 detik untuk mematikan
      if (status_pompa_air) {
        setTimeout(async () => {
          try {
            await PerangkatIoT.update(
              { status_pompa_air: false }, // atau 0
              { where: { id: id } }
            );
            console.log(`⏱️ Pompa Air ${id} otomatis dimatikan setelah 5 detik`);
          } catch (err) {
            console.error("Gagal auto-off pompa air:", err);
          }
        }, 5000);
      }

      // Jika pompa pupuk dinyalakan (1 / true), set timer 5 detik untuk mematikan
      if (status_pompa_pupuk) {
        setTimeout(async () => {
          try {
            await PerangkatIoT.update(
              { status_pompa_pupuk: false }, // atau 0
              { where: { id: id } }
            );
            console.log(`⏱️ Pompa Pupuk ${id} otomatis dimatikan setelah 5 detik`);
          } catch (err) {
            console.error("Gagal auto-off pompa pupuk:", err);
          }
        }, 5000);
      }
      // ==========================================================

    } else {
      res.status(404).json({ status: 'error', message: 'Perangkat tidak ditemukan' });
    }
  } catch (err) {
    console.error("❌ Error updatePumpStatus:", err.message);
    res.status(500).json({ status: 'error', error: err.message });
  }
};


// ========================================================================
// 2. GET STATUS & THRESHOLD (Ditembak oleh ESP32 secara berkala)
// ========================================================================
exports.getPumpStatus = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`\n======================================`);
        console.log(`🚀 CEK API: ESP32 Meminta Data Untuk ${id}`);
        console.log(`======================================\n`);

        const perangkat = await PerangkatIoT.findOne({
            where: { id: id },
            include: [{
                model: VarietasAnggur,
                // 🌟 PERBAIKAN 1: Samakan dengan nama alias di error Sequelize
                as: 'Varietas_Anggur' 
            }]
        });

        if (!perangkat) {
            return res.status(404).json({ status: 'error', message: 'Perangkat tidak ditemukan' });
        }

        // 🌟 PERBAIKAN 2: Karena aliasnya berubah, cara panggil objeknya juga harus ikut berubah
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