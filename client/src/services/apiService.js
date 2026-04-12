import axios from 'axios';

// ĐÃ SỬA: Chuyển từ 5000 sang 3000 để khớp với Server
const API_URL = 'http://localhost:3000/api';

export const apiService = {
    // Categories
    getCategories: () => axios.get(`${API_URL}/categories`),
    addCategory: (data) => axios.post(`${API_URL}/categories`, data),
    updateCategory: (id, data) => axios.put(`${API_URL}/categories/${id}`, data),
    deleteCategory: (id) => axios.delete(`${API_URL}/categories/${id}`),

    // Products 
    // MỚI THÊM: Hàm này để load danh sách sản phẩm ra màn hình
    getProducts: () => axios.get(`${API_URL}/products`), 
    getProductById: (id) => axios.get(`${API_URL}/products/${id}`),
    deleteProduct: (id) => axios.delete(`${API_URL}/products/${id}`),
    
    // Logic upload ảnh
    saveProduct: async (productData, images, isEdit = false) => {
        const formData = new FormData();
        Object.keys(productData).forEach(key => {
            if (key === 'descriptions') {
                formData.append(key, JSON.stringify(productData[key]));
            } else {
                formData.append(key, productData[key]);
            }
        });
        images.forEach(file => formData.append('images', file));

        if (isEdit) {
            return axios.put(`${API_URL}/products/${productData.id}`, formData);
        }
        return axios.post(`${API_URL}/products`, formData);
    }
};