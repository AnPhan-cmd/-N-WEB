import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaBoxOpen } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/my-orders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const res = await axios.get('http://localhost:3000/api/orders/my-orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmReceived = async (orderId) => {
        if (!window.confirm("Bạn xác nhận đã nhận được hàng và hàng còn nguyên vẹn?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/orders/received/${orderId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Xác nhận nhận hàng thành công!");
            fetchOrders(); 
        } catch (error) {
            toast.error("Lỗi xác nhận. Vui lòng thử lại.");
        }
    };

    const getImageUrl = (imgData) => {
        const placeholder = "https://placehold.co/100x100/008080/FFFFFF?text=Harmony";
        if (!imgData) return placeholder;
        let imgString = Array.isArray(imgData) ? imgData[0] : imgData;
        if (!imgString || typeof imgString !== 'string') return placeholder;
        imgString = imgString.replace(/\\/g, '/'); 
        if (imgString.startsWith('http')) return imgString;
        return `http://localhost:3000${imgString.startsWith('/') ? imgString : '/' + imgString}`;
    };

    const filteredOrders = orders.filter(order => 
        order.items.some(item => {
            const name = item.productId?.name || item.name || "";
            return name.toLowerCase().includes(searchTerm.toLowerCase());
        })
    );

    const renderStatus = (status) => {
        switch (status) {
            case 'Pending': return <span className="mo-badge status-pending">Chờ xác nhận</span>;
            case 'Approved': return <span className="mo-badge status-approved">Đang giao hàng</span>;
            case 'Delivered': return <span className="mo-badge status-delivered">Đã giao hàng</span>;
            case 'Cancelled': return <span className="mo-badge status-cancelled">Đã hủy</span>;
            default: return <span className="mo-badge status-pending">{status}</span>;
        }
    };

    return (
        <div className="mo-wrapper">
            <ToastContainer position="top-center" autoClose={2000} />
            
            <header className="mo-header-full">
                <div className="mo-container mo-header-inner">
                    <Link to="/" className="mo-brand">
                        <img src="/src/assets/images/Logo_Hamory.png" alt="Logo Harmony" className="mo-logo" />
                        <span className="mo-divider">|</span>
                        <span className="mo-title">ĐƠN HÀNG CỦA TÔI</span>
                    </Link>
                    
                    <div className="mo-search-box">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên sản phẩm..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                        <button type="button"><FaSearch /></button>
                    </div>
                </div>
            </header>

            <main className="mo-container mo-main-content">
                {isLoading ? (
                    <div className="mo-loading">Đang tải danh sách đơn hàng...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="mo-empty-state">
                        <FaBoxOpen className="mo-empty-icon" />
                        <h3>Không tìm thấy đơn hàng</h3>
                        <p>{searchTerm ? 'Không có đơn hàng nào chứa sản phẩm bạn tìm kiếm.' : 'Bạn chưa có đơn hàng nào tại Harmony.'}</p>
                        <Link to="/products" className="mo-btn-shop">Tiếp tục mua sắm</Link>
                    </div>
                ) : (
                    <div className="mo-list">
                        {filteredOrders.map(order => (
                            <div key={order._id} className="mo-card">
                                <div className="mo-card-header">
                                    <div className="mo-order-meta">
                                        <span className="mo-meta-label">Mã Đơn:</span>
                                        <span className="mo-meta-value">#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className="mo-meta-dot">•</span>
                                        <span className="mo-meta-label">Ngày đặt:</span>
                                        <span className="mo-meta-value">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="mo-order-status">
                                        {renderStatus(order.status)}
                                    </div>
                                </div>

                                <div className="mo-card-body">
                                    {order.items.map((item, idx) => {
                                        const prodName = item.productId?.name || item.name || "Sản phẩm không xác định";
                                        const prodCat = item.productId?.category || item.category || "Nội thất";
                                        const prodImg = item.productId?.images || item.productId?.image || item.image || item.images;

                                        return (
                                            <div className="mo-product-row" key={idx}>
                                                <div className="mo-product-main">
                                                    <div className="mo-img-wrapper">
                                                        <img src={getImageUrl(prodImg)} alt={prodName} />
                                                        <span className="mo-qty-badge">x{item.quantity}</span>
                                                    </div>
                                                    <div className="mo-product-details">
                                                        <h4>{prodName}</h4>
                                                        <p>Phân loại: {prodCat}</p>
                                                    </div>
                                                </div>
                                                <div className="mo-product-price">
                                                    {(item.price || 0).toLocaleString()} Đ
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mo-card-footer">
                                    <div className="mo-total-section">
                                        <span>Thành tiền:</span>
                                        <span className="mo-total-price">{(order.totalAmount || 0).toLocaleString()} Đ</span>
                                    </div>
                                    <div className="mo-action-section">
                                        {order.status === 'Approved' && (
                                            <button className="mo-btn-primary" onClick={() => handleConfirmReceived(order._id)}>
                                                Đã nhận được hàng
                                            </button>
                                        )}
                                        {/* Đã gỡ bỏ hoàn toàn nút Mua Lại theo yêu cầu */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyOrders;