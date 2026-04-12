import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import "../../css/admin-order.css"; // Bắt buộc phải link đúng file CSS này

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const RevenueTab = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [monthA, setMonthA] = useState(1);
  const [monthB, setMonthB] = useState(2);

  const [stats, setStats] = useState({
    topProducts: [], topCustomers: [], dataA: [], dataB: [],
  });
  const [loading, setLoading] = useState(false);
  
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/api/orders/revenue-stats", {
          params: { year: selectedYear, monthA: monthA, monthB: monthB },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setStats({
          topProducts: res.data.topProducts || [],
          topCustomers: res.data.topCustomers || [],
          dataA: res.data.dataA || [],
          dataB: res.data.dataB || []
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh số:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedYear, monthA, monthB, token]);

  const hasData = (dataArray) => {
    return dataArray && dataArray.length > 0 && dataArray.some(val => val > 0);
  };

  // Cấu hình mảng màu cho biểu đồ (có thể tùy chỉnh)
  const chartData = (monthLabel, dataArray) => ({
    labels: stats.topProducts.slice(0, 4).map(p => p.name) || ["Trống"],
    datasets: [{
      label: `Doanh thu`,
      data: dataArray,
      backgroundColor: ["#000856", "#01cf5a", "#ff4d4f", "#f7ff13"],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 6
    }]
  });

  return (
    <div className="rv-wrapper">
      {/* Khối Bộ Lọc */}
      <div className="rv-filter-card">
        <div className="rv-filter-group">
          <label>Năm báo cáo:</label>
          <select className="rv-select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {years.map((y) => (<option key={y} value={y}>Năm {y}</option>))}
          </select>
        </div>
        <div className="rv-filter-group">
          <label>Biểu đồ A:</label>
          <select className="rv-select" value={monthA} onChange={(e) => setMonthA(Number(e.target.value))}>
            {[...Array(12)].map((_, i) => (<option key={i} value={i + 1}>Tháng {i + 1}</option>))}
          </select>
          <span className="rv-vs-text">vs</span>
          <label>Biểu đồ B:</label>
          <select className="rv-select" value={monthB} onChange={(e) => setMonthB(Number(e.target.value))}>
            {[...Array(12)].map((_, i) => (<option key={i} value={i + 1}>Tháng {i + 1}</option>))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rv-loading">Đang tải dữ liệu báo cáo...</div>
      ) : (
        <>
          {/* Khối Biểu đồ */}
          <div className="rv-charts-grid">
            <div className="rv-card">
              <h3>Biểu đồ Tháng {monthA}</h3>
              <div className="rv-chart-container">
                {hasData(stats.dataA) ? (
                  <Pie data={chartData(`Tháng ${monthA}`, stats.dataA)} options={{ maintainAspectRatio: false }} />
                ) : ( <p className="rv-empty">Không có dữ liệu tháng này</p> )}
              </div>
            </div>

            <div className="rv-card">
              <h3>Biểu đồ Tháng {monthB}</h3>
              <div className="rv-chart-container">
                {hasData(stats.dataB) ? (
                  <Pie data={chartData(`Tháng ${monthB}`, stats.dataB)} options={{ maintainAspectRatio: false }} />
                ) : ( <p className="rv-empty">Không có dữ liệu tháng này</p> )}
              </div>
            </div>
          </div>

          {/* Khối Bảng Xếp hạng - ĐƯỢC BẢO VỆ BỞI CLASS rv-strict-table */}
          <div className="rv-tables-grid">
            <div className="rv-card">
              <h3>Top 10 sản phẩm bán chạy nhất</h3>
              <div className="rv-table-responsive">
                <table className="rv-strict-table">
                  <thead>
                    <tr>
                      <th width="15%" className="rv-text-center">STT</th>
                      <th width="60%">Tên sản phẩm</th>
                      <th width="25%" className="rv-text-center">Đã bán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((p, i) => (
                      <tr key={i}>
                        <td className="rv-text-center rv-text-gray">{i + 1}</td>
                        <td className="rv-fw-bold">{p.name}</td>
                        <td className="rv-text-center rv-fw-bold">{p.totalQty}</td>
                      </tr>
                    ))}
                    {stats.topProducts.length === 0 && (
                      <tr><td colSpan="3" className="rv-text-center">Chưa có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rv-card">
              <h3>Top 10 khách hàng mua nhiều nhất</h3>
              <div className="rv-table-responsive">
                <table className="rv-strict-table">
                  <thead>
                    <tr>
                      <th width="15%" className="rv-text-center">STT</th>
                      <th width="60%">Họ & Tên</th>
                      <th width="25%" className="rv-text-center">Đã mua</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topCustomers.map((c, i) => (
                      <tr key={i}>
                        <td className="rv-text-center rv-text-gray">{i + 1}</td>
                        <td className="rv-fw-bold">{c.fullName}</td>
                        <td className="rv-text-center rv-fw-bold">{c.totalItems}</td>
                      </tr>
                    ))}
                    {stats.topCustomers.length === 0 && (
                      <tr><td colSpan="3" className="rv-text-center">Chưa có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueTab;