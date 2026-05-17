const httpMocks = require('node-mocks-http');
const authController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mocking Dependencies
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Unit Test: Auth Controller', () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('Harus menolak registrasi jika email sudah terdaftar', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                body: {
                    nama_lengkap: 'Alya Maratun',
                    email: 'alya@example.com',
                    password: 'password123'
                }
            });
            const res = httpMocks.createResponse();

            // Simulasi user ditemukan (email duplikat)
            User.findOne.mockResolvedValue({ email: 'alya@example.com' });

            await authController.registerUser(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toBe('Email sudah terdaftar');
            expect(User.create).not.toHaveBeenCalled();
        });

        it('Harus berhasil registrasi dan mengenkripsi password', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                body: {
                    nama_lengkap: 'Alya Maratun',
                    email: 'newuser@example.com',
                    password: 'password123',
                    role: 'Agronomis'
                }
            });
            const res = httpMocks.createResponse();

            // Mocking alur registrasi
            User.findOne.mockResolvedValue(null); // Email tersedia
            bcrypt.genSalt.mockResolvedValue('salt123');
            bcrypt.hash.mockResolvedValue('hashedPassword123');
            User.create.mockResolvedValue({
                id: 1,
                nama_lengkap: 'Alya Maratun',
                email: 'newuser@example.com',
                role: 'Agronomis'
            });
            jwt.sign.mockReturnValue('mocked-jwt-token');

            await authController.registerUser(req, res);

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toHaveProperty('token', 'mocked-jwt-token');
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt123');
        });
    });

    describe('loginUser', () => {
        it('Harus gagal jika password salah', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                body: { email: 'alya@example.com', password: 'wrongpassword' }
            });
            const res = httpMocks.createResponse();

            // Mock user ditemukan tapi password tidak cocok
            const mockUser = {
                email: 'alya@example.com',
                matchPassword: jest.fn().mockResolvedValue(false)
            };
            User.findOne.mockResolvedValue(mockUser);

            await authController.loginUser(req, res);

            expect(res.statusCode).toBe(401);
            expect(res._getJSONData().message).toBe('Email atau password salah');
        });
    });
});