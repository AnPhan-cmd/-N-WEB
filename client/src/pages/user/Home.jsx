import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

// Import ảnh Slider 
import imgSlider1 from '../../assets/images/images_slider1.png';
import imgSlider2 from '../../assets/images/images_slider2.png';
import imgSlider3 from '../../assets/images/images_slider3.png';
import imgSlider4 from '../../assets/images/images_slider4.png';
import imgSlider5 from '../../assets/images/images_slider5.png';
import imgSlider6 from '../../assets/images/images_slider6.png';
import imgSlider7 from '../../assets/images/images_slider7.png';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../../css/style.css';
import '../../css/product.css'; // Đảm bảo đã import file CSS chứa class hm-product-card

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const sliderImages = [imgSlider1, imgSlider2, imgSlider3, imgSlider4, imgSlider5, imgSlider6, imgSlider7];

  // Hàm xử lý ảnh chuyên dụng (fix lỗi gạch chéo ngược Windows)
  const getImageUrl = (imagePath) => {
    const placeholder = "https://placehold.co/300x300/008080/FFFFFF?text=Harmony";
    if (!imagePath) return placeholder;
    let imgString = Array.isArray(imagePath) ? imagePath[0] : imagePath;
    if (!imgString) return placeholder;
    imgString = imgString.replace(/\\/g, '/');
    if (imgString.startsWith('http')) return imgString;
    const formattedPath = imgString.startsWith('/') ? imgString : `/${imgString}`;
    return `http://localhost:3000${formattedPath}`;
  };

  // --- FETCH DỮ LIỆU THẬT ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/products');
        
        const productList = res.data.products || [];  
        
        // Trộn ngẫu nhiên và lấy 16 sản phẩm để làm sản phẩm nổi bật
        const shuffled = [...productList].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 16);
        
        setProducts(selected);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu sản phẩm:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '50px', color: '#008080', fontWeight: 'bold'}}>Đang tải sản phẩm...</div>;

  return (
    <div className="home-container">
      {/* 1. Swiper Banner */}
      <section className="banner-slider">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
        >
          {sliderImages.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="slider-img-wrapper">
                <img src={img} alt={`Banner ${idx + 1}`} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      
      {/* 2. Danh sách sản phẩm (Đồng bộ Giao diện Card Mới) */}
      <section className="product-section" style={{ padding: '60px 0' }}>
        <div className="container">
          <h1 style={{fontSize: "32px", color: "#333", textAlign: "center", marginBottom: "40px", fontWeight: "700"}}>Các sản phẩm nổi bật</h1>
          
          <div className="product-grid">
            {products.map((product) => {
              // Logic tính giá Sale chuẩn
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
                            e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                            navigate(`/product/${product._id}`);
                        }}>
                            Xem chi tiết
                        </button>
                    </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;