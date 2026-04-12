import User from '../models/User.js';
import Order from '../models/Order.js';
import fs from 'fs';
import path from 'path';

class UserController {
    // 1. Lấy Profile cá nhân & Lịch sử mua hàng (Dùng cho trang Profile tổng hợp)
    getProfile = async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select('-password');
            
            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

            const orderHistory = await Order.find({ userId })
                .populate({
                    path: 'items.productId',
                    select: 'name images price category' 
                })
                .sort({ createdAt: -1 });
                
            res.status(200).json({ user, orderHistory });
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy profile", error: error.message });
        }
    };

    // 2. Cập nhật Profile (Xử lý Avatar và dọn dẹp ảnh cũ)
    updateProfile = async (req, res) => {
        try {
            const userId = req.user.id;
            const { fullName, email, phoneNumber, address } = req.body;
            
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

            let updateData = { 
                fullName: fullName?.trim() || user.fullName, 
                email: email?.toLowerCase().trim() || user.email, 
                phoneNumber: phoneNumber?.trim() || user.phoneNumber, 
                address: address?.trim() || user.address 
            };

            if (req.file) {
                const oldAvatar = user.avatar;
                updateData.avatar = `/uploads/${req.file.filename}`;
                
                // Xóa ảnh cũ nếu không phải ảnh mặc định
                if (oldAvatar && oldAvatar.startsWith('/uploads/') && !oldAvatar.includes('default-avatar')) {
                    const oldFilename = path.basename(oldAvatar);
                    const oldFilePath = path.join(process.cwd(), 'uploads', oldFilename);
                    
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlink(oldFilePath, (err) => {
                            if (err) console.warn('⚠️ Không xóa được ảnh cũ:', err.message);
                        });
                    }
                }
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId, 
                { $set: updateData }, 
                { returnDocument: 'after', runValidators: true }
            ).select('-password');

            res.status(200).json({ 
                success: true, 
                message: "Cập nhật thành công!", 
                user: updatedUser 
            });
        } catch (error) {
            res.status(500).json({ message: "Lỗi cập nhật profile", error: error.message });
        }
    };

    // 3. Lấy lịch sử mua hàng riêng biệt (BỔ SUNG CHO KHỚP ROUTE)
    getPurchaseHistory = async (req, res) => {
        try {
            const userId = req.user.id;
            const history = await Order.find({ userId })
                .populate({
                    path: 'items.productId',
                    select: 'name images price'
                })
                .sort({ createdAt: -1 });
            res.status(200).json(history);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy lịch sử mua hàng" });
        }
    };

    // 4. Admin: Lấy danh sách toàn bộ User
    getAllUsers = async (req, res) => {
        try {
            const users = await User.find().select('-password').sort({ createdAt: -1 });
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
        }
    };

    // 5. Admin: Cập nhật vai trò
    updateUserRole = async (req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (id === req.user.id) {
                return res.status(400).json({ message: "Bạn không thể tự hạ quyền của chính mình" });
            }

            const user = await User.findByIdAndUpdate(
                id, 
                { role }, 
                { returnDocument: 'after' }
            ).select('-password');

            res.status(200).json({ success: true, user });
        } catch (error) {
            res.status(400).json({ message: "Lỗi cập nhật vai trò", error: error.message });
        }
    };

    // 6. Admin: Xóa User
    deleteUser = async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
            if (user.role === 'admin') return res.status(403).json({ message: "Không thể xóa Admin" });
            
            await User.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: "Đã xóa người dùng vĩnh viễn" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi xóa user", error: error.message });
        }
    };
}

export default new UserController();