import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './css/style.css';
import './css/cart.css';  

// Import các trang cơ bản
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetailUser from './pages/ProductDetail'; // Trang chi tiết sản phẩm cho User và admin (tùy chỉnh hiển thị theo role)

// Import Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm'; // Dùng chung cho Add và Edit, sẽ truyền prop isEdit để phân biệt
import AdminOrders from './pages/admin/AdminOrders';
import RevenueTab from './pages/admin/RevenueTab';
import AdminInvoices from './pages/admin/AdminInvoices';
import InvoiceForm from './pages/admin/InvoiceForm';
import InvoiceDetail from './pages/admin/InvoiceDetail';  
import AdminUsers from './pages/admin/AdminUsers';  
 
// Import User Pages
import Home from './pages/user/Home'; // trang chủ với slider và sản phẩm nổi bật
import ProductList from './pages/user/ProductList'; // trang danh sách sản phẩm
import Cart from './pages/user/Cart'; 
import Checkout from './pages/user/Checkout';
import AboutUs from './pages/user/AboutUs';
import Profile from './pages/user/Profile'; // trang thông tin cá nhân
import MyOrders from './pages/user/MyOrders'; // trang lịch sử đơn hàng
import Contact from './pages/user/Contact'; // ✅ MỚI THÊM: Import trang Liên hệ

function GuestLayout() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Layout cho trang Auth (Login/Register)
function AuthLayout() {
  return (
    <div className="auth-container" >
      <Outlet />
    </div>
  );
}

// Component bảo vệ Route Admin
const ProtectedAdminRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  if (!token || user?.role !== 'admin') {
    alert("Bạn không có quyền truy cập trang quản trị!");
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// Tạo một Layout riêng chỉ có Footer
function OnlyFooterLayout() {
  return (
    <div className="app-container no-header-layout">
      <main className="main-content no-header-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* NHÓM 1: Các trang của khách hàng (GuestLayout) */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/about-us" element={<AboutUs />} /> {/* Thêm route cho trang Giới thiệu */}
          <Route path="/profile" element={<Profile />} /> {/* Thêm route cho trang Thông tin cá nhân */}
          <Route path="/contact" element={<Contact />} /> {/* ✅ MỚI THÊM: Route trang Liên hệ */}
          
          {/* MỚI: Trang chi tiết sản phẩm cho User */}
          <Route path="/product-detail/:id" element={<ProductDetailUser role="user" />} />
          <Route path="/product/:id" element={<ProductDetailUser />} />
        </Route>

        {/* NHÓM MỚI: Chỉ hiển thị Footer cho trang Giỏ hàng */}
        <Route element={<OnlyFooterLayout />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} /> 
          <Route path="/my-orders" element={<MyOrders />} /> {/* Thêm route cho trang Lịch sử đơn hàng */}
        </Route>

        {/* NHÓM 2: Các trang đăng nhập/đăng ký */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* NHÓM 3: Các trang quản trị (AdminLayout + Protected) */}
        <Route path="/admin" element={<ProtectedAdminRoute />}> 
          <Route element={<AdminLayout />}> 
            <Route index element={<AdminHome />} />
            <Route path="dashboard" element={<AdminHome />} />
            
            {/* QUẢN LÝ SẢN PHẨM */}
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<ProductForm isEdit={false} />} />
            <Route path="products/edit/:id" element={<ProductForm isEdit={true} />} />
            <Route path="products/revenue" element={<RevenueTab />} />
            

            {/* THÊM ROUTE NÀY CHO CHI TIẾT SẢN PHẨM ADMIN */}
            <Route path="products/:id" element={<ProductDetailUser role="admin" />} />

            {/* CÁC QUẢN LÝ KHÁC */}
            <Route path="orders" element={<AdminOrders />} />
            <Route path="invoices" element={<AdminInvoices/>} /> 
            <Route path="invoices/add" element={<InvoiceForm isEdit={false} />} />   
            <Route path="invoices/edit/:id" element={<InvoiceForm isEdit={true} />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>

        {/* Chuyển hướng các đường dẫn không tồn tại về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;