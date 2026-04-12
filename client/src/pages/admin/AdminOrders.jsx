import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaListUl, FaChartPie, FaSearch, FaChevronDown, FaChevronUp, FaUserCircle, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/admin-order.css';
import RevenueTab from './RevenueTab';

const AdminOrders = () => {
    const [activeTab, setActiveTab] = useState('approve');
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
    const [expandedId, setExpandedId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingIds, setProcessingIds] = useState([]); 

    const BASE_URL = 'http://localhost:3000';

    useEffect(() => { 
        fetchOrders(); 
    }, [filterStatus]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BASE_URL}/api/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const allOrders = res.data;
            
            // Tính toán stats dựa trên dữ liệu thật từ Backend
            setStats({
                total: allOrders.length,
                pending: allOrders.filter(o => o.status === 'pending').length,
                approved: allOrders.filter(o => ['approved', 'completed', 'shipping'].includes(o.status)).length
            });

            // Lọc theo status nếu có chọn stat card
            const filtered = filterStatus ? allOrders.filter(o => o.status === filterStatus) : allOrders;
            setOrders(filtered);

        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
            toast.error("Không thể tải danh sách đơn hàng!");
        }
    };

    const handleStatus = async (id, status) => {
        const actionText = {
            'approved': 'duyệt',
            'shipping': 'giao hàng',
            'completed': 'hoàn thành',
            'rejected': 'từ chối'
        };
        
        if (!window.confirm(`Xác nhận ${actionText[status] || 'cập nhật'} đơn hàng này?`)) return;

        setProcessingIds(prev => [...prev, id]);

    try {
        const token = localStorage.getItem('token');
        
        // SỬA TẠI ĐÂY: Bỏ chữ /status và đổi .patch thành .put
        await axios.put(
            `${BASE_URL}/api/orders/${id}`, 
            { status }, 
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        toast.success(`Cập nhật trạng thái thành công!`);
        fetchOrders(); 
        
    } catch (error) {
        console.error("Lỗi cập nhật:", error);
        toast.error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    } finally {
        setProcessingIds(prev => prev.filter(pid => pid !== id));
    }
};

    const getImageUrl = (imagePath) => {
        const placeholder = "https://placehold.co/100x100/046A62/FFFFFF?text=Harmony";
        if (!imagePath) return placeholder;
        let imgString = Array.isArray(imagePath) ? imagePath[0] : imagePath;
        if (!imgString || typeof imgString !== 'string') return placeholder;
        
        imgString = imgString.replace(/\\/g, '/');
        if (imgString.startsWith('http')) return imgString;
        return `${BASE_URL}${imgString.startsWith('/') ? imgString : '/' + imgString}`;
    };

    const filteredOrders = orders.filter(o => 
        (o.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (o.orderNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o._id || '').includes(searchTerm)
    );

    return (
        <div className="orders-page-container">
            <ToastContainer position="top-right" autoClose={2000} />
            
            <div className="modern-tabs">
                <button className={`tab-btn ${activeTab === 'approve' ? 'tab-active' : ''}`} onClick={() => setActiveTab('approve')}>
                    <FaListUl className="tab-icon" /> Quản lý đơn hàng
                </button>
                <button className={`tab-btn ${activeTab === 'revenue' ? 'tab-active' : ''}`} onClick={() => setActiveTab('revenue')}>
                    <FaChartPie className="tab-icon" /> Báo cáo doanh số
                </button>
            </div>

            {activeTab === 'approve' ? (
                <div className="orders-content-area">
                    <div className="order-stats-grid">
                        <div className={`order-stat-card stat-total ${filterStatus === '' ? 'active' : ''}`} onClick={() => setFilterStatus('')}>
                            <p>Tổng đơn hàng</p>
                            <h2>{stats.total}</h2>
                        </div>
                        <div className={`order-stat-card stat-pending ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
                            <p>Chờ xử lý</p>
                            <h2>{stats.pending}</h2>
                        </div>
                        <div className={`order-stat-card stat-approved ${filterStatus === 'approved' ? 'active' : ''}`} onClick={() => setFilterStatus('approved')}>
                            <p>Đã duyệt</p>
                            <h2>{stats.approved}</h2>
                        </div>
                    </div>

                    <div className="order-toolbar">
                        <div className="search-wrapper">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Tìm theo Mã HD (Ví dụ: HD2404...) hoặc Tên khách..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="order-list-wrapper">
                        {filteredOrders.map((order, index) => (
                            <div key={order._id} className={`order-item-card ${expandedId === order._id ? 'is-expanded' : ''}`}>
                                <div className="order-header-row" onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}>
                                    <div className="order-info-basic">
                                        <span className="order-no">{order.orderNo || `#${order._id.slice(-6).toUpperCase()}`}</span>
                                        <div className="order-customer-box">
                                            <span className="order-customer-name">{order.fullName}</span>
                                            {order.userId && <span className="member-badge"><FaUserCircle/> Thành viên</span>}
                                        </div>
                                    </div>
                                    <div className="order-status-actions">
                                        <span className={`badge badge-${order.status}`}>{order.status}</span>
                                        <button className="order-toggle-btn">
                                            {expandedId === order._id ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </div>
                                </div>

                                {expandedId === order._id && (
                                    <div className="order-detail-content">
                                        <div className="detail-grid">
                                            <div className="info-section">
                                                <h4><FaTruck /> Thông tin giao hàng</h4>
                                                <p><strong>Người nhận:</strong> {order.fullName}</p>
                                                <p><strong>Điện thoại:</strong> {order.phone}</p>
                                                <p><strong>Địa chỉ:</strong> {order.address}</p>
                                                <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                            
                                            <div className="info-section bg-light">
                                                <h4>💳 Thanh toán: {order.paymentMethod}</h4>
                                                <p><strong>Tổng tiền:</strong> <span className="text-teal fw-bold">{(order.totalAmount || 0).toLocaleString()}đ</span></p>
                                                <p><strong>Trạng thái:</strong> {order.status}</p>
                                            </div>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="inner-order-table">
                                                <thead>
                                                    <tr>
                                                        <th>Ảnh</th>
                                                        <th>Sản phẩm</th>
                                                        <th className="text-center">SL</th>
                                                        <th className="text-right">Đơn giá</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td><img src={getImageUrl(item.image)} className="product-mini-img" alt="" /></td>
                                                            <td className="fw-bold">{item.name}</td>
                                                            <td className="text-center">x{item.quantity}</td>
                                                            <td className="text-right">{(item.price || 0).toLocaleString()}đ</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="order-actions-bar">
                                            {order.status === 'pending' && (
                                                <>
                                                    <button className="btn-approve" onClick={() => handleStatus(order._id, 'approved')} disabled={processingIds.includes(order._id)}>
                                                        <FaCheckCircle /> Duyệt đơn
                                                    </button>
                                                    <button className="btn-reject" onClick={() => handleStatus(order._id, 'rejected')} disabled={processingIds.includes(order._id)}>
                                                        <FaTimesCircle /> Từ chối
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'approved' && (
                                                <button className="btn-shipping" onClick={() => handleStatus(order._id, 'shipping')}>
                                                    <FaTruck /> Bắt đầu giao hàng
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <RevenueTab />
            )}
        </div>
    );
};

export default AdminOrders;