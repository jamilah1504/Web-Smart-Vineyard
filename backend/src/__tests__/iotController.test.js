const httpMocks = require('node-mocks-http');
const iotController = require('../controllers/sensorController');
const { PerangkatIoT, LogSensorTanah, LogTandon, Notification } = require('../models');

jest.mock('../models', () => ({
    PerangkatIoT: { findByPk: jest.fn() },
    LogSensorTanah: { create: jest.fn() },
    LogTandon: { create: jest.fn() },
    Notification: { create: jest.fn() }
}));

jest.mock('../utils/telegram', () => {
    return jest.fn().mockResolvedValue({ status: 'sent' });
});

describe('IoT Controller: receiveAllData & Safety Logic', () => {

    it('Harus mematikan pompa air secara paksa jika ketinggian air tandon < 10%', async () => {
        const req = httpMocks.createRequest({
            method: 'POST',
            body: {
                perangkat_id: 'NODE-001',
                kelembapan_tanah: 20, // Tanah kering (harusnya nyala)
                ketinggian_air: 5,     // TAPI air tandon kritis
                jenis_tandon: 'air'
            }
        });
        const res = httpMocks.createResponse();

        // Mock Perangkat & Varietas
        const mockPerangkat = {
            id: 'NODE-001',
            status_pompa_air: true,
            mode_kerja: 'auto',
            Varietas_Anggur: { min_moisture: 40 },
            save: jest.fn()
        };
        PerangkatIoT.findByPk.mockResolvedValue(mockPerangkat);

        await iotController.receiveAllData(req, res);

        // Assertions
        expect(mockPerangkat.status_pompa_air).toBe(false); // Harus dimatikan paksa
        expect(Notification.create).toHaveBeenCalledWith(
            expect.objectContaining({ pesan: expect.stringMatching(/Air Tandon Kritis/) })
        );
        expect(res._getJSONData().perintah_pompa).toBe("MATI");
    });
});