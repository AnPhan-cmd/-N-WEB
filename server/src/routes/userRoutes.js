import express from 'express';
import userController from '../controllers/UserController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// --- ROUTES CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP ---

// 1. Lấy thông tin cá nhân và lịch sử đơn hàng
router.get('/profile', verifyToken, userController.getProfile);

// 2. Cập nhật thông tin cá nhân (Họ tên, SĐT, Địa chỉ, Avatar)
// Middleware upload.single('avatar') xử lý file ảnh gửi lên từ trường có name là "avatar"
router.put('/profile', verifyToken, upload.single('avatar'), userController.updateProfile);

// 3. Lấy lịch sử mua hàng riêng (Nếu Frontend cần gọi API tách biệt)
router.get('/history', verifyToken, userController.getPurchaseHistory);


// --- ROUTES DÀNH RIÊNG CHO ADMIN ---

// 4. Lấy danh sách tất cả người dùng
router.get('/all', verifyToken, isAdmin, userController.getAllUsers);

// 5. Cập nhật vai trò (admin/user) của một người dùng
router.put('/role/:id', verifyToken, isAdmin, userController.updateUserRole);

// 6. Xóa người dùng vĩnh viễn
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

export default router;