const express = require('express');
const router = express.Router();
const varietasController = require('../controllers/varietasController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Semua route butuh login
router.use(protect);

router.get('/', varietasController.getAllVarietas);
// Hanya Owner dan Agronomis yang bisa tambah/edit/hapus varietas
router.post('/', authorize('Owner', 'Agronomis'), varietasController.createVarietas);
router.put('/:id', authorize('Owner', 'Agronomis'), varietasController.updateVarietas);
router.delete('/:id', authorize('Owner', 'Agronomis'), varietasController.deleteVarietas);

module.exports = router;