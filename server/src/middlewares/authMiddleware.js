import jwt from 'jsonwebtoken';

/**
 * Middleware: Xác thực Token người dùng
 */
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        // 1. Kiểm tra sự tồn tại của Header và định dạng Bearer
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: "Quyền truy cập bị từ chối. Vui lòng đăng nhập!" 
            });
        }

        const token = authHeader.split(' ')[1];

        // 2. Giải mã Token
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

        // 3. Lưu thông tin đã giải mã vào đối tượng req để dùng ở Controller
        // Dữ liệu bao gồm { id, role } đã sign lúc Login
        req.user = verified; 
        
        next();
    } catch (error) {
        // Phân loại lỗi JWT để trả về thông báo chính xác
        let msg = "Phiên đăng nhập không hợp lệ!";
        if (error.name === 'TokenExpiredError') {
            msg = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!";
        }
        
        return res.status(401).json({ 
            success: false, 
            message: msg 
        });
    }
};

/**
 * Middleware: Kiểm tra quyền Admin
 * Chú ý: Phải đặt sau verifyToken trong file Route
 */
export const isAdmin = (req, res, next) => {
    // req.user được tạo ra từ middleware verifyToken phía trước
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: "Truy cập bị từ chối! Bạn không có quyền quản trị viên." 
        });
    }
};