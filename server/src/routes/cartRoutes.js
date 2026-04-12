import express from 'express';
import cartController from '../controllers/CartController.js'; 
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Sử dụng trực tiếp hàm từ instance đã export default new CartController()
router.get('/', verifyToken, cartController.getCart);
router.post('/add', verifyToken, cartController.addToCart);
router.put('/update', verifyToken, cartController.updateCartItem);
router.delete('/remove/:productId', verifyToken, cartController.removeFromCart);

export default router;