import express from 'express';
import ProductController from '../controllers/ProductController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

/**
 * LƯU Ý VỀ UPLOAD: 
 * Vì ông có nhiều ảnh mô tả (descImages), dùng upload.any() 
 * là cách duy nhất để nhận được tất cả file mà không bị lỗi Multer
 */

// --- ROUTES CÔNG KHAI (KHÁCH XEM) ---
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// --- ROUTES CHO ADMIN (CẦN TOKEN + QUYỀN ADMIN) ---

// Thêm sản phẩm mới
router.post('/add', 
    verifyToken, 
    isAdmin, 
    upload.any(), // Dùng any() để chấp nhận cả 'images' và 'descImages[i]'
    ProductController.add
);

// Cập nhật sản phẩm
router.put('/:id', 
    verifyToken, 
    isAdmin, 
    upload.any(), 
    ProductController.update
);

// Ẩn/Hiện sản phẩm (Soft Delete)
router.patch('/hide/:id', 
    verifyToken, 
    isAdmin, 
    ProductController.toggleHide
);

// Xóa vĩnh viễn sản phẩm
router.delete('/:id', 
    verifyToken, 
    isAdmin, 
    ProductController.delete
);

export default router;