const { VarietasAnggur, PerangkatIoT } = require('../models');

exports.createVarietas = async (req, res) => {
    try {
        // 1. Tangkap semua data dari request body
        const { 
            nama_varietas, perangkat_id,
            min_moisture, max_moisture,
            min_suhu, max_suhu,
            min_ph, max_ph,
            min_ec, max_ec,
            min_n, max_n,
            min_p, max_p,
            min_k, max_k
        } = req.body;

        // ==========================================
        // 🛡️ VALIDASI KEAMANAN DATA
        // ==========================================
        
        // A. Validasi Rentang Absolut
        if (min_moisture < 0 || max_moisture > 100) {
            return res.status(400).json({ status: 'error', message: 'Rentang kelembapan harus antara 0 - 100%' });
        }
        if (min_ph < 0 || max_ph > 14) {
            return res.status(400).json({ status: 'error', message: 'Rentang pH tidak valid (Harus 0 - 14)' });
        }

        // B. Validasi Logika (Min tidak boleh melebihi Max)
        // Kita gunakan Number() untuk memastikan string dari frontend diubah ke angka sebelum dibandingkan
        if (
            Number(min_moisture) > Number(max_moisture) ||
            Number(min_suhu) > Number(max_suhu) ||
            Number(min_ph) > Number(max_ph) ||
            Number(min_ec) > Number(max_ec) ||
            Number(min_n) > Number(max_n) ||
            Number(min_p) > Number(max_p) ||
            Number(min_k) > Number(max_k)
        ) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'GAGAL: Terdapat nilai Minimum (min) yang lebih besar dari nilai Maksimum (max)!' 
            });
        }

        // ==========================================
        // 💾 PROSES PENYIMPANAN
        // ==========================================

        // 2. Buat Varietas Baru (req.body akan memetakan semua parameter otomatis)
        const varietas = await VarietasAnggur.create(req.body);

        // 3. 🌟 BINDING PERANGKAT: Jika user memilih perangkat, update tabel PerangkatIoT
        if (perangkat_id) {
            await PerangkatIoT.update(
                { varietas_id: varietas.id },
                { where: { id: perangkat_id } }
            );
        }

        res.status(201).json({ status: 'success', data: varietas });
    } catch (error) {
        console.error("❌ Error createVarietas:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.getAllVarietas = async (req, res) => {
    try {
        const varietas = await VarietasAnggur.findAll();
        res.status(200).json({ status: 'success', data: varietas });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.updateVarietas = async (req, res) => {
    try {
        const { perangkat_id } = req.body; // Tangkap perangkat_id jika ada perubahan
        const varietas = await VarietasAnggur.findByPk(req.params.id);
        
        if (!varietas) return res.status(404).json({ status: 'error', message: 'Varietas tidak ditemukan' });

        await varietas.update(req.body);

        // 🌟 TAMBAHAN: Update binding perangkat jika user menggantinya saat Edit
        if (perangkat_id !== undefined) { 
            // Kosongkan dulu perangkat lama yang mungkin memakai varietas ini
            await PerangkatIoT.update(
                { varietas_id: null }, 
                { where: { varietas_id: varietas.id } }
            );
            // Pasangkan ke perangkat yang baru dipilih (jika user memilih perangkat)
            if (perangkat_id !== "") {
                await PerangkatIoT.update(
                    { varietas_id: varietas.id },
                    { where: { id: perangkat_id } }
                );
            }
        }

        res.status(200).json({ status: 'success', message: 'Varietas berhasil diperbarui', data: varietas });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.deleteVarietas = async (req, res) => {
    try {
        const varietas = await VarietasAnggur.findByPk(req.params.id);
        if (!varietas) return res.status(404).json({ status: 'error', message: 'Varietas tidak ditemukan' });

        // CATATAN PENTING: Jika varietas dihapus, perangkat yang terhubung (binding)
        // akan memiliki nilai varietas_id = NULL secara otomatis (jika relasi diatur OnDelete: SET NULL).
        
        await varietas.destroy();
        res.status(200).json({ status: 'success', message: 'Varietas berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};