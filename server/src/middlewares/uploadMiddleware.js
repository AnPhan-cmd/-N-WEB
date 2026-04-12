import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // CHỈNH SỬA: Chỉ trỏ trực tiếp vào thư mục 'uploads' duy nhất
    const dest = path.resolve('uploads');

    // Tự động tạo thư mục uploads nếu lỡ tay xóa mất
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Quy tắc đặt tên: Thời gian + Tên file gốc (đã xóa khoảng trắng)
    // Giúp file không bao giờ bị trùng lặp trong cùng 1 thư mục
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeName);
  }
});

export const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ được phép upload file ảnh!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});