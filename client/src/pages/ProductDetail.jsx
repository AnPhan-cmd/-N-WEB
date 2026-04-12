import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/product-detail.css'; 

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/products/${id}`);
                setProduct(res.data.product || res.data);
            } catch (error) {
                toast.error("Không thể tải thông tin sản phẩm!");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0); 
    }, [id]);

    // XỬ LÝ ẢNH CHỐNG LỖI TUYỆT ĐỐI
    const getImageUrl = (imgData) => {
        const placeholder = "https://placehold.co/600x400/046A62/FFFFFF?text=Harmony+Furniture";
        if (!imgData) return placeholder;
        
        // Nếu là mảng, lấy ảnh đầu tiên
        let imgString = Array.isArray(imgData) ? imgData[0] : imgData;
        if (!imgString) return placeholder;
        
        // Nếu đã có sẵn link http thì giữ nguyên
        if (imgString.startsWith('http')) return imgString;
        
        // Gắn domain backend
        const formattedPath = imgString.startsWith('/') ? imgString : `/${imgString}`;
        return `http://localhost:3000${formattedPath}`;
    };

    const handleAddToCart = () => {
        if (!product) return;

        let currentCart = [];
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) currentCart = JSON.parse(savedCart);
        } catch (error) {
            currentCart = [];
        }

        const itemToAdd = {
            productId: product._id || product.id,
            name: product.name,
            price: product.price,
            discount: product.discount || 0,
            image: product.images || product.image, // Đẩy nguyên gốc data ảnh vào
            quantity: quantity
        };

        const existingItemIndex = currentCart.findIndex(
            item => (item.productId || item._id) === itemToAdd.productId
        );

        if (existingItemIndex !== -1) {
            currentCart[existingItemIndex].quantity += itemToAdd.quantity;
        } else {
            currentCart.push(itemToAdd);
        }

        localStorage.setItem('cart', JSON.stringify(currentCart));
        toast.success("Đã thêm vào giỏ hàng thành công!");
    };

    const handleBuyNow = () => {
        handleAddToCart();
        setTimeout(() => navigate('/cart'), 1000);
    };

    if (isLoading) return <div className="hp-loading">Đang tải thông tin sản phẩm...</div>;
    if (!product) return <div className="hp-loading">Không tìm thấy sản phẩm!</div>;

    const finalPrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

    return (
        <div className="hp-wrapper">
            <ToastContainer position="top-center" autoClose={2000} />
            
            <div className="hp-container">
                <div className="hp-breadcrumb">
                    <span onClick={() => navigate('/')}>Trang chủ</span>
                    <span className="hp-arrow">/</span>
                    <span onClick={() => navigate('/products')}>Sản phẩm</span>
                    <span className="hp-arrow">/</span>
                    <span className="hp-active">{product.name}</span>
                </div>

                <div className="hp-detail-grid">
                    <div className="hp-image-col">
                        <div className="hp-image-main">
                            {product.discount > 0 && (
                                <span className="hp-discount-badge">-{product.discount}%</span>
                            )}
                            <img 
                                src={getImageUrl(product.images || product.image)} 
                                alt={product.name} 
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/600x400/046A62/FFFFFF?text=Image+Error";
                                }}
                            />
                        </div>
                    </div>

                    <div className="hp-info-col">
                        <h1 className="hp-title">{product.name}</h1>
                        <div className="hp-divider"></div>
                        <div className="hp-price-box">
                            <span className="hp-price-final">{finalPrice.toLocaleString()} Đ</span>
                            {product.discount > 0 && (
                                <span className="hp-price-original">{product.price.toLocaleString()} Đ</span>
                            )}
                        </div>

                        <div className="hp-description">
                            <p>{product.description || "Sản phẩm nội thất cao cấp mang thương hiệu Harmony. Thiết kế tinh tế, chất liệu bền bỉ, phù hợp với mọi không gian sống hiện đại."}</p>
                        </div>

                        <div className="hp-qty-box">
                            <label>Số lượng:</label>
                            <div className="hp-qty-control">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                <input type="text" value={quantity} readOnly />
                                <button onClick={() => setQuantity(q => q + 1)}>+</button>
                            </div>
                        </div>

                        <div className="hp-action-buttons">
                            <button className="hp-btn-add-cart" onClick={handleAddToCart}>
                                <i className="fas fa-cart-plus"></i> THÊM VÀO GIỎ HÀNG
                            </button>
                            <button className="hp-btn-buy-now" onClick={handleBuyNow}>
                                MUA NGAY
                            </button>
                        </div>

                        <div className="hp-trust-box">
                            <div className="hp-trust-item">
                                <i className="fas fa-truck"></i>
                                <span>Giao hàng toàn quốc</span>
                            </div>
                            <div className="hp-trust-item">
                                <i className="fas fa-shield-alt"></i>
                                <span>Bảo hành 12 tháng</span>
                            </div>
                            <div className="hp-trust-item">
                                <i className="fas fa-sync"></i>
                                <span>Đổi trả trong 7 ngày</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;