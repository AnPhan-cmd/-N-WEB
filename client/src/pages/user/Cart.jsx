import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/cart.css'; 

const Cart = () => {
    const navigate = useNavigate();
    
    // Khởi tạo giỏ hàng từ LocalStorage
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            return [];
        }
    });
    
    const [selectedItems, setSelectedItems] = useState([]);

    // Tự động lưu vào LocalStorage mỗi khi giỏ hàng thay đổi
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Hàm xử lý hiển thị ảnh chuẩn với Backend
    const getImageUrl = (imgData) => {
        const placeholder = "https://placehold.co/100x100/046A62/FFFFFF?text=Harmony";
        if (!imgData) return placeholder;
        let imgString = Array.isArray(imgData) ? imgData[0] : imgData;
        if (!imgString) return placeholder;
        
        imgString = imgString.replace(/\\/g, '/'); // Fix lỗi đường dẫn Windows
        if (imgString.startsWith('http')) return imgString;
        const formattedPath = imgString.startsWith('/') ? imgString : `/${imgString}`;
        return `http://localhost:3000${formattedPath}`;
    };

    // Hàm lấy ID chuẩn (xử lý cả productId hoặc _id)
    const getItemId = (item) => item.productId || item._id;

    const handleSelect = (productId) => {
        setSelectedItems(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId) 
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length && cartItems.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => getItemId(item)));
        }
    };

    const updateQuantity = (productId, delta) => {
        setCartItems(prev => prev.map(item => {
            if (getItemId(item) === productId) {
                const newQty = item.quantity + delta;
                return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
        }));
    };

    const removeItem = (productId) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
            setCartItems(prev => prev.filter(item => getItemId(item) !== productId));
            setSelectedItems(prev => prev.filter(id => id !== productId));
        }
    };

    // Tính tổng tiền dựa trên Virtual Price (Sale Price)
    const calculateTotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(getItemId(item)))
            .reduce((total, item) => {
                // Ưu tiên dùng salePrice từ Backend hoặc tự tính lại
                const finalPrice = item.salePrice || Math.round(item.price * (1 - (item.discount || 0) / 100));
                return total + (finalPrice * item.quantity);
            }, 0);
    };

    const handleCheckout = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.info("Vui lòng đăng nhập để tiến hành thanh toán!");
            navigate('/login');
            return;
        }

        if (selectedItems.length === 0) {
            toast.warn("Vui lòng chọn ít nhất 1 sản phẩm!");
            return;
        }

        const productsToCheckout = cartItems
            .filter(item => selectedItems.includes(getItemId(item)))
            .map(item => ({
                ...item,
                productId: getItemId(item), // Đảm bảo luôn có field này cho Backend
                price: item.salePrice || Math.round(item.price * (1 - (item.discount || 0) / 100))
            }));

        // Đẩy sang trang Checkout kèm dữ liệu
        navigate('/checkout', { state: { products: productsToCheckout } });
    };

    return (
        <div className="hc-wrapper">
            <ToastContainer position="top-center" autoClose={2000} />

            <header className="hc-header">
                <div className="hc-container hc-header-inner">
                    <Link to="/" className="hc-brand">
                        <img src="/src/assets/images/Logo_Hamory.png" alt="Harmony" className="hc-logo" />
                        <span className="hc-divider">|</span>
                        <span className="hc-title">GIỎ HÀNG</span>
                    </Link>
                    <Link to="/products" className="hc-continue-shopping">
                        &#8592; Tiếp tục mua sắm
                    </Link>
                </div>
            </header>

            <main className="hc-container hc-main">
                <div className="hc-left">
                    <div className="hc-cart-card">
                        <div className="hc-cart-header">
                            <div className="hc-col-product">
                                <input 
                                    type="checkbox" 
                                    checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                                    onChange={handleSelectAll}
                                />
                                <span>Sản phẩm ({cartItems.length})</span>
                            </div>
                            <span className="hc-col-price">Đơn giá</span>
                            <span className="hc-col-qty">Số lượng</span>
                            <span className="hc-col-total">Số tiền</span>
                            <span className="hc-col-action">Thao tác</span>
                        </div>

                        <div className="hc-cart-list">
                            {cartItems.length === 0 ? (
                                <div className="hc-empty-cart">
                                    <p>Giỏ hàng của bạn đang trống.</p>
                                    <Link to="/products" className="btn-go-shop">Mua sắm ngay</Link>
                                </div>
                            ) : (
                                cartItems.map(item => {
                                    const id = getItemId(item);
                                    const finalPrice = item.salePrice || Math.round(item.price * (1 - (item.discount || 0) / 100));
                                    
                                    return (
                                        <div className="hc-cart-item" key={id}>
                                            <div className="hc-col-product">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedItems.includes(id)}
                                                    onChange={() => handleSelect(id)}
                                                />
                                                <img 
                                                    src={getImageUrl(item.image)} 
                                                    alt={item.name} 
                                                    onError={(e) => { e.target.src = "https://placehold.co/100x100/046A62/FFFFFF?text=Error"; }}
                                                />
                                                <div className="hc-item-info">
                                                    <Link to={`/product/${id}`} className="hc-item-name">{item.name}</Link>
                                                    {item.discount > 0 && <span className="hc-badge-discount">-{item.discount}%</span>}
                                                </div>
                                            </div>
                                            
                                            <div className="hc-col-price">
                                                <div className="hc-price-current">{finalPrice.toLocaleString()} Đ</div>
                                                {item.discount > 0 && <div className="hc-price-old">{item.price.toLocaleString()} Đ</div>}
                                            </div>
                                            
                                            <div className="hc-col-qty">
                                                <div className="hc-qty-control">
                                                    <button onClick={() => updateQuantity(id, -1)}>-</button>
                                                    <input type="text" value={item.quantity} readOnly />
                                                    <button onClick={() => updateQuantity(id, 1)}>+</button>
                                                </div>
                                            </div>
                                            
                                            <div className="hc-col-total hc-text-gold">
                                                {(finalPrice * item.quantity).toLocaleString()} Đ
                                            </div>
                                            
                                            <div className="hc-col-action">
                                                <button className="hc-btn-delete" onClick={() => removeItem(id)}>Xóa</button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="hc-right">
                    <div className="hc-card hc-sticky">
                        <h2 className="hc-summary-title">Tóm tắt đơn hàng</h2>
                        <div className="hc-bill">
                            <div className="hc-bill-row">
                                <span>Tạm tính ({selectedItems.length} sản phẩm):</span>
                                <span>{calculateTotal().toLocaleString()} Đ</span>
                            </div>
                            <div className="hc-bill-row">
                                <span>Phí vận chuyển:</span>
                                <span className="hc-free">Miễn phí</span>
                            </div>
                            <div className="hc-bill-line"></div>
                            <div className="hc-bill-row hc-total">
                                <span>Tổng thanh toán:</span>
                                <span>{calculateTotal().toLocaleString()} Đ</span>
                            </div>
                        </div>

                        <button 
                            className="hc-btn-submit" 
                            onClick={handleCheckout}
                            disabled={selectedItems.length === 0}
                        >
                            TIẾN HÀNH THANH TOÁN
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Cart;