import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/checkout.css';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // 1. LẤY DỮ LIỆU SẢN PHẨM (Có dự phòng khi F5)
    const [products, setProducts] = useState(() => {
        const stateProducts = location.state?.products;
        if (stateProducts && stateProducts.length > 0) {
            localStorage.setItem('temp_checkout_items', JSON.stringify(stateProducts));
            return stateProducts;
        }
        const backup = localStorage.getItem('temp_checkout_items');
        try {
            return backup ? JSON.parse(backup) : [];
        } catch (e) { return []; }
    });

    const [isOrdering, setIsOrdering] = useState(false);

    // 2. LẤY THÔNG TIN USER ĐỂ FILL SẴN FORM
    const user = useMemo(() => {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : {};
        } catch (e) { return {}; }
    }, []);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: user.fullName || '',
        phone: user.phoneNumber || user.phone || '', 
        email: user.email || '',
        province: '', 
        district: '',
        addressDetail: ''
    });

    // 3. RÀO CHẮN BẢO VỆ (Redirect nếu sai điều kiện)
    useEffect(() => {
        if (!token) {
            toast.warn("Vui lòng đăng nhập để thanh toán!");
            setTimeout(() => navigate('/login'), 1500);
            return;
        }
        if (products.length === 0) {
            toast.info("Chưa có sản phẩm nào để thanh toán!");
            setTimeout(() => navigate('/cart'), 1500);
            return;
        }
        window.scrollTo(0, 0);
    }, [products, navigate, token]);

    // 4. TÍNH TOÁN TỔNG TIỀN
    const stats = useMemo(() => {
        // sub: Tổng giá gốc, final: Tổng giá sau giảm
        const finalTotal = products.reduce((acc, p) => {
            const price = Number(p.salePrice || p.price); // Ưu tiên giá đã giảm từ Cart gửi sang
            return acc + (price * Number(p.quantity || 1));
        }, 0);
        return { final: finalTotal };
    }, [products]);

    const getImageUrl = (imgData) => {
        const placeholder = "https://placehold.co/100x100/046A62/FFFFFF?text=Harmony";
        if (!imgData) return placeholder;
        let imgString = Array.isArray(imgData) ? imgData[0] : imgData;
        if (typeof imgString !== 'string') return placeholder;
        imgString = imgString.replace(/\\/g, '/');
        if (imgString.startsWith('http')) return imgString;
        return `http://localhost:3000${imgString.startsWith('/') ? imgString : '/' + imgString}`;
    };

    // 5. HÀM XÁC NHẬN ĐẶT HÀNG
    const handleOrder = async () => {
        if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.addressDetail || !shippingInfo.province) {
            toast.warn("Vui lòng nhập đầy đủ thông tin giao hàng!");
            return;
        }
        
        setIsOrdering(true);
        try {
            // Payload này bọc đúng những gì Controller Backend đang đợi
            const payload = {
                items: products.map(p => ({
                    productId: p.productId || p._id,
                    name: p.name,
                    image: Array.isArray(p.images) ? p.images[0] : (p.images || p.image || ""),
                    quantity: Number(p.quantity),
                    price: Math.round(Number(p.salePrice || p.price)) // Gửi giá cuối cùng
                })),
                fullName: shippingInfo.fullName,
                phone: shippingInfo.phone,
                email: shippingInfo.email || "customer@harmony.com",
                address: `${shippingInfo.addressDetail}, ${shippingInfo.district}, ${shippingInfo.province}`,
                totalAmount: stats.final,
                paymentMethod: 'COD'
            };

            const res = await axios.post('http://localhost:3000/api/orders/create', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success("🎉 Đơn hàng của bạn đã được tiếp nhận!");
                // Xóa các bản lưu tạm
                localStorage.removeItem('temp_checkout_items');
                localStorage.removeItem('cart'); 
                
                // Chuyển hướng về trang thành công hoặc profile sau 2s
                setTimeout(() => navigate('/profile'), 2000); 
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Lỗi khi xử lý đơn hàng!";
            toast.error(errorMsg);
        } finally { 
            setIsOrdering(false); 
        }
    };

    return (
        <div className="hc-wrapper">
            <ToastContainer position="top-center" autoClose={2500} />
            
            <header className="hc-header">
                <div className="hc-container hc-header-inner">
                    <Link to="/" className="hc-brand">
                        <img src="/src/assets/images/Logo_Hamory.png" alt="Harmony" className="hc-logo" />
                        <span className="hc-divider">|</span>
                        <span className="hc-title">THANH TOÁN</span>
                    </Link>
                </div>
            </header>

            <main className="hc-container hc-main">
                <div className="hc-left">
                    <div className="hc-card">
                        <h2 className="hc-heading">Thông tin người nhận</h2>
                        <div className="hc-row">
                            <div className="hc-form-group">
                                <label>Họ và tên *</label>
                                <input type="text" value={shippingInfo.fullName} onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})} />
                            </div>
                            <div className="hc-form-group">
                                <label>Số điện thoại *</label>
                                <input type="text" value={shippingInfo.phone} onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} />
                            </div>
                        </div>
                        <div className="hc-form-group">
                            <label>Email (Để nhận thông báo đơn hàng)</label>
                            <input type="email" value={shippingInfo.email} onChange={e => setShippingInfo({...shippingInfo, email: e.target.value})} />
                        </div>
                        <div className="hc-row">
                            <div className="hc-form-group">
                                <label>Tỉnh/Thành phố *</label>
                                <input type="text" value={shippingInfo.province} onChange={e => setShippingInfo({...shippingInfo, province: e.target.value})} />
                            </div>
                            <div className="hc-form-group">
                                <label>Quận/Huyện *</label>
                                <input type="text" value={shippingInfo.district} onChange={e => setShippingInfo({...shippingInfo, district: e.target.value})} />
                            </div>
                        </div>
                        <div className="hc-form-group">
                            <label>Địa chỉ cụ thể (Số nhà, tên đường...) *</label>
                            <textarea rows="3" value={shippingInfo.addressDetail} onChange={e => setShippingInfo({...shippingInfo, addressDetail: e.target.value})} />
                        </div>
                    </div>

                    <div className="hc-card hc-mt-4">
                        <h2 className="hc-heading">Phương thức thanh toán</h2>
                        <div className="hc-payment-option active">
                            <div className="hc-radio-circle"></div>
                            <div className="hc-payment-desc">
                                <strong>Thanh toán khi nhận hàng (COD)</strong>
                                <p>Bạn chỉ thanh toán khi đã nhận và kiểm tra hàng thành công.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hc-right">
                    <div className="hc-card hc-sticky">
                        <div className="hc-summary-header">
                            <h2>Đơn hàng của bạn</h2>
                            <Link to="/cart">Chỉnh sửa</Link>
                        </div>
                        <div className="hc-checkout-products">
                            {products.map((p, idx) => (
                                <div className="hc-mini-item" key={p.productId || p._id || idx}>
                                    <div className="hc-mini-img">
                                        <img src={getImageUrl(p.images || p.image)} alt={p.name} />
                                        <span className="hc-mini-qty">{p.quantity}</span>
                                    </div>
                                    <div className="hc-mini-info">
                                        <p className="hc-mini-name">{p.name}</p>
                                        <p className="hc-mini-price">{(Number(p.salePrice || p.price)).toLocaleString()} Đ</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="hc-bill-details">
                            <div className="hc-bill-row">
                                <span>Phí vận chuyển</span>
                                <span className="hc-free">Miễn phí</span>
                            </div>
                            <div className="hc-bill-line"></div>
                            <div className="hc-bill-row hc-grand-total">
                                <span>Tổng cộng</span>
                                <span>{stats.final.toLocaleString()} Đ</span>
                            </div>
                        </div>
                        
                        <button className="hc-btn-order" onClick={handleOrder} disabled={isOrdering}>
                            {isOrdering ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;