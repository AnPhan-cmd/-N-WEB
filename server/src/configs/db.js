import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {
    async connect() {
        const uri = process.env.MONGO_URI;
        
        if (!uri) {
            console.error('❌ Lỗi: Chưa tìm thấy MONGO_URI trong file .env');
            process.exit(1);
        }

        try {
            await mongoose.connect(uri);
            console.log('✅ Kết nối Database Nội Thất thành công!');

            // Lắng nghe sự kiện rớt mạng
            mongoose.connection.on('disconnected', () => {
                console.warn('⚠️ Đã mất kết nối với MongoDB!');
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 Đã tự động kết nối lại thành công!');
            });

        } catch (err) {
            console.error('❌ Lỗi kết nối Database:', err.message);
            process.exit(1);
        }
    }
}

export default new Database();