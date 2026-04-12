import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle, FaBox, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../../css/profile.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
    const [data, setData] = useState({ user: null, orderHistory: [] });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get('http://localhost:3000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data) {
                setData(res.data);
                setFormData(res.data.user || {});
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn!");
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const form = new FormData();
        
        // Chỉ gửi những trường thực sự có thay đổi hoặc có giá trị
        form.append('fullName', formData.fullName || '');
        form.append('email', formData.email || '');
        form.append('phoneNumber', formData.phoneNumber || '');
        form.append('address', formData.address || '');
        
        if (selectedFile) {
            form.append('avatar', selectedFile);
        }

        try {
            const res = await axios.put('http://localhost:3000/api/users/profile', form, {
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    'Content-Type': 'multipart/form-data' 
                }
            });
            
            if (res.data.success) {
                toast.success("Cập nhật thành công!");
                // CẬP NHẬT LẠI LOCALSTORAGE ĐỂ HEADER ĐỔI THEO
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setIsModalOpen(false);
                fetchProfile();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi cập nhật!");
        }
    };

    const getImageUrl = (imagePath, type = 'product') => {
        const placeholder = type === 'avatar' 
            ? "https://placehold.co/200x200/046A62/FFFFFF?text=User" 
            : "https://placehold.co/80x80/046A62/FFFFFF?text=Harmony";
            
        if (!imagePath) return placeholder;
        let imgString = Array.isArray(imagePath) ? imagePath[0] : imagePath;
        
        imgString = imgString.replace(/\\/g, '/');
        if (imgString.startsWith('http')) return imgString;
        
        const formattedPath = imgString.startsWith('/') ? imgString : `/${imgString}`;
        return `http://localhost:3000${formattedPath}`;
    };

    if (loading) return <div className="loading-container">Đang tải dữ liệu Harmony...</div>;

    const user = data.user || {};
    const orderHistory = data.orderHistory || [];

    return (
        <div className="profile-page">
            <ToastContainer position="top-center" autoClose={2000} />
            
            <div className="profile-header-banner">
                <h1>Tài khoản của tôi</h1>
            </div>

            <div className="profile-content-wrapper">
                {/* Cột trái: Thông tin cá nhân */}
                <div className="profile-card info-card">
                    <div className="avatar-section">
                        <div className="avatar-circle">
                            {user.avatar ? (
                                <img src={getImageUrl(user.avatar, 'avatar')} alt="Avatar" />
                            ) : (
                                <FaUserCircle size={120} color="#046A62" />
                            )}
                        </div>
                        <h3>{user.fullName}</h3>
                        <span className="role-tag">{user.role}</span>
                    </div>

                    <div className="detail-list">
                        <div className="detail-item">
                            <FaEnvelope /> <span>{user.email}</span>
                        </div>
                        <div className="detail-item">
                            <FaPhone /> <span>{user.phoneNumber || 'Chưa cập nhật số điện thoại'}</span>
                        </div>
                        <div className="detail-item">
                            <FaMapMarkerAlt /> <span>{user.address || 'Chưa cập nhật địa chỉ'}</span>
                        </div>
                    </div>
                    
                    <button className="btn-open-edit" onClick={() => setIsModalOpen(true)}>
                        Chỉnh sửa thông tin
                    </button>
                    <button className="btn-logout-alt" onClick={handleLogout}>Đăng xuất</button>
                </div>

                {/* Cột phải: Lịch sử đơn hàng */}
                <div className="profile-card history-card">
                    <h3><FaBox /> Lịch sử đơn hàng</h3>
                    {orderHistory.length > 0 ? (
                        <div className="order-list">
                            {orderHistory.map((order) => (
                                <div className="order-item-card" key={order._id}>
                                    <div className="order-info-top">
                                        <span className="order-no">{order.orderNo || `#${order._id.slice(-6).toUpperCase()}`}</span>
                                        <span className={`status-text ${order.status}`}>{order.status}</span>
                                    </div>
                                    <div className="order-details">
                                        <p>{order.items?.length} sản phẩm</p>
                                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="order-price-bottom">
                                        <span>Tổng thanh toán:</span>
                                        <span className="price-val">{order.totalAmount?.toLocaleString()} Đ</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-history">
                            <p>Bạn chưa có đơn hàng nào tại Harmony.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal chỉnh sửa */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Cập nhật hồ sơ</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Họ và Tên</label>
                                <input 
                                    type="text" 
                                    value={formData.fullName || ''} 
                                    onChange={e => setFormData({...formData, fullName: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input 
                                    type="text" 
                                    value={formData.phoneNumber || ''} 
                                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Địa chỉ</label>
                                <input 
                                    type="text" 
                                    value={formData.address || ''} 
                                    onChange={e => setFormData({...formData, address: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Ảnh đại diện mới</label>
                                <input type="file" onChange={e => setSelectedFile(e.target.files[0])} />
                            </div>
                            <div className="modal-btns">
                                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-submit-profile">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;