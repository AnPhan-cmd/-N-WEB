import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaSave, FaTimes, FaImage, FaPlus, FaTrash } from 'react-icons/fa';
import styles from '../../css/admin-products.module.css';

const ProductForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [productData, setProductData] = useState({
    name: '', category: '', stock: 0, price: 0, discount: 0, status: true,
  });

  const [categories, setCategories] = useState([]);
  const [oldMainImages, setOldMainImages] = useState([]); 
  const [selectedMainFiles, setSelectedMainFiles] = useState([]); 
  const [descriptions, setDescriptions] = useState([
    { title: '', content: '', oldImages: [], selectedFiles: [] },
  ]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = 'http://localhost:3000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const catRes = await axios.get(`${BASE_URL}/api/categories`);
        setCategories(catRes.data);

        if (isEdit && id) {
          const res = await axios.get(`${BASE_URL}/api/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const p = res.data;

          setProductData({
            name: p.name || '',
            category: p.category?._id || p.category || (catRes.data[0]?._id || ''),
            stock: Number(p.stock) || 0,
            price: Number(p.price) || 0,
            discount: Number(p.discount) || 0,
            status: p.status !== false,
          });

          if (p.descriptions && Array.isArray(p.descriptions) && p.descriptions.length > 0) {
            setDescriptions(p.descriptions.map((desc) => ({
              title: desc.title || '',
              content: desc.content || '',
              oldImages: desc.images || [], 
              selectedFiles: [], 
            })));
          }
          if (p.images && Array.isArray(p.images)) setOldMainImages(p.images);
        } else {
          if (catRes.data.length > 0) setProductData((prev) => ({ ...prev, category: catRes.data[0]._id }));
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert(error.response?.status === 404 ? 'Không tìm thấy sản phẩm' : 'Lỗi kết nối server.');
      } finally { setLoading(false); }
    };
    fetchData();
  }, [isEdit, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMainFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (oldMainImages.length + selectedMainFiles.length + files.length > 7) {
      return alert('Tổng số ảnh không được vượt quá 7!');
    }
    setSelectedMainFiles((prev) => [...prev, ...files]);
  };

  const removeOldMainImage = (index) => setOldMainImages((prev) => prev.filter((_, i) => i !== index));
  const removeNewMainFile = (index) => setSelectedMainFiles((prev) => prev.filter((_, i) => i !== index));

  const addDescription = () => setDescriptions((prev) => [...prev, { title: '', content: '', oldImages: [], selectedFiles: [] }]);
  
  const handleDescChange = (index, field, value) => {
    const newDescs = [...descriptions];
    newDescs[index][field] = value;
    setDescriptions(newDescs);
  };

  const handleDescFileChange = (descIndex, e) => {
    const files = Array.from(e.target.files);
    const desc = descriptions[descIndex];
    if (desc.oldImages.length + desc.selectedFiles.length + files.length > 2) {
      return alert('Mỗi mô tả tối đa 2 ảnh!');
    }
    const newDescs = [...descriptions];
    newDescs[descIndex].selectedFiles = [...desc.selectedFiles, ...files];
    setDescriptions(newDescs);
  };

  const removeOldDescImage = (descIndex, imgIndex) => {
    const newDescs = [...descriptions];
    newDescs[descIndex].oldImages = newDescs[descIndex].oldImages.filter((_, i) => i !== imgIndex);
    setDescriptions(newDescs);
  };

  const removeNewDescFile = (descIndex, fileIndex) => {
    const newDescs = [...descriptions];
    newDescs[descIndex].selectedFiles = newDescs[descIndex].selectedFiles.filter((_, i) => i !== fileIndex);
    setDescriptions(newDescs);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!productData.name.trim()) return alert('Vui lòng nhập tên sản phẩm!');
    if (!productData.category) return alert('Vui lòng chọn loại sản phẩm!');
    
    setLoading(true);
    const formData = new FormData();
    Object.keys(productData).forEach(key => formData.append(key, productData[key]));
    
    selectedMainFiles.forEach((file) => formData.append('images', file));
    if (isEdit) formData.append('existingMainImages', JSON.stringify(oldMainImages));

    const descData = descriptions.map((desc) => ({
      title: desc.title, content: desc.content, existingImages: desc.oldImages,
    }));
    formData.append('descriptions', JSON.stringify(descData));

    descriptions.forEach((desc, descIndex) => {
      desc.selectedFiles.forEach((file) => formData.append(`descImages[${descIndex}]`, file));
    });

    try {
      const url = isEdit ? `${BASE_URL}/api/products/${id}` : `${BASE_URL}/api/products/add`;
      const method = isEdit ? 'put' : 'post';
      await axios[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      alert(isEdit ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!');
      navigate('/admin/products');
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi lưu sản phẩm.');
    } finally { setLoading(false); }
  };

  if (loading && isEdit) return <div className={styles.loadingScreen}>Đang tải dữ liệu...</div>;

  return (
    <div className={styles.formPageContainer}>
      <div className={styles.formHeaderBar}>
        <button className={styles.btnBackOutline} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Trở về
        </button>
        <h2 className={styles.formTitle}>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm mới sản phẩm'}</h2>
      </div>

      <form className={styles.formCard} onSubmit={handleSave}>
        
        {isEdit && (
          <div className={styles.inputGroup}>
            <label>ID Sản phẩm</label>
            <input type="text" value={id} disabled className={`${styles.inputControl} ${styles.inputDisabled}`} />
          </div>
        )}

        <div className={styles.inputGroup}>
          <label>Tên sản phẩm <span className={styles.textRed}>*</span></label>
          <input type="text" name="name" required value={productData.name} onChange={handleInputChange} className={styles.inputControl} placeholder="Nhập tên sản phẩm..." />
        </div>

        <div className={styles.grid2Col}>
          <div className={styles.inputGroup}>
            <label>Phân loại <span className={styles.textRed}>*</span></label>
            <select name="category" value={productData.category} onChange={handleInputChange} required className={styles.inputControl}>
              <option value="">-- Chọn phân loại --</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Số lượng kho</label>
            <input type="number" name="stock" min="0" value={productData.stock} onChange={handleInputChange} className={styles.inputControl} />
          </div>
        </div>

        <div className={styles.grid2Col}>
          <div className={styles.inputGroup}>
            <label>Giá bán (VNĐ) <span className={styles.textRed}>*</span></label>
            <input type="number" name="price" min="0" value={productData.price} onChange={handleInputChange} required className={styles.inputControl} />
          </div>
          <div className={styles.inputGroup}>
            <label>Giảm giá (%)</label>
            <input type="number" name="discount" min="0" max="100" value={productData.discount} onChange={handleInputChange} className={styles.inputControl} />
          </div>
        </div>

        {/* Upload Ảnh Chính */}
        <div className={styles.inputGroup}>
          <label>Ảnh sản phẩm chính (tối đa 7 ảnh)</label>
          <div className={styles.uploadBox}>
            <input type="file" multiple accept="image/*" onChange={handleMainFileChange} id="main-upload" hidden />
            <label htmlFor="main-upload" className={styles.btnUploadOutline}>
              <FaImage /> Chọn ảnh từ máy
            </label>
            <span className={styles.uploadHint}>Đã chọn: {oldMainImages.length + selectedMainFiles.length}/7</span>
          </div>

          <div className={styles.previewArea}>
            {oldMainImages.map((img, idx) => (
              <div key={`old-${idx}`} className={styles.previewItem}>
                <img src={img.startsWith('http') ? img : `${BASE_URL}${img}`} alt="cũ" />
                <button type="button" className={styles.btnRemoveImg} onClick={() => removeOldMainImage(idx)}><FaTimes /></button>
              </div>
            ))}
            {selectedMainFiles.map((file, idx) => (
              <div key={`new-${idx}`} className={styles.previewItem}>
                <img src={URL.createObjectURL(file)} alt="mới" />
                <button type="button" className={styles.btnRemoveImg} onClick={() => removeNewMainFile(idx)}><FaTimes /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Cấu hình Mô tả chi tiết */}
        <div className={styles.descSection}>
          <div className={styles.descHeader}>
            <h4>Các đoạn mô tả chi tiết</h4>
            <button type="button" className={styles.btnDescAdd} onClick={addDescription}>
              <FaPlus /> Thêm đoạn
            </button>
          </div>
          
          {descriptions.map((desc, index) => (
            <div key={index} className={styles.descBox}>
              <div className={styles.descBoxHeader}>
                <span>Đoạn {index + 1}</span>
                {descriptions.length > 1 && (
                  <button type="button" className={styles.btnDescDel} onClick={() => {
                    const newDescs = descriptions.filter((_, i) => i !== index);
                    setDescriptions(newDescs);
                  }}><FaTrash /></button>
                )}
              </div>
              <input placeholder="Tiêu đề (VD: Chất liệu)" value={desc.title} onChange={(e) => handleDescChange(index, 'title', e.target.value)} className={styles.inputControl} style={{marginBottom: '10px'}} />
              <textarea placeholder="Nội dung..." rows="3" value={desc.content} onChange={(e) => handleDescChange(index, 'content', e.target.value)} className={styles.inputControl} style={{marginBottom: '15px'}} />

              <div className={styles.uploadBoxDesc}>
                <input type="file" multiple accept="image/*" onChange={(e) => handleDescFileChange(index, e)} id={`desc-upload-${index}`} hidden />
                <label htmlFor={`desc-upload-${index}`} className={styles.btnUploadSmall}>
                  <FaImage /> Thêm ảnh mô tả (Tối đa 2)
                </label>
              </div>
              
              <div className={styles.previewArea}>
                {desc.oldImages.map((img, i) => (
                  <div key={`old-desc-${i}`} className={styles.previewItem}>
                    <img src={img.startsWith('http') ? img : `${BASE_URL}${img}`} alt="cũ" />
                    <button type="button" className={styles.btnRemoveImg} onClick={() => removeOldDescImage(index, i)}><FaTimes /></button>
                  </div>
                ))}
                {desc.selectedFiles.map((file, i) => (
                  <div key={`new-desc-${i}`} className={styles.previewItem}>
                    <img src={URL.createObjectURL(file)} alt="mới" />
                    <button type="button" className={styles.btnRemoveImg} onClick={() => removeNewDescFile(index, i)}><FaTimes /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Hiển thị */}
        <div className={styles.toggleGroup}>
          <label className={styles.customCheckbox}>
            <input type="checkbox" name="status" checked={productData.status} onChange={handleInputChange} />
            <span className={styles.checkmark}></span>
            Hiển thị sản phẩm này trên website
          </label>
        </div>

        {/* Footer Buttons */}
        <div className={styles.formFooter}>
          <button type="button" className={styles.btnCancelForm} onClick={() => navigate(-1)} disabled={loading}>Hủy bỏ</button>
          <button type="submit" className={styles.btnSubmitForm} disabled={loading}>
            <FaSave /> {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;