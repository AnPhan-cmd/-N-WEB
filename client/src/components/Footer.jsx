import React from 'react';
import { FaYoutube, FaTiktok, FaFacebook, FaFacebookMessenger } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../css/style.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-columns">
          {/* Cột 1: Thương hiệu */}
          <div className="footer-col brand-info">
            <h3>NỘI THẤT HARMONY</h3>
            <p>
              Nội Thất Harmony là thương hiệu đến từ Savimex với gần 50 năm kinh nghiệm 
              trong việc sản xuất và xuất khẩu nội thất đạt chuẩn quốc tế.
            </p>
          </div>

          {/* Cột 2: Thông tin */}
          <div className="footer-col">
            <h3>THÔNG TIN</h3>
            <ul className="footer-links">
              {/* Đổi "#" thành "/" để tránh lỗi Router warning */}
              <li><Link to="/">Chính Sách Bán Hàng</Link></li>
              <li><Link to="/">Chính Sách Giao Hàng & Lắp Đặt</Link></li>
              <li><Link to="/">Chính Sách Bảo Hành & Bảo Trì</Link></li>
              <li><Link to="/">Chính Sách Đối Tác Bán Hàng</Link></li>
            </ul>
          </div>

          {/* Cột 3: Liên hệ */}
          <div className="footer-col">
            <h3>THÔNG TIN LIÊN HỆ</h3>
            <ul className="footer-contact">
              <li><strong>Trụ sở:</strong> 69/68 Đặng Thùy Trâm, P.13, Q.Bình Thạnh, TP.HCM</li>
              <li><strong>Số điện thoại:</strong> 0912 000 000 hoặc 0900 000 000</li>
              <li><strong>Email:</strong> example@gmail.com</li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />

        {/* Mạng xã hội */}
        <div className="social-icons">
          <a href="https://youtube.com" className="social-item yt" target="_blank" rel="noopener noreferrer" aria-label="Youtube"><FaYoutube /></a>
          <a href="https://tiktok.com" className="social-item tt" target="_blank" rel="noopener noreferrer" aria-label="Tiktok"><FaTiktok /></a>
          <a href="https://facebook.com" className="social-item fb" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
          <a href="https://messenger.com" className="social-item ms" target="_blank" rel="noopener noreferrer" aria-label="Messenger"><FaFacebookMessenger /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;