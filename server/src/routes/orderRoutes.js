import express from 'express';
import OrderController from '../controllers/OrderController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- NHÓM ROUTE CHO NGƯỜI DÙNG ---
router.post('/create', verifyToken, OrderController.createOrder);
router.get('/my-orders', verifyToken, OrderController.getUserOrders);
router.patch('/received/:orderId', verifyToken, OrderController.markAsReceived);

// --- NHÓM ROUTE CHO ADMIN ---
router.get('/', verifyToken, isAdmin, OrderController.getAllOrders); 
router.get('/revenue-stats', verifyToken, isAdmin, OrderController.getRevenueStats);
router.put('/:id', verifyToken, isAdmin, OrderController.updateStatus);  // ✅ Đổi patch→put, bỏ /status/
router.delete('/:id', verifyToken, isAdmin, OrderController.deleteOrder);

export default router;