const httpMocks = require('node-mocks-http');
const diagnosisController = require('../controllers/diagnosisController');
const { LogDiagnosisAI, PerangkatIoT } = require('../models');

jest.mock('../models', () => ({
    PerangkatIoT: { findByPk: jest.fn() },
    LogDiagnosisAI: { create: jest.fn() }
}));

describe('Unit Test: Diagnosis Controller', () => {
    
    it('Harus menolak data jika akurasi (confidence score) di bawah 70%', async () => {
        const req = httpMocks.createRequest({
            method: 'POST',
            url: '/api/diagnosis/detect',
            body: {
                perangkat_id: 'ESP32-MAC-A001',
                hasil_diagnosis: 'Leaf Blight',
                confidence_score: 0.47, // Akurasi cuma 47%
                image_base64: 'data:image/jpeg;base64,dummydata...'
            }
        });

        const res = httpMocks.createResponse();

        PerangkatIoT.findByPk.mockResolvedValue({ id: 'ESP32-MAC-A001', nama_node: 'Blok A' });

        await diagnosisController.diagnoseLeaf(req, res);

        const responseData = res._getJSONData(); 
        
        expect(res.statusCode).toBe(200);
        expect(responseData.status).toBe('invalid');
        expect(responseData.message).toMatch(/di bawah standar akurasi/);
        
        expect(LogDiagnosisAI.create).not.toHaveBeenCalled(); 
    });

});