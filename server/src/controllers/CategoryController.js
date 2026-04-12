import Category from '../models/Category.js';

class CategoryController {
    // 1. Thêm danh mục mới 
    async create(req, res) {
        try {
            const { name, description, image } = req.body;
            const newCategory = new Category({ name, description, image });
            await newCategory.save();
            res.status(201).json({ message: 'Tạo danh mục thành công', data: newCategory });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi tạo danh mục', error: error.message });
        }
    }

    // 2. Lấy danh sách tất cả danh mục 
    async getAll(req, res) {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy danh sách', error: error.message });
        }
    }

    // 3. Cập nhật danh mục 
    async update(req, res) {
        try {
            const { id } = req.params;
            const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json({ message: 'Cập nhật thành công', data: updatedCategory });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
        }
    }

    // 4. Xóa danh mục 
    async delete(req, res) {
        try {
            const { id } = req.params;
            await Category.findByIdAndDelete(id);
            res.status(200).json({ message: 'Xóa danh mục thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi xóa', error: error.message });
        }
    }
}

export default new CategoryController();