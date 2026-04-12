import React from 'react';
import { FaShoppingCart, FaTrashAlt } from 'react-icons/fa';

const UserHistory = ({ historyData }) => {
    
    const handleReorder = (item) => {
        // Logic thêm lại sản phẩm vào giỏ hàng
        console.log("Mua lại sản phẩm:", item.name);
    };

    const handleHideHistory = (orderId) => {
        // Logic gọi API ẩn đơn hàng phía User
        console.log("Ẩn đơn hàng:", orderId);
    };

    return (
        <div className="user-history-page">
            <h1>Lịch sử mua hàng của tôi</h1>
            {historyData.map(order => (
                <div key={order._id} className="order-card">
                    <p className="order-date">Ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    <table className="user-history-table">
                        {order.items.map((item, idx) => (
                            <tr key={idx}>
                                <td><img src={`http://localhost:3000${item.image}`} width="50" alt=""/></td>
                                <td>{item.name}</td>
                                <td>x{item.quantity}</td>
                                <td>{(item.price * item.quantity).toLocaleString()}đ</td>
                                <td className="user-actions">
                                    <button onClick={() => handleReorder(item)} className="btn-reorder">
                                        <FaShoppingCart /> Mua lại
                                    </button>
                                    <button onClick={() => handleHideHistory(order._id)} className="btn-delete-view">
                                        <FaTrashAlt /> Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </table>
                </div>
            ))}
        </div>
    );
};