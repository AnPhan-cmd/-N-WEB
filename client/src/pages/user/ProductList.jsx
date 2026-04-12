import React, { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// CSS
import '../../css/product.css';
import '../../css/style.css';

// Import ảnh Slider 
import imgSlider1 from '../../assets/images/images_slider1.png';
import imgSlider2 from '../../assets/images/images_slider2.png';
import imgSlider3 from '../../assets/images/images_slider3.png';
import imgSlider4 from '../../assets/images/images_slider4.png';
import imgSlider5 from '../../assets/images/images_slider5.png';
import imgSlider6 from '../../assets/images/images_slider6.png';
import imgSlider7 from '../../assets/images/images_slider7.png';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filter, setFilter] = useState({ category: '', priceRange: '', sort: 'featured' });
    const BASE_URL = 'http://localhost:3000'; 
    const sliderImages = [imgSlider1, imgSlider2, imgSlider3, imgSlider4, imgSlider5, imgSlider6, imgSlider7];

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/categories`);
            setCategories(res.data || []);
        } catch (err) {
            console.error("Lỗi tải danh mục:", err);
        }
    }, [BASE_URL]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { 
                ...filter, 
                page: currentPage, 
                limit: 12 
            };
            const res = await axios.get(`${BASE_URL}/api/products`, { params });
            
            if (res.data && res.data.products) {
                setProducts(res.data.products);
                setTotalPages(res.data.totalPages || 1);
            } else if (Array.isArray(res.data)) {
                setProducts(res.data);
                setTotalPages(1);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Lỗi API:", err);
            setError("Không thể kết nối với máy chủ. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    }, [filter, currentPage, BASE_URL]);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [fetchCategories, fetchProducts]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 500, behavior: 'smooth' });
        }
    };

    const getImageUrl = (imagePath) => {
        const placeholder = "https://placehold.co/300x300/008080/FFFFFF?text=Harmony";
        if (!imagePath) return placeholder;
        let imgString = Array.isArray(imagePath) ? imagePath[0] : imagePath;
        if (!imgString) return placeholder;
        imgString = imgString.replace(/\\/g, '/');
        if (imgString.startsWith('http')) return imgString;
        const formattedPath = imgString.startsWith('/') ? imgString : `/${imgString}`;
        return `${BASE_URL}${formattedPath}`;
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    className={`btn-page ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                    style={{
                        padding: '8px 14px', margin: '0 5px',
                        background: currentPage === i ? '#008080' : '#f4f6f8',
                        color: currentPage === i ? 'white' : '#333',
                        border: 'none', borderRadius: '5px',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="Contents">
            <section className="banner-slider">
                <Swiper
                    spaceBetween={0}
                    centeredSlides={true}
                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="mySwiper"
                >
                    {sliderImages.map((img, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="slider-img-wrapper">
                                <img src={img} alt={`Banner ${idx + 1}`} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            <div className="product-page">
                <div className="product-header">
                    <h1>Sản phẩm Harmony</h1>
                    <div className="sort-box">
                        <select 
                            value={filter.sort} 
                            onChange={(e) => { setFilter({ ...filter, sort: e.target.value }); setCurrentPage(1); }}
                        >
                            <option value="featured">Sản phẩm nổi bật</option>
                            <option value="price-asc">Giá: Thấp đến Cao</option>
                            <option value="price-desc">Giá: Cao đến Thấp</option>
                            <option value="newest">Mới nhất</option>
                        </select>
                    </div>
                </div>

                <div className="filter-bar">
                    <div className="filter-label">
                        <FaFilter color="#008080" /> <span>BỘ LỌC</span>
                    </div>
                    
                    <select 
                        value={filter.category} 
                        onChange={(e) => { setFilter({ ...filter, category: e.target.value }); setCurrentPage(1); }}
                    >
                        <option value="">TẤT CẢ DANH MỤC</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>

                    <select 
                        value={filter.priceRange} 
                        onChange={(e) => { setFilter({ ...filter, priceRange: e.target.value }); setCurrentPage(1); }}
                    >
                        <option value="">KHOẢNG GIÁ</option>
                        <option value="1-5">1tr - 5tr</option>
                        <option value="5-10">5tr - 10tr</option>
                        <option value="10-15">10tr - 15tr</option>
                        <option value="20-up">Trên 20tr</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading" style={{ textAlign: 'center', padding: '50px', color: '#008080', fontWeight: 'bold' }}>Đang tải sản phẩm...</div>
                ) : error ? (
                    <p className="error" style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                ) : (
                    <>
                        <div className="product-grid">
                            {products.length > 0 ? (
                                products.map(product => {
                                    // Logic tính giá Sale chuẩn E-commerce
                                    const hasDiscount = product.discount && product.discount > 0;
                                    const finalPrice = hasDiscount 
                                        ? Math.round(product.price * (1 - product.discount / 100)) 
                                        : product.price;

                                    return (
                                        <div key={product._id} className="hm-product-card" onClick={() => navigate(`/product/${product._id}`)}>
                                            <div className="hm-img-wrapper">
                                                {/* Badge phần trăm giảm giá */}
                                                {hasDiscount && (
                                                    <span className="hm-discount-badge">-{product.discount}%</span>
                                                )}
                                                <img 
                                                    src={getImageUrl(product.images)} 
                                                    alt={product.name} 
                                                    onError={(e) => { 
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://placehold.co/300x300/008080/FFFFFF?text=Harmony"; 
                                                    }}
                                                />
                                            </div>
                                            
                                            <div className="hm-product-info">
                                                <h3 className="hm-product-name" title={product.name}>{product.name}</h3>
                                                
                                                <div className="hm-price-row">
                                                    <span className="hm-final-price">{finalPrice.toLocaleString()}đ</span>
                                                    {hasDiscount && (
                                                        <span className="hm-original-price">{product.price.toLocaleString()}đ</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="hm-card-footer">
                                                <button className="hm-btn-detail" onClick={(e) => {
                                                    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra card
                                                    navigate(`/product/${product._id}`);
                                                }}>
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-product" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Không tìm thấy sản phẩm phù hợp.</p>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                                    <FaChevronLeft />
                                </button>
                                {renderPagination()}
                                <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                                    <FaChevronRight />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductList;