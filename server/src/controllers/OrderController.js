import Order from '../models/Order.js';
import { sendOrderStatusEmail, sendOrderConfirmEmail } from '../services/mailService.js';

// Thuật toán tạo mã đơn hàng chuẩn HD2404-0001
const generateOrderNo = async () => {
    try {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const prefix = `HD${year}${month}-`;

        const lastOrder = await Order.findOne({
            orderNo: { $regex: `^${prefix}` } 
        }).sort({ createdAt: -1 });

        let sequence = 1;
        if (lastOrder && lastOrder.orderNo) {
            const parts = lastOrder.orderNo.split('-');
            const lastPart = parts[parts.length - 1]; 
            const lastSequence = parseInt(lastPart, 10);
            if (!isNaN(lastSequence)) sequence = lastSequence + 1;
        }
        return `${prefix}${sequence.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error("LỖI GENERATE_ORDER_NO:", error);
        return `HD-TEMP-${Date.now()}`;
    }
};

class OrderController {
    // 1. TẠO ĐƠN HÀNG
    createOrder = async (req, res) => {
        try {
            const { 
                items, 
                fullName, 
                phone, phoneNumber, 
                email, 
                address, shippingAddress, 
                totalAmount, 
                paymentMethod 
            } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, message: "Giỏ hàng rỗng hoặc không hợp lệ!" });
            }

            const userId = req.user?.id || req.user?._id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Vui lòng đăng nhập lại!" });
            }

            const orderNo = await generateOrderNo();

            const formattedItems = items.map(p => {
                let itemImage = "";
                if (typeof p.image === 'string') {
                    itemImage = p.image;
                } else if (Array.isArray(p.image) && p.image.length > 0) {
                    itemImage = p.image[0];
                } else if (Array.isArray(p.images) && p.images.length > 0) {
                    itemImage = p.images[0];
                }
                if (Array.isArray(itemImage)) itemImage = "";

                return {
                    productId: p.productId || p._id || p.id,
                    name: p.name || "Sản phẩm không tên",
                    image: String(itemImage),
                    quantity: Number(p.quantity) || 1,
                    price: Number(p.price) || 0
                };
            });

            const newOrder = new Order({
                userId, 
                orderNo,
                fullName: (fullName || "Khách hàng").trim(),
                phone: (phone || phoneNumber || "0000000000").trim(),
                email: (email || "customer@harmony.com").trim(),
                address: (address || shippingAddress || "Chưa cung cấp địa chỉ").trim(),
                items: formattedItems,
                totalAmount: Number(totalAmount) || 0,
                paymentMethod: paymentMethod || 'COD',
                status: 'pending'
            });

            const savedOrder = await newOrder.save();

            // ✅ GỬI MAIL XÁC NHẬN ĐẶT HÀNG CHO KHÁCH
            try {
                if (savedOrder.email && savedOrder.email !== 'customer@harmony.com') {
                    await sendOrderConfirmEmail(
                        savedOrder.email,
                        savedOrder.fullName,
                        savedOrder.orderNo,
                        savedOrder.items,
                        savedOrder.totalAmount
                    );
                    console.log(`✅ Mail xác nhận đặt hàng đã gửi tới: ${savedOrder.email}`);
                }
            } catch (mailErr) {
                console.error("❌ Lỗi gửi mail xác nhận đơn hàng:", mailErr.message);
                // Không crash server, đơn hàng vẫn được tạo thành công
            }
            
            res.status(201).json({ 
                success: true, 
                message: "Đặt hàng thành công!", 
                order: savedOrder 
            });

        } catch (error) {
            console.error("LỖI CHI TIẾT TẠI createOrder:", error); 
            res.status(500).json({ 
                success: false, 
                message: "Lỗi hệ thống khi tạo đơn hàng", 
                error: error.message 
            });
        }
    };

    // 2. LẤY LỊCH SỬ ĐƠN HÀNG (User)
    getUserOrders = async (req, res) => {
        try {
            const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // 3. XÁC NHẬN NHẬN HÀNG
    markAsReceived = async (req, res) => {
        try {
            const order = await Order.findOneAndUpdate(
                { _id: req.params.orderId, userId: req.user.id },
                { status: 'completed' },
                { new: true }
            );
            if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            res.json({ success: true, message: "Đã xác nhận nhận hàng", order });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // 4. ADMIN: LẤY TẤT CẢ ĐƠN HÀNG
    getAllOrders = async (req, res) => {
        try {
            const orders = await Order.find()
                .populate('userId', 'fullName email username')
                .sort({ createdAt: -1 });
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // 5. ADMIN: CẬP NHẬT TRẠNG THÁI
    updateStatus = async (req, res) => {
        try {
            const { status } = req.body;
            const order = await Order.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );
            if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

            // ✅ GỬI MAIL THÔNG BÁO TRẠNG THÁI CHO KHÁCH
            try {
                if (order.email && order.email !== 'customer@harmony.com') {
                    await sendOrderStatusEmail(order.email, order.fullName, order.orderNo, status);
                    console.log(`✅ Mail cập nhật trạng thái đã gửi tới: ${order.email}`);
                }
            } catch (mailErr) {
                console.error("❌ Lỗi gửi mail trạng thái:", mailErr.message);
                // Không crash server, DB đã cập nhật rồi
            }

            res.json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // 6. ADMIN: THỐNG KÊ DOANH THU
    getRevenueStats = async (req, res) => {
        try {
            const stats = await Order.aggregate([
                { $group: { 
                    _id: "$status", 
                    count: { $sum: 1 }, 
                    total: { $sum: "$totalAmount" } 
                } }
            ]);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // 7. XÓA ĐƠN HÀNG
    deleteOrder = async (req, res) => {
        try {
            await Order.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: "Đã xóa đơn hàng" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new OrderController();