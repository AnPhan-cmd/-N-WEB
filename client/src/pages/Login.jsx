import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/auth.css';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!identifier.trim() || !password.trim()) {
            setError("Vui lòng điền đầy đủ tài khoản và mật khẩu");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const isEmail = identifier.includes('@');
            const payload = isEmail ? { email: identifier.trim(), password } : { username: identifier.trim(), password };
            const response = await axios.post('http://localhost:3000/api/auth/login', payload);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success("Đăng nhập thành công!");
            setTimeout(() => response.data.user.role === 'admin' ? navigate('/admin/dashboard') : navigate('/'), 1500);
        } catch (error) {
            setError(error.response?.data?.message || "Tài khoản hoặc mật khẩu không đúng");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ha-auth-bg">
            <div className="ha-auth-overlay"></div> {/* Lớp phủ mờ cho ảnh nền */}
            <ToastContainer position="top-center" autoClose={2000} />
            <div className="ha-auth-card">
                <Link to="/" className="ha-back-link"><FaArrowLeft /> Trở về trang chủ</Link>
                <div className="ha-auth-header">
                    <div className="ha-icon-circle"><FaUserCircle /></div>
                    <h2>ĐĂNG NHẬP</h2>
                    <p>Chào mừng bạn trở lại với Harmony</p>
                </div>

                <form className="ha-auth-form" onSubmit={handleLogin}>
                    {error && <div className="error-alert">{error}</div>}
                    
                    <div className="ha-input-group">
                        <label>Username hoặc Email</label>
                        <input type="text" placeholder="VD: harmony_user" value={identifier} onChange={e => {setIdentifier(e.target.value); setError('')}} />
                    </div>

                    <div className="ha-input-group">
                        <label>Mật khẩu</label>
                        <div className="ha-pwd-wrapper">
                            <input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu" value={password} onChange={e => {setPassword(e.target.value); setError('')}} />
                            <span className="ha-eye-icon" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="ha-btn-primary" disabled={loading}>
                        {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
                    </button>
                    
                    <div className="ha-auth-footer">
                        Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;