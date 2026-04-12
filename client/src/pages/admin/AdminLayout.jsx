import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { FaUserShield, FaBars, FaTimes, FaSignOutAlt, FaUserEdit, FaHome, FaBox, FaCartPlus, FaClipboardList, FaUsersCog, FaAngleDown } from 'react-icons/fa';
import '../../css/admin.css';
import '../../css/fireworks.css';
// ✅ ĐÃ KIỂM TRA: Vui lòng kiểm tra file vật lý của bạn tên là Hamory.png hay Harmony.png và sửa cho khớp!
import Logo_Ig from '../../assets/images/Logo_Hamory.png'; 

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch (e) {
      return null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Kiểm tra đường dẫn hiện tại để tô sáng menu đang chọn
  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  return (
    <div className="admin-wrapper">
      
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          {/* Logic cũ của bạn: Chỉ hiện logo khi MỞ (isSidebarOpen=true) */}
          {isSidebarOpen && (
            <Link to="/admin/dashboard" className="sidebar-logo-link">
              <img src={Logo_Ig} alt="Harmony Logo" className="sidebar-logo-img" />
            </Link>
          )}
          <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}> 
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
            <FaHome className="nav-icon" /> 
            <span className="nav-text">Trang chủ</span>
          </Link>
          <Link to="/admin/products" className={`nav-item ${isActive('/products')}`}>
            <FaBox className="nav-icon" /> 
            <span className="nav-text">Sản phẩm</span>
          </Link>
          <Link to="/admin/orders" className={`nav-item ${isActive('/orders')}`}>
            <FaCartPlus className="nav-icon" /> 
            <span className="nav-text">Đặt hàng</span>
          </Link>
          <Link to="/admin/invoices" className={`nav-item ${isActive('/invoices')}`}>
            <FaClipboardList className="nav-icon" /> 
            <span className="nav-text">Hóa đơn</span>
          </Link>
          <Link to="/admin/users" className={`nav-item ${isActive('/users')}`}>
            <FaUsersCog className="nav-icon" /> 
            <span className="nav-text">Tài khoản</span>
          </Link>
        </nav>
      </aside>

      {/* main-container (Chứa Header và Content) */}
      <div className="admin-main-container">
        
        {/* HEADER */}
        <header className="admin-header">
          <div className="header-left">
             <h1 className="header-title">Trang Quản Trị Hệ Thống</h1>
          </div>

          <div className="header-right">
            <div className="admin-account" ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="admin-avatar-wrapper">
                <FaUserShield className="admin-avatar-icon" />
              </div>
              <div className="admin-info">
                <span className="admin-greeting">Xin chào,</span>
                <h4 className="admin-name">{admin?.fullName || admin?.username || 'Admin'}</h4>
              </div>
              <FaAngleDown className={`dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`} />
              
              {isDropdownOpen && ( 
                <ul className="admin-dropdown-menu">
                  <li onClick={() => navigate('/admin/profile')}>
                    <FaUserEdit className="dropdown-icon" /> Thông tin cá nhân
                  </li>
                  <div className="dropdown-divider"></div>
                  <li onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt className="dropdown-icon" /> Đăng xuất
                  </li>
                </ul>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT NƠI CHỨA CÁC TRANG CON */}
        <main className="admin-content">
          <div className="content-inner-wrapper">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default AdminLayout;