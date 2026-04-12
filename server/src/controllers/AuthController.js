import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { sendOTP } from '../services/mailService.js';
import jwt from 'jsonwebtoken';

// 1. GỬI MÃ OTP (Giữ nguyên - Đã chuẩn)
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Vui lòng cung cấp email!" });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email này đã được đăng ký rồi!" });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: new Date() },
            { upsert: true, new: true }
        );

        const mailResult = await sendOTP(email, otpCode);
        if (mailResult.success) {
            return res.status(200).json({ success: true, message: `Mã OTP đã gửi đến ${email}` });
        } else {
            return res.status(500).json({ message: "Lỗi gửi mail!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};

// 2. ĐĂNG KÝ (ĐÃ BỎ HASH PASSWORD THỪA)
export const register = async (req, res) => {
    try {
        const { fullName, username, email, password, otp } = req.body;

        if (!fullName || !username || !email || !password || !otp) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        const otpList = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);
        const otpData = otpList[0];

        if (!otpData) return res.status(400).json({ message: "Chưa có OTP hoặc đã hết hạn!" });

        const isExpired = Date.now() - new Date(otpData.createdAt).getTime() > 5 * 60 * 1000;
        if (isExpired) return res.status(400).json({ message: "OTP đã hết hạn!" });

        if (String(otpData.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({ message: "OTP không đúng!" });
        }

        // Kiểm tra trùng lặp
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ message: "Email hoặc Username đã tồn tại!" });

        // TẠO USER (Không cần hash ở đây, User.js sẽ tự hash khi save)
        const newUser = new User({
            fullName,
            username,
            email,
            password, // Truyền password thô vào đây
            role: 'user'
        });

        await newUser.save();
        await Otp.deleteOne({ email });

        return res.status(201).json({ success: true, message: "Đăng ký thành công!" });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};

// 3. ĐĂNG NHẬP (Đã chuẩn)
export const login = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const identifier = email || username;

        if (!identifier || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại" });

        // Sử dụng hàm comparePassword từ User.js
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không chính xác" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server nội bộ" });
    }
};