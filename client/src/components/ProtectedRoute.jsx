import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Nếu chưa đăng nhập -> về trang Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu role không nằm trong danh sách được cho phép -> về trang chủ
  if (!allowedRoles.includes(user.role)) {
    alert("Bạn không có quyền truy cập vào khu vực này!");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;