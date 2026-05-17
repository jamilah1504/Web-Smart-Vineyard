// backend/src/__tests__/dashboardController.test.js
const httpMocks = require('node-mocks-http');
const dashboardController = require('../controllers/dashboardController');
const { LogSensorTanah, LogTandon, LogDiagnosisAI } = require('../models');

jest.mock('../models', () => ({
    LogSensorTanah: { findOne: jest.fn(), findAll: jest.fn() },
    LogTandon: { findOne: jest.fn() },
    LogDiagnosisAI: { findOne: jest.fn() }
}));

describe('Dashboard Controller: Summary', () => {

    it('Harus memberikan nilai default 0 jika data sensor/AI tidak ditemukan', async () => {
        const req = httpMocks.createRequest({ params: { perangkat_id: 'NODE-001' } });
        const res = httpMocks.createResponse();

        // Simulasi LogSensor ada, tapi AI tidak pernah melakukan diagnosa (null)
        LogSensorTanah.findOne.mockResolvedValue({ ph_val: 6.5, n_val: 100 });
        LogTandon.findOne.mockResolvedValue(null);
        LogDiagnosisAI.findOne.mockResolvedValue(null);
        LogSensorTanah.findAll.mockResolvedValue([]);

        await dashboardController.getDashboardSummary(req, res);

        const responseData = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(responseData.data.latest.ph_val).toBe(6.5);
        expect(responseData.data.latest.diagnosis).toBe('Normal'); // Default value
        expect(responseData.data.latest.water_level).toBe(0);      // Default value
    });
});