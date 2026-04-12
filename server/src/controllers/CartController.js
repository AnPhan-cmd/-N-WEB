import Cart from '../models/Cart.js';
import mongoose from 'mongoose';

class CartController {
    // 1. Lấy giỏ hàng của User
    async getCart(req, res) {
        try {
            const userId = req.user._id || req.user.id;
            let cart = await Cart.findOne({ user: userId }).populate('items.product');
            
            if (!cart) {
                cart = await Cart.create({ user: userId, items: [] });
            }
            
            res.status(200).json(cart);
        } catch (error) {
            console.error("Get Cart Error:", error);
            res.status(500).json({ message: "Lỗi lấy giỏ hàng", error: error.message });
        }
    }

    // 2. Thêm sản phẩm vào giỏ hàng (Đã sửa logic ID và Payload)
    async addToCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user._id || req.user.id; // Đảm bảo lấy đúng ID từ middleware auth

            // Validate dữ liệu đầu vào
            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
            }

            const qty = Number(quantity) || 1;
            if (qty < 1) {
                return res.status(400).json({ message: "Số lượng phải lớn hơn hoặc bằng 1" });
            }

            // Tìm giỏ hàng của user
            let cart = await Cart.findOne({ user: userId });

            if (!cart) {
                // Trường hợp user chưa từng có giỏ hàng
                cart = new Cart({
                    user: userId,
                    items: [{ product: productId, quantity: qty }]
                });
            } else {
                // Trường hợp đã có giỏ hàng, kiểm tra sản phẩm đã tồn tại chưa
                const itemIndex = cart.items.findIndex(
                    item => item.product.toString() === productId
                );

                if (itemIndex > -1) {
                    // Sản phẩm đã có -> Tăng số lượng
                    cart.items[itemIndex].quantity += qty;
                } else {
                    // Sản phẩm mới -> Thêm vào mảng items
                    cart.items.push({ product: productId, quantity: qty });
                }
            }

            await cart.save();
            
            // Trả về dữ liệu đã được populate để Frontend hiển thị ngay nếu cần
            const updatedCart = await Cart.findById(cart._id).populate('items.product');
            
            res.status(200).json({ 
                message: "Đã thêm vào giỏ hàng thành công", 
                data: updatedCart 
            });
        } catch (error) {
            console.error("Add To Cart Error:", error);
            res.status(500).json({ 
                message: "Lỗi hệ thống khi thêm vào giỏ hàng", 
                error: error.message 
            });
        }
    }

    // 3. Xóa một sản phẩm khỏi giỏ hàng
    async removeFromCart(req, res) {
        try {
            const { productId } = req.params;
            const userId = req.user._id || req.user.id;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
            }

            let cart = await Cart.findOne({ user: userId });

            if (cart) {
                cart.items = cart.items.filter(
                    item => item.product.toString() !== productId
                );
                await cart.save();
            }

            const updatedCart = await Cart.findById(cart?._id).populate('items.product');
            res.status(200).json({ message: "Đã xóa sản phẩm", data: updatedCart });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
        }
    }

    // 4. Cập nhật số lượng sản phẩm trong giỏ
    async updateCartItem(req, res) {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user._id || req.user.id;

            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
            }

            const qty = Number(quantity);
            if (isNaN(qty) || qty < 1) {
                return res.status(400).json({ message: "Số lượng không hợp lệ" });
            }

            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
            }

            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex === -1) {
                return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });
            }

            cart.items[itemIndex].quantity = qty;
            await cart.save();

            const updatedCart = await Cart.findById(cart._id).populate('items.product');
            return res.status(200).json({ message: "Đã cập nhật số lượng", data: updatedCart });
        } catch (error) {
            res.status(500).json({ message: "Lỗi cập nhật số lượng", error: error.message });
        }
    }
}

export default new CartController();