import express from 'express';
import { sendOtp, register, login } from '../controllers/AuthController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/register', register);
router.post('/login', login); // Thêm dòng này để fix lỗi Endpoint

export default router;