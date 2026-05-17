const httpMocks = require('node-mocks-http');
const sensorController = require('../controllers/sensorController');
const { PerangkatIoT, LogSensorTanah, LogTandon, Notification } = require('../models');

// 1. MOCKING: Memalsukan Database & Telegram agar test cepat & offline
jest.mock('../models', () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    return {
        PerangkatIoT: {
            findByPk: jest.fn()
        },
        LogSensorTanah: { create: jest.fn().mockResolvedValue(true) },
        LogTandon: { create: jest.fn().mockResolvedValue(true) },
        Notification: { create: jest.fn().mockResolvedValue(true) },
        VarietasAnggur: {} // Mock asosiasi
    };
});

jest.mock('../utils/telegram', () => jest.fn().mockResolvedValue(true));

describe('Unit Test: Sensor & Irrigation Logic', () => {

    afterEach(() => jest.clearAllMocks());

    it('Harus mematikan pompa jika air tandon kritis (< 10%) demi keamanan hardware', async () => {
        // Simulasi Request dari ESP32
        const req = httpMocks.createRequest({
            method: 'POST',
            body: {
                perangkat_id: 'AETERA-001',
                kelembapan_tanah: 15, // Tanah sangat kering
                ketinggian_air: 5,    // TAPI air tandon mau habis
                ph_tanah: 6.5
            }
        });
        const res = httpMocks.createResponse();

        // Simulasi data perangkat di database
        const mockPerangkat = {
            id: 'AETERA-001',
            status_pompa_air: true,
            mode_kerja: 'auto',
            Varietas_Anggur: { min_moisture: 40 },
            save: jest.fn().mockResolvedValue(true)
        };
        PerangkatIoT.findByPk.mockResolvedValue(mockPerangkat);

        await sensorController.receiveAllData(req, res);

        // PEMBUKTIAN (Assertions)
        // 1. Pompa harus berubah jadi false (MATI)
        expect(mockPerangkat.status_pompa_air).toBe(false);
        // 2. Harus ada notifikasi peringatan yang dibuat
        expect(Notification.create).toHaveBeenCalledWith(
            expect.objectContaining({ tipe: 'warning' })
        );
        // 3. Response ke ESP32 harus instruksi "MATI"
        expect(res._getJSONData().perintah_pompa).toBe("MATI");
    });

    it('Harus menyalakan pompa jika tanah kering dan air tandon cukup', async () => {
        const req = httpMocks.createRequest({
            method: 'POST',
            body: {
                perangkat_id: 'AETERA-001',
                kelembapan_tanah: 20, // Di bawah min_moisture (40)
                ketinggian_air: 80,   // Air melimpah
            }
        });
        const res = httpMocks.createResponse();

        const mockPerangkat = {
            id: 'AETERA-001',
            status_pompa_air: false,
            mode_kerja: 'auto',
            Varietas_Anggur: { min_moisture: 40 },
            save: jest.fn().mockResolvedValue(true)
        };
        PerangkatIoT.findByPk.mockResolvedValue(mockPerangkat);

        await sensorController.receiveAllData(req, res);

        // Pembuktian: Pompa harus NYALA
        expect(mockPerangkat.status_pompa_air).toBe(true);
        expect(res._getJSONData().perintah_pompa).toBe("NYALA");
    });
});