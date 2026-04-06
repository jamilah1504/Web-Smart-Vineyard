const User = require('../models/User');
const Laporan = require('../models/Laporan');
const Insiden = require('../models/Insiden');
const LokasiRawan = require('../models/LokasiRawan');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        // Hitung tanggal awal dan akhir hari ini (WIB)
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        const [results] = await Promise.all([
            Promise.all([
                // Total counts
                User.count(),
                Laporan.count(),
                // Insiden hari ini saja
                Insiden.count({
                    where: {
                        timestampDibuat: {
                            [Op.between]: [todayStart, todayEnd]
                        }
                    }
                }),
                LokasiRawan.count(),

                // User statistics by role
                User.findAll({
                    attributes: [
                        'role',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    group: ['role']
                }),

                // Laporan statistics by status
                Laporan.findAll({
                    attributes: [
                        'status',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    group: ['status']
                }),

                // Insiden statistics by status
                Insiden.findAll({
                    attributes: [
                        'statusInsiden',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    group: ['statusInsiden']
                }),

                // Laporan by jenis kejadian
                Laporan.findAll({
                    attributes: [
                        'jenisKejadian',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    group: ['jenisKejadian']
                }),

                // Insiden by skala
                Insiden.findAll({
                    attributes: [
                        'skalaInsiden',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    group: ['skalaInsiden']
                }),

                // Recent reports (last 5)
                Laporan.findAll({
                    limit: 5,
                    order: [['timestampDibuat', 'DESC']],
                    attributes: ['id', 'deskripsi', 'status', 'jenisKejadian', 'timestampDibuat']
                }),

                // Recent incidents (last 5)
                Insiden.findAll({
                    limit: 5,
                    order: [['timestampDibuat', 'DESC']],
                    attributes: ['id', 'judulInsiden', 'statusInsiden', 'skalaInsiden', 'timestampDibuat']
                })
            ])
        ]);

        const [
            totalUsers,
            totalLaporan,
            totalInsiden,
            totalLokasiRawan,
            usersByRole,
            laporanByStatus,
            insidenByStatus,
            laporanByJenis,
            insidenBySkala,
            recentLaporan,
            recentInsiden
        ] = results;

        res.json({
            success: true,
            data: {
                totalCounts: {
                    users: totalUsers,
                    laporan: totalLaporan,
                    insiden: totalInsiden,
                    lokasiRawan: totalLokasiRawan
                },
                distributions: {
                    usersByRole: usersByRole.reduce((acc, item) => {
                        acc[item.role] = item.dataValues.count;
                        return acc;
                    }, {}),
                    laporanByStatus: laporanByStatus.reduce((acc, item) => {
                        acc[item.status] = item.dataValues.count;
                        return acc;
                    }, {}),
                    insidenByStatus: insidenByStatus.reduce((acc, item) => {
                        acc[item.statusInsiden] = item.dataValues.count;
                        return acc;
                    }, {}),
                    laporanByJenis: laporanByJenis.reduce((acc, item) => {
                        acc[item.jenisKejadian] = item.dataValues.count;
                        return acc;
                    }, {}),
                    insidenBySkala: insidenBySkala.reduce((acc, item) => {
                        acc[item.skalaInsiden] = item.dataValues.count;
                        return acc;
                    }, {})
                },
                recent: {
                    laporan: recentLaporan,
                    insiden: recentInsiden
                }
            }
        });

    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting dashboard stats',
            error: error.message
        });
    }
};

// Get laporan kebakaran data untuk visualisasi chart
exports.getLaporanVisualization = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query; // 'daily', 'monthly', 'quarterly', 'yearly'
        
        let dateFormat, groupBy, startDate, labels = [];
        const now = new Date();
        
        // Tentukan format tanggal dan periode berdasarkan parameter
        switch (period) {
            case 'daily':
                // Data harian - 7 hari terakhir
                dateFormat = '%Y-%m-%d';
                groupBy = sequelize.fn('DATE', sequelize.col('timestampDibuat'));
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                // Generate labels untuk 7 hari terakhir
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    labels.push(date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
                }
                break;
            case 'monthly':
                // Data bulanan - 8 bulan terakhir
                dateFormat = '%Y-%m';
                groupBy = sequelize.fn('DATE_FORMAT', sequelize.col('timestampDibuat'), '%Y-%m');
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 8);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                // Generate labels untuk 8 bulan terakhir
                for (let i = 7; i >= 0; i--) {
                    const date = new Date(now);
                    date.setMonth(date.getMonth() - i);
                    labels.push(date.toLocaleDateString('id-ID', { month: 'short' }));
                }
                break;
            case 'quarterly':
                // Data triwulan - 4 triwulan terakhir (1 tahun)
                dateFormat = '%Y-Q';
                groupBy = sequelize.literal(`CONCAT(YEAR(timestampDibuat), '-Q', QUARTER(timestampDibuat))`);
                startDate = new Date(now);
                startDate.setFullYear(startDate.getFullYear() - 1);
                // Generate labels untuk 4 triwulan terakhir
                const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
                const currentYear = now.getFullYear();
                for (let i = 3; i >= 0; i--) {
                    let quarter = currentQuarter - i;
                    let year = currentYear;
                    if (quarter <= 0) {
                        quarter += 4;
                        year -= 1;
                    }
                    labels.push(`Q${quarter} ${year}`);
                }
                break;
            case 'yearly':
                // Data tahunan - 5 tahun terakhir
                dateFormat = '%Y';
                groupBy = sequelize.fn('YEAR', sequelize.col('timestampDibuat'));
                startDate = new Date(now);
                startDate.setFullYear(startDate.getFullYear() - 5);
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                // Generate labels untuk 5 tahun terakhir
                for (let i = 4; i >= 0; i--) {
                    const year = now.getFullYear() - i;
                    labels.push(year.toString());
                }
                break;
            default:
                dateFormat = '%Y-%m';
                groupBy = sequelize.fn('DATE_FORMAT', sequelize.col('timestampDibuat'), '%Y-%m');
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 8);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
        }

        // Query untuk mendapatkan jumlah laporan per periode
        const laporanData = await Laporan.findAll({
            attributes: [
                [groupBy, 'period'],
                [sequelize.fn('COUNT', sequelize.col('Laporan.id')), 'count']
            ],
            where: {
                timestampDibuat: {
                    [Op.gte]: startDate
                }
            },
            group: [sequelize.literal('period')],
            order: [[sequelize.literal('period'), 'ASC']],
            raw: true
        });

        // Query untuk mendapatkan jumlah insiden per periode
        const insidenData = await Insiden.findAll({
            attributes: [
                [groupBy, 'period'],
                [sequelize.fn('COUNT', sequelize.col('Insiden.id')), 'count']
            ],
            where: {
                timestampDibuat: {
                    [Op.gte]: startDate
                }
            },
            group: [sequelize.literal('period')],
            order: [[sequelize.literal('period'), 'ASC']],
            raw: true
        });

        // Mapping data ke format yang diharapkan
        const laporanMap = {};
        laporanData.forEach(item => {
            laporanMap[item.period] = parseInt(item.count);
        });

        const insidenMap = {};
        insidenData.forEach(item => {
            insidenMap[item.period] = parseInt(item.count);
        });

        // Generate data array untuk chart berdasarkan periode yang dipilih
        let laporanValues = [];
        let insidenValues = [];
        let chartLabels = [];

        if (period === 'monthly') {
            // Untuk bulanan, generate 8 bulan terakhir
            for (let i = 7; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(date.getMonth() - i);
                const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                laporanValues.push(laporanMap[periodKey] || 0);
                insidenValues.push(insidenMap[periodKey] || 0);
                chartLabels.push(date.toLocaleDateString('id-ID', { month: 'short' }));
            }
        } else if (period === 'daily') {
            // Untuk harian, generate 7 hari terakhir
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                laporanValues.push(laporanMap[periodKey] || 0);
                insidenValues.push(insidenMap[periodKey] || 0);
                chartLabels.push(date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }));
            }
        } else if (period === 'quarterly') {
            // Untuk triwulan, generate 4 triwulan terakhir
            const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
            const currentYear = now.getFullYear();
            for (let i = 3; i >= 0; i--) {
                let quarter = currentQuarter - i;
                let year = currentYear;
                if (quarter <= 0) {
                    quarter += 4;
                    year -= 1;
                }
                const periodKey = `${year}-Q${quarter}`;
                laporanValues.push(laporanMap[periodKey] || 0);
                insidenValues.push(insidenMap[periodKey] || 0);
                chartLabels.push(`Q${quarter} ${year}`);
            }
        } else if (period === 'yearly') {
            // Untuk tahunan, generate 5 tahun terakhir
            for (let i = 4; i >= 0; i--) {
                const year = now.getFullYear() - i;
                laporanValues.push(laporanMap[year] || 0);
                insidenValues.push(insidenMap[year] || 0);
                chartLabels.push(year.toString());
            }
        }

        // Gunakan chartLabels jika sudah di-generate, jika tidak gunakan labels dari switch
        const finalLabels = chartLabels.length > 0 ? chartLabels : labels;

        res.json({
            success: true,
            data: {
                labels: finalLabels,
                laporan: laporanValues,
                insiden: insidenValues,
                period
            }
        });

    } catch (error) {
        console.error('Error getting laporan visualization:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting laporan visualization',
            error: error.message
        });
    }
};