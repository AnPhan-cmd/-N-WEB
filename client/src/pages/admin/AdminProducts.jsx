import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaSearch, FaBoxOpen, FaLayerGroup } from 'react-icons/fa';
import styles from '../../css/admin-products.module.css';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('category');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [catInput, setCatInput] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const BASE_URL = 'http://localhost:3000';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      const [catRes, prodRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/categories`, config),
        axios.get(`${BASE_URL}/api/products`, config)
      ]);
      setCategories(catRes.data || []);
      setProducts(prodRes.data.products || prodRes.data || []);
    } catch (error) { console.error('Lỗi lấy dữ liệu:', error); }
  };

  const confirmDelete = (item, e) => {
    e.stopPropagation();
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const endpoint = activeTab === 'category'
        ? `${BASE_URL}/api/categories/delete/${itemToDelete._id}`
        : `${BASE_URL}/api/products/${itemToDelete._id}`;
      await axios.delete(endpoint, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setShowDeleteModal(false);
      fetchData();
    } catch (error) { alert('Lỗi khi xóa: ' + (error.response?.data?.message || 'Không xác định')); }
  };

  const handleAddCat = async () => {
    if (!catInput.trim()) return;
    try {
      await axios.post(`${BASE_URL}/api/categories/add`, { name: catInput }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setCatInput(''); fetchData();
    } catch (error) { alert("Lỗi khi thêm loại sản phẩm"); }
  };

  const handleUpdateCat = async () => {
    if (!editingCat || !catInput.trim()) return;
    try {
      await axios.put(`${BASE_URL}/api/categories/update/${editingCat._id}`, { name: catInput }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setCatInput(''); setEditingCat(null); fetchData();
    } catch (error) { alert("Lỗi khi cập nhật"); }
  };

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getPaginationGroup = () => {
    let start = Math.max(0, Math.min(currentPage - 2, totalPages - 3));
    return new Array(Math.min(3, totalPages)).fill().map((_, idx) => (totalPages <= 3 ? idx + 1 : start + idx + 1));
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab]);

  return (
    <div className={styles['page-container']}>
      {/* Tabs */}
      <div className={styles['tab-nav']}>
        <button className={`${styles['tab-btn']} ${activeTab === 'category' ? styles['tab-active'] : ''}`} onClick={() => setActiveTab('category')}>
          <FaLayerGroup /> Phân loại sản phẩm
        </button>
        <button className={`${styles['tab-btn']} ${activeTab === 'product' ? styles['tab-active'] : ''}`} onClick={() => setActiveTab('product')}>
          <FaBoxOpen /> Danh sách sản phẩm
        </button>
      </div>

      <div className={styles['content-area']}>
        {activeTab === 'category' ? (
          /* ================= TAB CATEGORY ================= */
          <div className={styles['grid-category']}>
            <div className={styles['card']}>
              <div className={styles['card-header']}>
                <h3>Danh sách phân loại</h3>
                <span className={styles['badge-teal']}>Tổng: {categories.length}</span>
              </div>
              <div className={styles['table-wrapper']}>
                <table className={styles['modern-table']}>
                  <thead>
                    <tr>
                      <th style={{width: '20%', textAlign: 'center'}}>STT</th>
                      <th style={{width: '80%'}}>Tên phân loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, index) => (
                      <tr 
                        key={cat._id} 
                        className={editingCat?._id === cat._id ? styles['row-selected'] : ''}
                        onClick={() => { setEditingCat(cat); setCatInput(cat.name); }}
                      >
                        <td style={{textAlign: 'center'}} className={styles['text-gray']}>{index + 1}</td>
                        <td className={styles['fw-bold']}>{cat.name}</td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr><td colSpan="2" style={{textAlign: 'center', padding: '20px'}}>Chưa có danh mục nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles['card']}>
              <div className={styles['card-header']}>
                <h3>{editingCat ? 'Cập nhật phân loại' : 'Thêm phân loại mới'}</h3>
              </div>
              <div className={styles['form-group']}>
                <label>Tên phân loại</label>
                <input 
                  type="text" 
                  value={catInput} 
                  onChange={(e) => setCatInput(e.target.value)} 
                  placeholder="Nhập tên..." 
                />
              </div>
              <div className={styles['action-stack']}>
                <button className={styles['btn-primary']} onClick={handleAddCat}>
                  <FaPlus /> Thêm mới
                </button>
                <button className={styles['btn-outline']} onClick={handleUpdateCat} disabled={!editingCat}>
                  <FaEdit /> Cập nhật
                </button>
                {editingCat && (
                  <button className={styles['btn-danger']} onClick={(e) => confirmDelete(editingCat, e)}>
                    <FaTrash /> Xóa
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ================= TAB PRODUCT ================= */
          <div className={styles['card']}>
            <div className={styles['toolbar']}>
              <div className={styles['search-box']}>
                <FaSearch className={styles['search-icon']} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <button className={styles['btn-primary']} onClick={() => navigate('/admin/products/add')}>
                <FaPlus /> Thêm sản phẩm
              </button>
            </div>

            <div className={styles['table-wrapper']}>
              <table className={styles['modern-table']}>
                <thead>
                  <tr>
                    <th style={{width: '5%', textAlign: 'center'}}>STT</th>
                    <th style={{width: '10%', textAlign: 'center'}}>Ảnh</th>
                    <th style={{width: '35%'}}>Tên sản phẩm</th>
                    <th style={{width: '15%'}}>Phân loại</th>
                    <th style={{width: '10%', textAlign: 'center'}}>Kho</th>
                    <th style={{width: '15%', textAlign: 'center'}}>Trạng thái</th>
                    <th style={{width: '10%', textAlign: 'center'}}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((prod, index) => (
                    <tr key={prod._id} onClick={() => navigate(`/admin/products/${prod._id}`)}>
                      <td style={{textAlign: 'center'}} className={styles['text-gray']}>{indexOfFirstProduct + index + 1}</td>
                      <td style={{textAlign: 'center'}}>
                        {/* ĐÃ FIX: Chặn đứng vòng lặp vô tận và thay đổi nguồn ảnh dự phòng */}
                        <img 
                          src={prod.images?.length > 0 ? `${BASE_URL}${prod.images[0]}` : "https://placehold.co/50x50?text=No+Image"} 
                          alt={prod.name} 
                          className={styles['thumb-img']} 
                          onError={(e) => { 
                            e.target.onerror = null; // Ngắt vòng lặp ngay lập tức
                            e.target.src = "https://placehold.co/50x50?text=No+Image"; 
                          }} 
                        />
                      </td>
                      <td className={styles['fw-bold']}>{prod.name}</td>
                      <td><span className={styles['cat-label']}>{prod.category?.name || '—'}</span></td>
                      <td style={{textAlign: 'center'}} className={styles['fw-bold']}>{prod.stock}</td>
                      <td style={{textAlign: 'center'}}>
                        <span className={`${styles['badge']} ${prod.stock > 0 ? styles['badge-green'] : styles['badge-red']}`}>
                          {prod.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      </td>
                      <td>
                        <div className={styles['cell-actions']}>
                          <button className={styles['btn-icon-edit']} onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/edit/${prod._id}`); }}><FaEdit /></button>
                          <button className={styles['btn-icon-delete']} onClick={(e) => confirmDelete(prod, e)}><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentProducts.length === 0 && (
                    <tr><td colSpan="7" style={{textAlign: 'center', padding: '30px'}}>Không tìm thấy sản phẩm nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles['pagination']}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><FaChevronLeft /></button>
                {getPaginationGroup().map(item => (
                  <button key={item} onClick={() => setCurrentPage(item)} className={currentPage === item ? styles['active-page'] : ''}>{item}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}><FaChevronRight /></button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Xóa */}
      {showDeleteModal && (
        <div className={styles['modal-overlay']} onClick={() => setShowDeleteModal(false)}>
          <div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
            <FaExclamationTriangle className={styles['modal-icon-warn']} />
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa <strong>{itemToDelete?.name}</strong>? Dữ liệu không thể khôi phục.</p>
            <div className={styles['modal-actions']}>
              <button className={styles['btn-cancel-modal']} onClick={() => setShowDeleteModal(false)}>Hủy bỏ</button>
              <button className={styles['btn-confirm-delete']} onClick={handleDelete}>Đồng ý xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;