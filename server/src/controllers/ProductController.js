import Product from '../models/Product.js';
import Category from '../models/Category.js'; 
import fs from 'fs';
import path from 'path';

class ProductController {
    // 1. Lấy tất cả sản phẩm (Giữ nguyên logic lọc của ông vì nó chuẩn rồi)
    async getAll(req, res) {
        try {
            const { category, priceRange, sort, page = 1, limit = 12 } = req.query;
            let query = { isHidden: { $ne: true } };

            if (category) query.category = category;

            if (priceRange) {
                let priceQuery = {};
                if (priceRange === '1-5') priceQuery = { $gte: 1000000, $lte: 5000000 };
                else if (priceRange === '5-10') priceQuery = { $gte: 5000000, $lte: 10000000 };
                else if (priceRange === '10-15') priceQuery = { $gte: 10000000, $lte: 15000000 };
                else if (priceRange === '15-20') priceQuery = { $gte: 15000000, $lte: 20000000 };
                else if (priceRange === '20-up') priceQuery = { $gt: 20000000 };
                if (Object.keys(priceQuery).length) query.price = priceQuery;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);
            let productQuery = Product.find(query).populate('category', 'name').skip(skip).limit(parseInt(limit));

            if (sort === 'price-asc') productQuery = productQuery.sort({ price: 1 });
            else if (sort === 'price-desc') productQuery = productQuery.sort({ price: -1 });
            else productQuery = productQuery.sort({ createdAt: -1 });

            const [products, totalProducts] = await Promise.all([
                productQuery.exec(),
                Product.countDocuments(query)
            ]);

            res.status(200).json({ 
                products, 
                totalPages: Math.ceil(totalProducts / limit), 
                currentPage: parseInt(page), 
                totalProducts 
            });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    // 2. Thêm sản phẩm (SỬA LOGIC UPLOAD ANY)
    async add(req, res) {
        try {
            const { name, price, category, stock, discount, status } = req.body;
            let descriptionsData = [];
            
            if (req.body.descriptions) {
                descriptionsData = JSON.parse(req.body.descriptions);
            }

            // Xử lý ảnh khi dùng upload.any()
            const allFiles = req.files || [];
            
            // Lọc ảnh chính
            const mainImages = allFiles
                .filter(f => f.fieldname === 'images')
                .map(f => `/uploads/${f.filename}`);

            // Lọc và gắn ảnh mô tả vào đúng vị trí
            descriptionsData.forEach((desc, index) => {
                const searchField = `descImages[${index}]`;
                const descFiles = allFiles
                    .filter(f => f.fieldname === searchField)
                    .map(f => `/uploads/${f.filename}`);
                
                desc.images = descFiles;
            });

            const newProduct = new Product({
                name,
                price: Number(price),
                category,
                stock: Number(stock),
                discount: Number(discount),
                isHidden: status === 'false' || status === false, 
                images: mainImages,
                descriptions: descriptionsData,
            });

            await newProduct.save();
            res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công!' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 3. Cập nhật sản phẩm (SỬA LOGIC UPLOAD ANY)
    async update(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

            const { name, price, category, stock, discount, status } = req.body;
            const allFiles = req.files || [];

            // Cập nhật thông tin cơ bản
            if (name) product.name = name;
            if (price !== undefined) product.price = Number(price);
            if (category) product.category = category;
            if (stock !== undefined) product.stock = Number(stock);
            if (discount !== undefined) product.discount = Number(discount);
            if (status !== undefined) product.isHidden = (status === 'false' || status === false);

            // Xử lý ảnh chính cũ và mới
            let mainImages = [];
            if (req.body.existingMainImages) {
                mainImages = JSON.parse(req.body.existingMainImages);
            }
            const newMain = allFiles
                .filter(f => f.fieldname === 'images')
                .map(f => `/uploads/${f.filename}`);
            product.images = [...mainImages, ...newMain];

            // Xử lý mô tả chi tiết
            if (req.body.descriptions) {
                const descriptionsData = JSON.parse(req.body.descriptions);
                descriptionsData.forEach((desc, index) => {
                    const searchField = `descImages[${index}]`;
                    const existing = desc.existingImages || [];
                    const newDescFiles = allFiles
                        .filter(f => f.fieldname === searchField)
                        .map(f => `/uploads/${f.filename}`);
                    
                    desc.images = [...existing, ...newDescFiles];
                    delete desc.existingImages; // Dọn dẹp field thừa
                });
                product.descriptions = descriptionsData;
            }

            await product.save();
            res.status(200).json({ success: true, message: 'Cập nhật thành công!', product });
        } catch (error) {
            console.error("Lỗi Update:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 4. Xóa sản phẩm
    async delete(req, res) {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            
            // Logic xóa file ảnh vật lý trên server (nếu muốn) có thể thêm ở đây
            
            res.status(200).json({ message: 'Xóa sản phẩm thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const product = await Product.findById(req.params.id).populate('category');
            if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async toggleHide(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            product.isHidden = !product.isHidden;
            await product.save();
            res.status(200).json({ message: "Cập nhật trạng thái hiển thị thành công" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new ProductController();