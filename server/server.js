import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config'; 

// Import cấu hình DB
import db from './src/configs/db.js'; 

// Import Routes
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import invoiceRoutes from './src/routes/invoiceRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import userRoutes from './src/routes/userRoutes.js'; 

const app = express();
const PORT = process.env.PORT || 3000; 

// Cấu hình __dirname cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- TỰ ĐỘNG TẠO THƯ MỤC UPLOADS NẾU THIẾU ---
// Đảm bảo đường dẫn tuyệt đối để không lỗi khi chạy trên các môi trường khác nhau
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- MIDDLEWARE ---
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Xử lý dữ liệu JSON gửi lên
app.use(express.urlencoded({ extended: true }));

// PHỤC VỤ FILE TĨNH (Sửa lại để Frontend gọi http://localhost:3000/uploads/ten-anh.jpg là ra)
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'public'))); 

// --- CÁC ĐƯỜNG DẪN API (ROUTES) ---
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); 

// Route mặc định check server
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: '✅ Harmony Furniture API is running!',
        time: new Date().toLocaleString()
    });
});

// Xử lý lỗi 404 cho API
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'API Endpoint không tồn tại' });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    // Log lỗi chi tiết ra console để dev dễ nhìn
    console.error('🔥 LỖI HỆ THỐNG:', err.message);
    
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi hệ thống Server!',
        // Chỉ hiện stack lỗi khi đang ở môi trường phát triển
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

// --- KHỞI CHẠY ---
const startServer = async () => {
    try {
        await db.connect();
        console.log('--------------------------------------------------');
        console.log(`✅ Database: Kết nối thành công!`);
        
        app.listen(PORT, () => {
            console.log(`🚀 Server: http://localhost:${PORT}`);
            console.log('--------------------------------------------------');
        });
    } catch (err) {
        console.error('❌ Không thể khởi động Server do lỗi DB:', err.message);
        process.exit(1);
    }
};

startServer();

// Bắt lỗi sập nguồn server chưa rõ nguyên nhân (để server không chết hẳn)
process.on('unhandledRejection', (err) => {
    console.log('🔥 Unhandled Rejection! Shutting down...');
    console.log(err.name, err.message);
});