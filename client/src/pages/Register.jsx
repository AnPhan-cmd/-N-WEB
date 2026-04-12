import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaArrowLeft, FaEnvelopeOpenText } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    // State quản lý OTP
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    
    const [errors, setErrors] = useState({});
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
        if (!formData.username.trim()) newErrors.username = "Vui lòng nhập username";
        if (!formData.email.trim()) {
            newErrors.email = "Vui lòng nhập email";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không đúng định dạng";
        }
        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
        }
        if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }
        if (!confirmed) newErrors.confirmed = "Bạn cần xác nhận thông tin";
        if (isOtpSent && !otp) newErrors.otp = "Vui lòng nhập mã OTP";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // HÀM 1: GỬI OTP
    const handleSendOtp = async () => {
        if (!formData.email || errors.email) {
            toast.error("Vui lòng nhập email hợp lệ trước khi nhận mã!");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/api/auth/send-otp', { 
                email: formData.email 
            });
            if (res.data.success || res.status === 200) {
                toast.success("Mã OTP đã được gửi vào Email của bạn!");
                setIsOtpSent(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Không thể gửi mã OTP. Thử lại sau!");
        } finally {
            setLoading(false);
        }
    };

    // HÀM 2: ĐĂNG KÝ CHÍNH THỨC
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        if (!isOtpSent) {
            toast.warning("Vui lòng nhấn 'Gửi mã' và kiểm tra email trước!");
            return;
        }

        setLoading(true);
        try {
            // Gom tất cả thông tin + mã OTP để gửi lên Backend
            const finalData = { 
                fullName: formData.fullName,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                otp: otp 
            };

            const response = await axios.post('http://localhost:3000/api/auth/register', finalData);
            
            if (response.status === 201 || response.data.success) {
                toast.success("Đăng ký tài khoản thành công!");
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi đăng ký! Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ha-auth-bg">
            <div className="ha-auth-overlay"></div>
            <ToastContainer position="top-center" autoClose={2000} />
            <div className="ha-auth-card">
                <Link to="/" className="ha-back-link"><FaArrowLeft /> Trở về</Link>
                <div className="ha-auth-header">
                    <div className="ha-icon-circle"><FaUserCircle /></div>
                    <h2>ĐĂNG KÝ</h2>
                </div>

                <form className="ha-auth-form" onSubmit={handleRegister}>
                    {/* Họ tên */}
                    <div className={`ha-input-group ${errors.fullName ? 'has-error' : ''}`}>
                        <label>Họ & tên</label>
                        <input type="text" name="fullName" placeholder="Nhập họ và tên" value={formData.fullName} onChange={handleChange} />
                        {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                    </div>

                    {/* Username */}
                    <div className={`ha-input-group ${errors.username ? 'has-error' : ''}`}>
                        <label>Username</label>
                        <input type="text" name="username" placeholder="Nhập username" value={formData.username} onChange={handleChange} />
                        {errors.username && <span className="error-msg">{errors.username}</span>}
                    </div>

                    {/* Email + Nút gửi OTP */}
                    <div className={`ha-input-group ${errors.email ? 'has-error' : ''}`}>
                        <label>Email</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Nhập email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                disabled={isOtpSent} // Khóa email sau khi đã gửi mã để tránh đổi email khác
                            />
                            {!isOtpSent && (
                                <button 
                                    type="button" 
                                    onClick={handleSendOtp} 
                                    className="ha-btn-otp"
                                    disabled={loading}
                                >
                                    {loading ? "..." : "Gửi mã"}
                                </button>
                            )}
                        </div>
                        {errors.email && <span className="error-msg">{errors.email}</span>}
                    </div>

                    {/* Ô NHẬP OTP (Chỉ hiện sau khi đã nhấn gửi mã) */}
                    {isOtpSent && (
                        <div className={`ha-input-group ${errors.otp ? 'has-error' : ''}`} style={{background: '#fff9f0', padding: '10px', borderRadius: '8px', border: '1px dashed #ffa940'}}>
                            <label style={{color: '#d46b08'}}><FaEnvelopeOpenText /> Nhập mã OTP từ Email</label>
                            <input 
                                type="text" 
                                placeholder="Nhập 6 số" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength="6"
                                style={{textAlign: 'center', fontSize: '20px', letterSpacing: '5px', fontWeight: 'bold'}}
                            />
                            {errors.otp && <span className="error-msg">{errors.otp}</span>}
                            <button type="button" onClick={() => setIsOtpSent(false)} style={{fontSize: '12px', background: 'none', border: 'none', color: '#1890ff', cursor: 'pointer', marginTop: '5px'}}>Gửi lại mã khác?</button>
                        </div>
                    )}

                    {/* Password */}
                    <div className={`ha-input-group ${errors.password ? 'has-error' : ''}`}>
                        <label>Mật khẩu</label>
                        <input type="password" name="password" placeholder="Nhập mật khẩu" value={formData.password} onChange={handleChange} />
                        {errors.password && <span className="error-msg">{errors.password}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div className={`ha-input-group ${errors.confirmPassword ? 'has-error' : ''}`}>
                        <label>Nhập lại mật khẩu</label>
                        <input type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} />
                        {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                    </div>

                    {/* Checkbox xác nhận */}
                    <div className="ha-checkbox-wrapper">
                        <label className="ha-checkbox-label">
                            <input type="checkbox" checked={confirmed} onChange={e => {setConfirmed(e.target.checked); setErrors({...errors, confirmed: ''})}} />
                            <span>Tôi xác nhận thông tin chính xác</span>
                        </label>
                        {errors.confirmed && <span className="error-msg">{errors.confirmed}</span>}
                    </div>

                    {/* Nút Đăng ký */}
                    <button type="submit" className="ha-btn-primary" disabled={loading || !isOtpSent}>
                        {loading ? "ĐANG XỬ LÝ..." : "HOÀN TẤT ĐĂNG KÝ"}
                    </button>
                    
                    <div className="ha-auth-footer">
                        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;