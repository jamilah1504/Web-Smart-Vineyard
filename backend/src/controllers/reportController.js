const { LogSensorTanah, Notification, PerangkatIoT, LogDiagnosisAI } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table'); // Library baru untuk PDF

exports.exportReport = async (req, res) => {
    try {
        // Menerima parameter dari URL Frontend
        const { startDate, endDate, type, format } = req.query;

        // 1. Setup Tanggal (Pastikan endDate mencakup sampai jam 23:59:59 di hari itu)
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        let fileName = "Laporan";
        let columns = [];
        let rows = [];

        // 2. Tarik Data & Format Kolom berdasarkan "type" laporan
        if (type === 'Data sensor harian') {
            const rawData = await LogSensorTanah.findAll({
                where: { timestamp: { [Op.between]: [start, end] } },
                include: [{ model: PerangkatIoT, attributes: ['nama_node'] }],
                order: [['timestamp', 'ASC']]
            });
            fileName = "Laporan_Sensor";
            columns = ['Waktu', 'Perangkat', 'Kelembapan (%)', 'pH', 'N-P-K'];
            rows = rawData.map(item => [
                new Date(item.timestamp).toLocaleString('id-ID'),
                item.PerangkatIoT?.nama_node || item.perangkat_id,
                item.kelembapan_val,
                item.ph_val,
                `${item.n_val}-${item.p_val}-${item.k_val}`
            ]);
        } 
        else if (type === 'Aktivitas pompa') {
            // Mengambil notifikasi yang mengandung kata "pompa" atau status kritis
            const rawData = await Notification.findAll({
                where: { 
                    createdAt: { [Op.between]: [start, end] },
                    [Op.or]: [
                        { pesan: { [Op.like]: '%pompa%' } },
                        { tipe: 'critical' }
                    ]
                },
                order: [['createdAt', 'DESC']]
            });
            fileName = "Laporan_Aktivitas_Pompa";
            columns = ['Waktu', 'Tipe Notifikasi', 'Pesan / Aktivitas'];
            rows = rawData.map(item => [
                new Date(item.createdAt).toLocaleString('id-ID'),
                item.tipe || 'Info',
                item.pesan
            ]);
        }
        else if (type === 'Analisis tren') {
            // Mengambil riwayat diagnosis AI
            const rawData = await LogDiagnosisAI.findAll({
                where: { createdAt: { [Op.between]: [start, end] } },
                order: [['createdAt', 'ASC']]
            });
            fileName = "Laporan_Analisis_AI";
            columns = ['Waktu', 'ID Perangkat', 'Hasil Diagnosis AI', 'Confidence (%)'];
            rows = rawData.map(item => [
                new Date(item.createdAt).toLocaleString('id-ID'),
                item.perangkat_id,
                item.hasil_diagnosis,
                item.confidence_score
            ]);
        }

        // 3. Generate File Berdasarkan "format" (Excel / PDF)
        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Laporan');
            
            // Insert Header & Data
            sheet.addRow(columns);
            sheet.getRow(1).font = { bold: true };
            rows.forEach(row => sheet.addRow(row));

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } 
        else if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
            doc.pipe(res);
            
            // Header PDF
            doc.fontSize(16).text(`Laporan: ${type}`, { align: 'center' });
            doc.fontSize(10).text(`Periode: ${startDate} s/d ${endDate}`, { align: 'center' });
            doc.moveDown();

            // Membuat Tabel PDF
            const table = { headers: columns, rows: rows };
            await doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
                prepareRow: () => doc.font("Helvetica").fontSize(9)
            });

            doc.end();
        } else {
            res.status(400).json({ status: 'error', message: 'Format file tidak didukung' });
        }

    } catch (error) {
        console.error("❌ Error Export:", error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
};