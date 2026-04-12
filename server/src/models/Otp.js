// server/src/models/Otp.js
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 3600 // Sửa thành 3600 (tức là 1 tiếng)
    }
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;