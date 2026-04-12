import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaBoxOpen, FaUsers, FaMoneyBillWave, FaArrowRight } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import '../../css/admin-home.css';

// Đăng ký thư viện biểu đồ
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const AdminHome = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    monthlyRevenue: [0, 0, 0, 0, 0, 0], 
    orderStatusCount: [0, 0, 0, 0] 
  });

  const admin = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } 
    catch (e) { return null; }
  }, []);

  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Gọi đồng thời các API lấy dữ liệu thực tế
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/orders`, config).catch(() => ({ data: [] })),
        axios.get(`${BASE_URL}/api/products`, config).catch(() => ({ data: { products: [] } })),
        axios.get(`${BASE_URL}/api/users`, config).catch(() => ({ data: [] }))
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data.products || productsRes.data || [];
      const users = usersRes.data || [];

      // Tính toán thống kê
      let revenue = 0;
      let statusCounts = { pending: 0, approved: 0, shipping: 0, completed: 0 };
      
      orders.forEach(order => {
        if (order.status === 'completed' || order.status === 'approved') {
          revenue += (order.totalAmount || 0);
        }
        if (order.status === 'pending') statusCounts.pending++;
        else if (order.status === 'approved') statusCounts.approved++;
        else if (order.status === 'shipping') statusCounts.shipping++;
        else if (order.status === 'completed') statusCounts.completed++;
      });

      const currentMonth = new Date().getMonth();
      const monthlyRev = [0, 0, 0, 0, 0, 0];
      
      orders.forEach(order => {
        if (order.status === 'completed' || order.status === 'approved') {
          const orderDate = new Date(order.createdAt);
          const monthDiff = currentMonth - orderDate.getMonth();
          if (monthDiff >= 0 && monthDiff < 6 && orderDate.getFullYear() === new Date().getFullYear()) {
             monthlyRev[5 - monthDiff] += (order.totalAmount || 0);
          }
        }
      });

      setDashboardData({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        totalRevenue: revenue,
        recentOrders: orders.slice(0, 5), 
        monthlyRevenue: monthlyRev,
        orderStatusCount: [statusCounts.pending, statusCounts.approved, statusCounts.shipping, statusCounts.completed]
      });

    } catch (error) {
      console.error("Lỗi tải dữ liệu Dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cấu hình dữ liệu cho biểu đồ
  const getLast6MonthsLabels = () => {
    const labels = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(d.getFullYear(), d.getMonth() - i, 1).getMonth() + 1;
      labels.push(`Tháng ${month}`);
    }
    return labels;
  };

  const revenueChartData = {
    labels: getLast6MonthsLabels(),
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: dashboardData.monthlyRevenue,
      borderColor: '#008080',
      backgroundColor: 'rgba(0, 128, 128, 0.1)',
      tension: 0.4, 
      fill: true,
    }]
  };

  const orderChartData = {
    labels: ['Chờ duyệt', 'Đã duyệt', 'Đang giao', 'Hoàn thành'],
    datasets: [{
      label: 'Số lượng đơn',
      data: dashboardData.orderStatusCount,
      backgroundColor: ['#fcd34d', '#60a5fa', '#a78bfa', '#34d399'], 
      borderRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [5, 5], color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  if (isLoading) {
    return <div className="dashboard-container"><p style={{textAlign: 'center', marginTop: '50px'}}>Đang tải dữ liệu tổng quan...</p></div>;
  }

  return (
    <div className="dashboard-container">
      {/* Banner */}
      <div className="welcome-banner">
        <div className="welcome-text-content">
          <h1>Chào mừng, {admin?.fullName || 'Quản trị viên'}!</h1>
          <p>Dưới đây là tổng quan dữ liệu hệ thống được cập nhật theo thời gian thực.</p>
        </div>
        <div className="banner-date">
          Hôm nay: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue"><FaShoppingCart /></div>
          <div className="stat-info">
            <p>Tổng đơn hàng</p>
            <h3>{dashboardData.totalOrders}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-teal"><FaBoxOpen /></div>
          <div className="stat-info">
            <p>Sản phẩm trong kho</p>
            <h3>{dashboardData.totalProducts}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple"><FaUsers /></div>
          <div className="stat-info">
            <p>Thành viên</p>
            <h3>{dashboardData.totalUsers}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <p>Tổng doanh thu</p>
            <h3>{dashboardData.totalRevenue.toLocaleString()}đ</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card col-span-2">
          <div className="card-header"><h3>Doanh thu 6 tháng gần nhất</h3></div>
          <div className="chart-wrapper"><Line data={revenueChartData} options={chartOptions} /></div>
        </div>
        <div className="chart-card">
          <div className="card-header"><h3>Trạng thái đơn hàng</h3></div>
          <div className="chart-wrapper"><Bar data={orderChartData} options={chartOptions} /></div>
        </div>
      </div>

      {/* Bảng đơn hàng chống vỡ layout */}
      <div className="recent-orders-card">
        <div className="card-header">
          <h3>Đơn hàng mới nhất</h3>
          <a href="/admin/orders" className="btn-view-all">Xem tất cả <FaArrowRight /></a>
        </div>
        <div className="table-responsive">
          <table className="dashboard-table-fixed">
            <thead>
              <tr>
                <th width="15%">Mã đơn</th>
                <th width="25%">Khách hàng</th>
                <th width="20%">Tổng tiền</th>
                <th width="20%">Trạng thái</th>
                <th width="20%">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentOrders.map((order, idx) => (
                <tr key={idx}>
                  <td className="fw-bold text-gray">{order._id?.slice(-8).toUpperCase()}</td>
                  <td>{order.fullName}</td>
                  <td className="fw-bold text-teal">{(order.totalAmount || 0).toLocaleString()}đ</td>
                  <td>
                    <span className={`badge badge-${order.status?.toLowerCase() || 'pending'}`}>
                      {order.status === 'pending' ? 'Chờ duyệt' : 
                       order.status === 'approved' ? 'Đã duyệt' : 
                       order.status === 'shipping' ? 'Đang giao' : 
                       order.status === 'completed' ? 'Hoàn thành' : 
                       order.status === 'cancelled' ? 'Đã hủy' : order.status}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(order.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              ))}
              {dashboardData.recentOrders.length === 0 && (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Chưa có đơn hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;