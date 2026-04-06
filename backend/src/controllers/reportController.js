const { LogSensorTanah, Notification, PerangkatIoT } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

exports.exportExcel = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;

        // 1. Ambil Data berdasarkan Jenis
        let data;
        let fileName = "";

        if (type === 'Data sensor harian') {
            data = await LogSensorTanah.findAll({
                where: {
                    timestamp: { [Op.between]: [new Date(startDate), new Date(endDate)] }
                },
                include: [{ model: PerangkatIoT, attributes: ['nama_node'] }]
            });
            fileName = "Laporan_Sensor.xlsx";
        } else {
            // Contoh untuk Aktivitas Pompa (diambil dari Notifikasi)
            data = await Notification.findAll({
                where: {
                    createdAt: { [Op.between]: [new Date(startDate), new Date(endDate)] }
                }
            });
            fileName = "Laporan_Aktivitas.xlsx";
        }

        // 2. Build Excel File
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Laporan');

        if (type === 'Data sensor harian') {
            sheet.columns = [
                { header: 'Waktu', key: 'timestamp', width: 25 },
                { header: 'Perangkat', key: 'node', width: 20 },
                { header: 'Moisture (%)', key: 'moisture', width: 15 },
                { header: 'pH', key: 'ph', width: 10 },
                { header: 'N-P-K', key: 'npk', width: 20 }
            ];

            data.forEach(item => {
                sheet.addRow({
                    timestamp: item.timestamp,
                    node: item.Perangkat_IoT?.nama_node,
                    moisture: item.moisture_val,
                    ph: item.ph_val,
                    npk: `${item.n_val}-${item.p_val}-${item.k_val}`
                });
            });
        }

        // 3. Kirim File ke Browser
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};