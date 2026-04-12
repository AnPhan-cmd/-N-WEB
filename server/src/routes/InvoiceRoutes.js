import express from 'express';
import InvoiceController from '../controllers/InvoiceController.js';
// Chú ý: Thêm 's' vào middlewares và thêm đuôi .js
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', verifyToken, isAdmin, InvoiceController.getAllInvoices);
router.get('/:id', verifyToken, isAdmin, InvoiceController.getInvoiceById);
router.post('/', verifyToken, isAdmin, InvoiceController.createInvoice);
router.put('/:id', verifyToken, isAdmin, InvoiceController.updateInvoice);
router.delete('/:id', verifyToken, isAdmin, InvoiceController.deleteInvoice);

export default router;