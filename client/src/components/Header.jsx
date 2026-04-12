import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaShoppingCart, FaUserCircle, FaChevronDown, 
  FaUserEdit, FaBoxOpen, FaSignOutAlt 
} from 'react-icons/fa';
import '../css/style.css';

const Header = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Lỗi dữ liệu User trong LocalStorage:", error);
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    window.location.reload();
  };

  // ✅ FIX: Thêm hàm xử lý đường dẫn ảnh Avatar cho Header
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    // Xử lý dấu gạch chéo ngược trên Windows
    let path = avatarPath.replace(/\\/g, '/');
    if (path.startsWith('http')) return path;
    // Gắn thêm đường dẫn Backend
    return `http://localhost:3000${path.startsWith('/') ? path : '/' + path}`;
  };

  return (
    <header className="main-header">
      <div className="header-top">
        <div className="container header-flex">
          {/* Logo */}
          <div className="logo">
            <Link to="/">
              <img src="/src/assets/images/Logo_Hamory.png" alt="Harmony Furniture" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <input type="text" placeholder="Tìm kiếm sản phẩm..." />
            <button type="submit" aria-label="Tìm kiếm"><FaSearch /></button>
          </div>

          {/* Actions: Cart & Account */}
          <div className="header-actions">
            <Link to="/cart" className="cart-btn">
              <FaShoppingCart size={20} />
              <span>Giỏ hàng</span>
            </Link>

            <div className="account-wrapper">
              <div className="account-info">
                {/* ✅ FIX: Gọi hàm getAvatarUrl và thêm sự kiện onError */}
                {user?.avatar ? (
                  <img 
                    src={getAvatarUrl(user.avatar)} 
                    alt="Avatar" 
                    className="user-avatar-img" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/40x40/046A62/FFFFFF?text=U";
                    }}
                  />
                ) : (
                  <FaUserCircle className="avatar-default" />
                )}
                
                <div className="account-text">
                  {user ? (
                    <span className="user-name">{user.fullName || user.username}</span>
                  ) : (
                    <div className="auth-links">
                      <Link to="/login">Đăng nhập</Link>
                      <span className="divider">/</span>
                      <Link to="/register">Đăng ký</Link>
                    </div>
                  )}
                  <span className="my-account-label">
                    Tài khoản của tôi <FaChevronDown size={10} />
                  </span>
                </div>
              </div>
              
              {/* Dropdown Menu */}
              <ul className="dropdown-list">
                {user ? (
                  <>
                    <li><Link to="/profile"><FaUserEdit /> Thông tin cá nhân</Link></li>
                    <li><Link to="/my-orders"><FaBoxOpen /> Đơn hàng</Link></li>
                    <li className="logout-item" onClick={handleLogout}><FaSignOutAlt /> Đăng xuất</li>
                  </>
                ) : (
                  <li><Link to="/login">Vui lòng đăng nhập</Link></li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <div className="container">
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/promotions">Khuyến mãi</Link></li>
            <li><Link to="/about-us">Về Harmony</Link></li>
            <li><Link to="/contact">Kết nối với chúng tôi</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;