// Thiết lập API routes cho danh mục sản phẩm. 
import express from 'express';
import CategoryController from '../controllers/CategoryController.js';

const router = express.Router();

// Các đường dẫn cho Admin quản lý 
router.post('/add', CategoryController.create);        // Admin thêm mới
router.get('/', CategoryController.getAll);           // Xem danh sách
router.put('/update/:id', CategoryController.update); // Admin sửa
router.delete('/delete/:id', CategoryController.delete); // Admin xóa

export default router;