import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFileInvoiceDollar, FaExclamationTriangle } from 'react-icons/fa';
import '../../css/admin-invoice-list.css'; 

const AdminInvoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const BASE_URL = 'http://localhost:3000';
    const token = localStorage.getItem('token');

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/invoices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvoices(res.data);
        } catch (error) {
            console.error("Lỗi tải hóa đơn:", error);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchInvoices(); }, []);

    const confirmDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${BASE_URL}/api/invoices/${itemToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowDeleteModal(false); 
            fetchInvoices(); 
        } catch (error) {
            alert("Lỗi khi xóa hóa đơn!");
        }
    };

    const filteredInvoices = invoices.filter(inv => 
        (inv.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="inv-list-wrapper">
            <div className="inv-list-header">
                <h2><FaFileInvoiceDollar /> Danh sách Hóa đơn</h2>
                <button className="inv-btn-add-new" onClick={() => navigate('/admin/invoices/add')}>
                    <FaPlus /> Tạo hóa đơn mới
                </button>
            </div>

            <div className="inv-list-card">
                <div className="inv-search-box">
                    <FaSearch className="inv-search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo mã hoặc tên khách hàng..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="inv-table-responsive">
                    <table className="inv-strict-table">
                        <thead>
                            <tr>
                                <th width="5%" className="text-center">STT</th>
                                <th width="15%">Mã Hóa Đơn</th>
                                <th width="20%">Khách Hàng</th>
                                <th width="15%">Ngày Tạo</th>
                                <th width="15%" className="text-right">Tổng Tiền</th>
                                <th width="15%" className="text-center">Trạng Thái</th>
                                <th width="15%" className="text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv, index) => (
                                <tr key={inv._id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td className="fw-bold text-teal">{inv.invoiceNo}</td>
                                    <td className="fw-bold">{inv.customerName}</td>
                                    <td>{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="text-right text-red fw-bold">
                                        {inv.totalAmount?.toLocaleString()}đ
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge badge-${inv.status?.toLowerCase()}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="cell-actions" style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                                            <button className="btn-edit" onClick={() => navigate(`/admin/invoices/edit/${inv._id}`)}>
                                                <FaEdit/>
                                            </button>
                                            <button 
                                                className="btn-edit" 
                                                onClick={() => confirmDelete(inv)}
                                                style={{backgroundColor: '#ef4444', color: 'white'}}
                                            >
                                                <FaTrash/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ĐÃ FIX TOÀN BỘ GIAO DIỆN MODAL Ở ĐÂY */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    zIndex: 9999, backdropFilter: 'blur(3px)'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', padding: '35px 30px', 
                        borderRadius: '16px', width: '400px', maxWidth: '90%', 
                        textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <FaExclamationTriangle style={{fontSize: '55px', color: '#f59e0b', marginBottom: '15px'}} />
                        <h3 style={{margin: '0 0 10px 0', color: '#1e293b', fontSize: '22px'}}>Xác nhận xóa</h3>
                        
                        <p style={{marginBottom: '25px', color: '#475569', fontSize: '15px', lineHeight: '1.5'}}>
                            Bạn có chắc chắn muốn xóa hóa đơn <br/>
                            <strong style={{color: '#ef4444', fontSize: '18px'}}>{itemToDelete?.invoiceNo}</strong> không?
                        </p>
                        
                        <div style={{display: 'flex', gap: '15px'}}>
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', border: 'none', 
                                    background: '#f1f5f9', color: '#475569', cursor: 'pointer', 
                                    fontWeight: 'bold', fontSize: '15px'
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleDelete} 
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '8px', border: 'none', 
                                    background: '#ef4444', color: 'white', cursor: 'pointer', 
                                    fontWeight: 'bold', fontSize: '15px'
                                }}
                            >
                                Đồng ý xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInvoices;