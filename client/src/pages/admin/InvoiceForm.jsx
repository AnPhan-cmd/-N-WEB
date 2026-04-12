import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaSearch, FaTrash, FaTimes, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';
import '../../css/admin-invoice.css'; 

const InvoiceForm = ({ isEdit = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State Thông tin hóa đơn
    const [invoiceNo, setInvoiceNo] = useState('Tự động tạo...');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('vi-VN'));
    const [customerName, setCustomerName] = useState('');
    const [customerID, setCustomerID] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);

    // State Modal & Bắt lỗi
    const [showProductModal, setShowProductModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showQtyModal, setShowQtyModal] = useState(false);
    const [tempProduct, setTempProduct] = useState(null);
    const [tempQty, setTempQty] = useState(1);
    
    const [errors, setErrors] = useState({});

    const BASE_URL = 'http://localhost:3000';
    const token = localStorage.getItem('token'); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const prodRes = await axios.get(`${BASE_URL}/api/products`, config);
                
                if (prodRes.data && Array.isArray(prodRes.data)) setProducts(prodRes.data);
                else if (prodRes.data?.products) setProducts(prodRes.data.products);

                if (isEdit && id) {
                    const invRes = await axios.get(`${BASE_URL}/api/invoices/${id}`, config);
                    const inv = invRes.data;
                    
                    setInvoiceNo(inv.invoiceNo || 'Tự động tạo...');
                    setInvoiceDate(new Date(inv.createdAt).toLocaleDateString('vi-VN'));
                    setCustomerName(inv.customerName || '');
                    setCustomerID(inv.customerID || '');
                    setPhone(inv.phone || '');
                    setEmail(inv.email || '');
                    setAddress(inv.address || '');
                    setPaymentMethod(inv.paymentMethod || 'Cash');
                    setDiscount(inv.discount || 0);
                    setNotes(inv.notes || '');

                    const loadedItems = inv.items.map(item => ({
                        productId: item.productId?._id || item.productId,
                        sku: item.productId?.sku || item._id || 'N/A',
                        name: item.name,
                        price: Number(item.price),
                        quantity: Number(item.quantity),
                        total: Number(item.price) * Number(item.quantity)
                    }));
                    setSelectedItems(loadedItems);
                }
            } catch (err) { console.error("Lỗi tải dữ liệu:", err); }
        };
        fetchData();
    }, [isEdit, id, token]);

    // Tính tổng tiền
    const subTotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
    const finalTotal = subTotal - discount;

    const handleSelectProduct = (product) => {
        setTempProduct(product);
        setTempQty(1);
        setShowQtyModal(true);
    };

    const confirmAddProduct = () => {
        const newItem = {
            productId: tempProduct._id,
            sku: tempProduct._id || 'N/A',
            name: tempProduct.name,
            price: tempProduct.price,
            quantity: Number(tempQty),
            total: tempProduct.price * tempQty
        };
        setSelectedItems([...selectedItems, newItem]);
        setShowQtyModal(false);
        setShowProductModal(false);
        setErrors(prev => ({ ...prev, items: null })); 
    };

    const removeItem = (index) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    // ================= BỘ KIỂM TRA DỮ LIỆU (VALIDATION) CỰC KỲ NGHIÊM NGẶT =================
    const validateForm = () => {
        let newErrors = {};
        
        // Bắt buộc nhập tên
        if (!customerName.trim()) {
            newErrors.customerName = 'Vui lòng nhập họ tên khách hàng!';
        }

        // Nếu có nhập số điện thoại, phải đúng định dạng VN (10 số, bắt đầu bằng 0 hoặc +84)
        if (phone && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone.replace(/\s+/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ!';
        }

        // Nếu có nhập Email, phải đúng định dạng có @
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Định dạng Email không hợp lệ!';
        }

        // Bắt buộc có sản phẩm
        if (selectedItems.length === 0) {
            newErrors.items = 'Vui lòng chọn ít nhất 1 sản phẩm vào hóa đơn!';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Báo lỗi thì tự cuộn lên cho User sửa
            return;
        }

        const invoiceData = {
            customerName, customerID, phone, email, address, paymentMethod,
            discount: Number(discount) || 0, notes,
            items: selectedItems.map(item => ({
                productId: item.productId, name: item.name,
                quantity: Number(item.quantity), price: Number(item.price), sku: item.sku 
            })),
            totalAmount: Number(finalTotal)
        };

        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            if (isEdit && id) {
                await axios.put(`${BASE_URL}/api/invoices/${id}`, invoiceData, config);
                alert("Cập nhật hóa đơn thành công!");
            } else {
                await axios.post(`${BASE_URL}/api/invoices`, invoiceData, config);
                alert("Tạo hóa đơn thành công!");
            }
            navigate('/admin/invoices');
        } catch (error) {
            const detailError = error.response?.data?.error || error.response?.data?.message || "Lỗi không xác định";
            alert("Lưu thất bại. Lỗi từ Server:\n" + detailError);
        }
    };

    return (
        <div className="inv-page-wrapper">
            <div className="inv-header-bar">
                <button className="inv-btn-back" onClick={() => navigate('/admin/invoices')}>
                    <FaArrowLeft /> Trở về
                </button>
                <h2 className="inv-page-title">{isEdit ? 'Chỉnh Sửa Hóa Đơn' : 'Tạo Hóa Đơn Bán Hàng'}</h2>
            </div>

            <div className="inv-grid-layout">
                {/* ================= CỘT TRÁI ================= */}
                <div className="inv-card">
                    <h3 className="inv-card-title">Thông tin khách hàng & Hóa đơn</h3>

                    {/* MÃ HÓA ĐƠN CỐ ĐỊNH - BỊ KHÓA KHÔNG CHO SỬA */}
                    <div className="inv-grid-2">
                        <div className="inv-input-group">
                            <label>Mã Hóa Đơn (Tự động)</label>
                            <input 
                                type="text" 
                                className="inv-input" 
                                value={invoiceNo} 
                                disabled 
                                style={{backgroundColor: '#f1f5f9', color: '#008080', fontWeight: 'bold', cursor: 'not-allowed'}} 
                            />
                        </div>
                        <div className="inv-input-group">
                            <label>Ngày lập</label>
                            <input 
                                type="text" 
                                className="inv-input" 
                                value={invoiceDate} 
                                disabled 
                                style={{backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed'}} 
                            />
                        </div>
                    </div>
                    
                    <div className="inv-input-group">
                        <label>Họ tên khách hàng <span className="inv-required">*</span></label>
                        <input 
                            type="text" 
                            className={`inv-input ${errors.customerName ? 'inv-input-error' : ''}`}
                            value={customerName} 
                            onChange={(e) => {
                                setCustomerName(e.target.value);
                                if(errors.customerName) setErrors(prev => ({...prev, customerName: null}));
                            }} 
                            placeholder="Nhập họ tên..." 
                        />
                        {errors.customerName && <span className="inv-error-text"><FaExclamationCircle/> {errors.customerName}</span>}
                    </div>

                    <div className="inv-grid-2">
                        <div className="inv-input-group">
                            <label>Mã KH (Tuỳ chọn)</label>
                            <input type="text" className="inv-input" value={customerID} onChange={(e) => setCustomerID(e.target.value)} placeholder="KH001" />
                        </div>
                        <div className="inv-input-group">
                            <label>Số điện thoại</label>
                            <input 
                                type="text" 
                                className={`inv-input ${errors.phone ? 'inv-input-error' : ''}`}
                                value={phone} 
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    if(errors.phone) setErrors(prev => ({...prev, phone: null}));
                                }} 
                                placeholder="090..." 
                            />
                            {errors.phone && <span className="inv-error-text"><FaExclamationCircle/> {errors.phone}</span>}
                        </div>
                    </div>

                    <div className="inv-input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            className={`inv-input ${errors.email ? 'inv-input-error' : ''}`}
                            value={email} 
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if(errors.email) setErrors(prev => ({...prev, email: null}));
                            }} 
                            placeholder="email@example.com" 
                        />
                        {errors.email && <span className="inv-error-text"><FaExclamationCircle/> {errors.email}</span>}
                    </div>

                    <div className="inv-input-group">
                        <label>Địa chỉ giao hàng</label>
                        <textarea className="inv-input" rows="2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Nhập địa chỉ..."></textarea>
                    </div>

                    <div className="inv-grid-2">
                        <div className="inv-input-group">
                            <label>Thanh toán</label>
                            <select className="inv-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="Cash">Tiền mặt</option>
                                <option value="Transfer">Chuyển khoản</option>
                                <option value="Credit Card">Thẻ tín dụng</option>
                            </select>
                        </div>
                        <div className="inv-input-group">
                            <label>Chiết khấu (VNĐ)</label>
                            <input type="number" className="inv-input" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className="inv-input-group">
                        <label>Ghi chú đơn hàng</label>
                        <textarea className="inv-input" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                    </div>
                </div>

                {/* ================= CỘT PHẢI ================= */}
                <div className="inv-card">
                    <div className="inv-flex-between">
                        <h3 className="inv-card-title">Sản phẩm đơn hàng <span className="inv-required">*</span></h3>
                        <button className="inv-btn-add" onClick={() => setShowProductModal(true)}>
                            <FaPlus /> Thêm sản phẩm
                        </button>
                    </div>

                    {errors.items && <div className="inv-error-box"><FaExclamationCircle/> {errors.items}</div>}

                    <div className="inv-table-wrapper">
                        <table className="inv-strict-table">
                            <thead>
                                <tr>
                                    <th width="45%">Tên sản phẩm</th>
                                    <th width="15%" className="inv-text-center">SL</th>
                                    <th width="25%" className="inv-text-right">Đơn giá</th>
                                    <th width="15%" className="inv-text-center">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.length > 0 ? (
                                    selectedItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="inv-fw-bold">{item.name}</td>
                                            <td className="inv-text-center">{item.quantity}</td>
                                            <td className="inv-text-right">{item.price.toLocaleString()}đ</td>
                                            <td className="inv-text-center">
                                                <button className="inv-btn-icon-del" onClick={() => removeItem(idx)}><FaTrash /></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="inv-empty-text">Chưa chọn sản phẩm nào</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="inv-summary-box">
                        <div className="inv-summary-row">
                            <span>Tạm tính:</span>
                            <span>{subTotal.toLocaleString()} đ</span>
                        </div>
                        <div className="inv-summary-row inv-text-red">
                            <span>Chiết khấu:</span>
                            <span>- {Number(discount).toLocaleString()} đ</span>
                        </div>
                        <div className="inv-summary-row inv-total-row">
                            <span>Tổng thanh toán:</span>
                            <span className="inv-total-price">{finalTotal.toLocaleString()} đ</span>
                        </div>
                    </div>

                    <div className="inv-form-actions">
                        <button className="inv-btn-cancel" onClick={() => navigate('/admin/invoices')}>Hủy bỏ</button>
                        <button className="inv-btn-submit" onClick={handleSubmit}>{isEdit ? 'Cập nhật hóa đơn' : 'Tạo hóa đơn'}</button>
                    </div>
                </div>
            </div>

            {/* MODAL CHỌN SẢN PHẨM */}
            {showProductModal && (
                <div className="inv-modal-overlay">
                    <div className="inv-modal-large">
                        <div className="inv-modal-header">
                            <h3>Chọn sản phẩm từ kho</h3>
                            <button className="inv-btn-close" onClick={() => setShowProductModal(false)}><FaTimes /></button>
                        </div>
                        <div className="inv-modal-search">
                            <FaSearch className="inv-search-icon"/>
                            <input type="text" placeholder="Tìm tên sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="inv-modal-body">
                            <table className="inv-strict-table">
                                <thead>
                                    <tr>
                                        <th width="15%" className="inv-text-center">Ảnh</th>
                                        <th width="60%">Tên sản phẩm</th>
                                        <th width="25%" className="inv-text-right">Giá bán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                        <tr key={p._id} onClick={() => handleSelectProduct(p)} style={{cursor: 'pointer'}}>
                                            <td className="inv-text-center">
                                                <img 
                                                    src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `${BASE_URL}${p.images[0]}`) : "https://placehold.co/50x50?text=No+Image"} 
                                                    alt="img" 
                                                    className="inv-img-mini"
                                                    onError={(e) => { 
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://placehold.co/50x50?text=No+Image"; 
                                                    }} 
                                                />
                                            </td>
                                            <td className="inv-fw-bold">{p.name}</td>
                                            <td className="inv-text-right inv-text-teal">{p.price?.toLocaleString()}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NHẬP SỐ LƯỢNG */}
            {showQtyModal && tempProduct && (
                <div className="inv-modal-overlay">
                    <div className="inv-modal-small">
                        <h4>Số lượng mua</h4>
                        <p className="inv-mb-3">{tempProduct.name}</p>
                        <input type="number" className="inv-input-qty" value={tempQty} min="1" max={tempProduct.stock || 999} onChange={(e) => setTempQty(e.target.value)} autoFocus />
                        <div className="inv-modal-actions">
                            <button className="inv-btn-cancel" onClick={() => setShowQtyModal(false)}>Hủy</button>
                            <button className="inv-btn-submit" onClick={confirmAddProduct}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceForm;