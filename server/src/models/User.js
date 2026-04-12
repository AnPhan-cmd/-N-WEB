import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: [true, 'Họ tên là bắt buộc'], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email là bắt buộc'], 
        unique: true, 
        lowercase: true 
    },
    username: {
        type: String, 
        required: [true, 'Tên đăng nhập là bắt buộc'], 
        unique: true
    }, 
    password: { 
        type: String, 
        required: [true, 'Mật khẩu là bắt buộc'],
        minlength: 6
    },
    avatar: { 
        type: String, 
        default: '' 
    },
    role: { 
        type: String, 
        enum: ['admin', 'user'], 
        default: 'user' 
    },
    phoneNumber: { 
        type: String, 
        default: '' 
    },
    address: { 
        type: String, 
        default: '' 
    },
    purchaseHistory: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order' 
    }]
}, { 
    timestamps: true 
});

// --- PHẦN SỬA LỖI "next is not a function" TẠI ĐÂY ---

// Logic mã hóa mật khẩu trước khi lưu
// Dùng async function và KHÔNG truyền 'next' để tránh lỗi TypeError
userSchema.pre('save', async function () {
    // Nếu mật khẩu không bị thay đổi (ví dụ khi update avatar) thì bỏ qua
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw new Error("Lỗi mã hóa mật khẩu: " + error.message);
    }
});

// Hàm so sánh mật khẩu dùng cho logic Đăng nhập (Login)
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;