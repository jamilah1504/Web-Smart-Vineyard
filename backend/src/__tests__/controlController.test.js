const httpMocks = require('node-mocks-http');
const controlController = require('../controllers/controlController');
const { PerangkatIoT } = require('../models');

jest.mock('../models', () => ({
    PerangkatIoT: {
        update: jest.fn(),
        findByPk: jest.fn()
    }
}));

describe('Unit Test: Kontrol Manual Aktuator', () => {
    
    it('Harus gagal jika ID perangkat tidak ditemukan (Status 404)', async () => {
        // 1. Persiapkan Request
        const req = httpMocks.createRequest({
            method: 'PUT',
            params: { id: 'MAC-PALSU' },
            body: {
                status_pompa_air: true,
                status_pompa_pupuk: false,
                mode_kerja: 'manual'
            }
        });
        const res = httpMocks.createResponse();

        // 2. Mocking agar Sequelize mengembalikan [0] (artinya tidak ada baris yang di-update)
        PerangkatIoT.update.mockResolvedValue([0]);

        // 3. Jalankan fungsi (Pastikan namanya updatePumpStatus sesuai controllermu)
        await controlController.updatePumpStatus(req, res);

        // 4. Assertion
        const data = res._getJSONData();
        expect(res.statusCode).toBe(404);
        expect(data.status).toBe('error');
        expect(data.message).toMatch(/Perangkat tidak ditemukan/);
    });

    it('Harus berhasil update status pompa (Status 200)', async () => {
        const req = httpMocks.createRequest({
            method: 'PUT',
            params: { id: 'ESP32-A1' },
            body: { status_pompa_air: true }
        });
        const res = httpMocks.createResponse();

        // Mocking sukses (mengembalikan [1] artinya 1 baris terupdate)
        PerangkatIoT.update.mockResolvedValue([1]);

        await controlController.updatePumpStatus(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData().status).toBe('success');
    });
});