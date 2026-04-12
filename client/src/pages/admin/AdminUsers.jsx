import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaHistory, FaTrash } from 'react-icons/fa';
import '../../css/admin-user.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedUserHistory, setSelectedUserHistory] = useState([]);
    const [viewingUser, setViewingUser] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Lấy Token dùng chung
    const token = localStorage.getItem('token');

    const handleViewHistory = async (user) => {
        try {
            const res = await axios.get(`http://localhost:3000/api/users/${user._id}/history`, {
                headers: { 'Authorization': `Bearer ${token}` } // ✅ Đã thêm
            });
            setSelectedUserHistory(res.data);
            setViewingUser(user.fullName);
            setShowHistoryModal(true);
        } catch (error) {
            console.error("Lỗi frontend:", error);
            alert("Không thể tải lịch sử!");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` } // ✅ Đã thêm
            });
            setUsers(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách user:", error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`http://localhost:3000/api/users/${userId}/role`, 
                { role: newRole },
                { headers: { 'Authorization': `Bearer ${token}` } } // ✅ Đã thêm
            );
            alert("Cập nhật vai trò thành công!");
            fetchUsers(); 
        } catch (error) {
            alert("Lỗi khi cập nhật vai trò");
        }
    };

    const filteredUsers = users.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            // ✅ Đã sửa lỗi cú pháp headers ở đây
            await axios.delete(`http://localhost:3000/api/users/${userToDelete._id}`, {
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            alert("Xóa tài khoản thành công!");
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers(); 
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi xóa tài khoản");
        }
    };

    return (
        <div className="user-container">
            <h1>Quản lý tài khoản người dùng</h1>
            <div className='admin-user-container'>
                <div className="user-toolbar">
                    <div className="user-search-box">
                        <FaSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo họ tên..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="user-table-wrapper">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Họ & Tên</th>
                                <th>Số điện thoại</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr key={user._id}>
                                    <td>{index + 1}</td>
                                    <td>{user.fullName}</td>
                                    <td>{user.phoneNumber || 'Chưa có'}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <select 
                                            className="role-select"
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>

                                    <td className="user-actions">
                                        <button 
                                            className="btn-history" 
                                            title="Xem lịch sử mua hàng"
                                            onClick={() => handleViewHistory(user)} 
                                        >
                                            <FaHistory /> Lịch sử
                                        </button>
                                        <button className="btn-delete-user" onClick={() => openDeleteModal(user)}>
                                            <FaTrash /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showHistoryModal && (
                    <div className="history-modal-overlay">
                        <div className="history-modal">
                            <div className="modal-header">
                                <h2>Lịch sử mua hàng: {viewingUser || 'Người dùng'}</h2>
                                <button 
                                    className="close-modal-btn" 
                                    onClick={() => setShowHistoryModal(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="modal-body">
                                {selectedUserHistory.length > 0 ? (
                                    selectedUserHistory.map((order, index) => (
                                        <div key={order._id} className="order-card">
                                            <div className="order-header">
                                                <span className="order-date">
                                                    📅 {new Date(order.createdAt).toLocaleString('vi-VN', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    })}
                                                </span>
                                                <span className="order-status">
                                                    Trạng thái: <strong>{order.status.toUpperCase()}</strong>
                                                </span>
                                            </div>

                                            <table className="order-items-table">
                                                <thead>
                                                    <tr>
                                                        <th>Ảnh</th>
                                                        <th>Sản phẩm</th>
                                                        <th>Số lượng</th>
                                                        <th>Đơn giá</th>
                                                        <th>Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <img 
                                                                    src={`http://localhost:3000${item.image}`} 
                                                                    alt={item.name}
                                                                    className="product-thumb"
                                                                />
                                                            </td>
                                                            <td>{item.name}</td>
                                                            <td>x{item.quantity}</td>
                                                            <td>{item.price.toLocaleString('vi-VN')} đ</td>
                                                            <td className="total-cell">
                                                                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            <div className="order-footer">
                                                <div className="order-total">
                                                    <strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString('vi-VN')} đ
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-history">
                                        <p>Người dùng này chưa có đơn hàng nào.</p>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button 
                                    className="btn-close-modal" 
                                    onClick={() => setShowHistoryModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {showDeleteModal && userToDelete && (
                    <div className="delete-modal-overlay">
                        <div className="delete-modal">
                            <h3>Bạn có chắc chắn muốn xóa ?</h3>
                            <p><strong>{userToDelete.fullName}</strong> ({userToDelete.email})</p>
                            <div className="delete-modal-buttons">
                                <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Hủy</button>
                                <button className="btn-delete-confirm" onClick={handleDeleteUser}>XÓA VĨNH VIỄN</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;