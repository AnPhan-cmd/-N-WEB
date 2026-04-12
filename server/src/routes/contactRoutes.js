import express from 'express';
import ContactController from '../controllers/ContactController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

// Chúng ta sẽ phân quyền: ai cũng có thể gửi tin nhắn, nhưng chỉ Admin mới có thể xem và xóa.

const router = express.Router();

// Route cho User
router.post('/send', ContactController.sendContact);

// Route cho Admin (Bảo vệ bởi Middleware)
router.get('/all', verifyToken, isAdmin, ContactController.getAllContacts);
router.delete('/delete/:id', verifyToken, isAdmin, ContactController.deleteContact);

export default router;