import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaTimes, FaCheckCircle, FaBan, FaTruck } from 'react-icons/fa';
import '../../css/admin-invoice.css';

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false); 

    const BASE_URL = 'http://localhost:3000/api/orders';
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInvoice(res.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải thông tin hóa đơn. Có thể do lỗi mạng hoặc quyền truy cập.');
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id, token]);

    const updateStatus = async (newStatus) => {
        if (!window.confirm(`Xác nhận chuyển trạng thái đơn hàng sang: ${newStatus}?`)) return;
        
        setIsUpdating(true);
        try {
            const res = await axios.put(
                `${BASE_URL}/${id}`, 
                { status: newStatus }, // ✅ Gửi đúng chữ thường như Schema
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInvoice(res.data.order || res.data); 
            alert("Cập nhật trạng thái thành công!");
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái: " + (err.response?.data?.message || "Hệ thống bận"));
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="loading-container">Đang tải chi tiết hóa đơn...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!invoice) return <div className="error-container">Hóa đơn không tồn tại.</div>;

    const subTotal = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = subTotal - (invoice.discount || 0);

    return (
        <div className="invoice-detail-modal-overlay">
            <div className="invoice-detail-modal">
                <div className="admin-status-bar">
                    <div className="status-current">
                        Trạng thái hiện tại: <span className={`status-badge ${invoice.status?.toLowerCase()}`}>{invoice.status || 'Chờ xử lý'}</span>
                    </div>
                    <div className="action-buttons-group">
                        {/* ✅ Đã sửa tất cả các trạng thái thành chữ thường khớp với Database */}
                        <button 
                            className="btn-status approve" 
                            disabled={isUpdating || invoice.status === 'completed'}
                            onClick={() => updateStatus('completed')}
                        >
                            <FaCheckCircle /> Xác nhận thanh toán
                        </button>
                        <button 
                            className="btn-status shipping" 
                            disabled={isUpdating || invoice.status === 'shipping'}
                            onClick={() => updateStatus('shipping')}
                        >
                            <FaTruck /> Đang giao hàng
                        </button>
                        <button 
                            className="btn-status cancel" 
                            disabled={isUpdating || invoice.status === 'cancelled'}
                            onClick={() => updateStatus('cancelled')}
                        >
                            <FaBan /> Hủy đơn hàng
                        </button>
                        <button className="close-btn" onClick={() => navigate('/admin/invoices')}>
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <div className="invoice-print-area">
                    <div className="invoice-header">
                        <img src="/src/assets/images/Logo_Hamory.png" alt="Logo" className="invoice-logo-img" />
                        <div className="header-text">
                            <h1>HÓA ĐƠN GIÁ TRỊ GIA TĂNG</h1>
                            <p>Mã hóa đơn: <strong>{invoice._id?.slice(-8).toUpperCase()}</strong></p>
                            <p>Ngày lập: {new Date(invoice.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>

                    <div className="company-info">
                        <h2>CÔNG TY THIẾT KẾ NỘI THẤT HARMONY</h2>
                        <p>Địa chỉ: TP. Hồ Chí Minh - Hà Nội</p>
                        <p>Hotline: 1900 xxxx - Website: harmonyfurniture.vn</p>
                    </div>

                    <div className='content-container'>
                        <h4>I. THÔNG TIN KHÁCH HÀNG</h4>
                        <div className="info-grid">
                            <p><strong>Khách hàng:</strong> {invoice.fullName || invoice.customerName}</p>
                            <p><strong>Mã KH:</strong> {invoice.userId || 'Vãng lai'}</p>
                            <p><strong>SĐT:</strong> {invoice.phone}</p>
                            <p><strong>Email:</strong> {invoice.email}</p>
                            <p><strong>Địa chỉ:</strong> {invoice.address}</p>
                            <p><strong>PTTT:</strong> {invoice.paymentMethod || 'Chuyển khoản / Tiền mặt'}</p>
                        </div>

                        <h4>II. DANH SÁCH SẢN PHẨM</h4>
                        <table className="invoice-detail-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.price.toLocaleString()}đ</td>
                                        <td>{(item.price * item.quantity).toLocaleString()}đ</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4">Cộng tiền hàng:</td>
                                    <td>{subTotal.toLocaleString()}đ</td>
                                </tr>
                                {invoice.discount > 0 && (
                                    <tr>
                                        <td colSpan="4">Chiết khấu/Khuyến mại:</td>
                                        <td>-{invoice.discount.toLocaleString()}đ</td>
                                    </tr>
                                )}
                                <tr className="final-row">
                                    <td colSpan="4">TỔNG THÀNH TOÁN:</td>
                                    <td className="final-total">{finalTotal.toLocaleString()}đ</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="invoice-notes">
                            <p><strong>Ghi chú:</strong> {invoice.notes || 'Không có'}</p>
                        </div>

                        <div className="invoice-signatures">
                            <div className="sig">
                                <p><strong>Người mua hàng</strong></p>
                                <span>(Ký, ghi rõ họ tên)</span>
                            </div>
                            <div className="sig">
                                <p><strong>Người lập hóa đơn</strong></p>
                                <span>(Ký, ghi rõ họ tên)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button className="btn-back-main" onClick={() => navigate('/admin/invoices')}>
                    <FaArrowLeft /> Quay về danh sách
                </button>
            </div>
        </div>
    );
};

export default InvoiceDetail;