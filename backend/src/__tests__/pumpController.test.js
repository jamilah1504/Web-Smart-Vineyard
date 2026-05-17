const httpMocks = require('node-mocks-http');
const pumpController = require('../controllers/controlController');
const { PerangkatIoT } = require('../models');

jest.mock('../models', () => ({
    PerangkatIoT: { update: jest.fn() }
}));

describe('Pump Controller: updatePumpStatus', () => {

    it('Harus mengembalikan error 404 jika MAC Address tidak terdaftar saat update', async () => {
        const req = httpMocks.createRequest({
            method: 'PUT',
            params: { id: 'WRONG-MAC' },
            body: { status_pompa_air: true, mode_kerja: 'manual' }
        });
        const res = httpMocks.createResponse();

        PerangkatIoT.update.mockResolvedValue([0]);

        await pumpController.updatePumpStatus(req, res);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData().message).toBe('Perangkat tidak ditemukan');
    });
});