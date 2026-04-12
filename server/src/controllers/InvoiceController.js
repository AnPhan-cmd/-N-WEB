import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';

// =======================================================================
// THUẬT TOÁN TẠO MÃ HÓA ĐƠN (HD + YYMM + STT) - Reset mỗi tháng
// =======================================================================
const generateInvoiceNo = async () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); 
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
    const prefix = `HD${year}${month}-`; // VD: HD2604-

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const lastInvoice = await Invoice.findOne({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        invoiceNo: { $regex: `^${prefix}` }
    }).sort({ createdAt: -1 });

    let sequence = 1;
    if (lastInvoice && lastInvoice.invoiceNo) {
        const lastSequence = parseInt(lastInvoice.invoiceNo.split('-')[1], 10);
        if (!isNaN(lastSequence)) {
            sequence = lastSequence + 1;
        }
    }

    let invoiceNo = `${prefix}${sequence.toString().padStart(4, '0')}`;

    // Vòng lặp chống trùng lặp tuyệt đối
    let exists = await Invoice.findOne({ invoiceNo });
    while (exists) {
        sequence++;
        invoiceNo = `${prefix}${sequence.toString().padStart(4, '0')}`;
        exists = await Invoice.findOne({ invoiceNo });
    }

    return invoiceNo;
};

// =======================================================================
// CONTROLLER CHÍNH
// =======================================================================
const InvoiceController = {
    getAllInvoices: async (req, res) => {
        try {
            const invoices = await Invoice.find().sort({ createdAt: -1 }).limit(100);
            return res.status(200).json(invoices);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi lấy danh sách hóa đơn", error: error.message });
        }
    },

    createInvoice: async (req, res) => {
        try {
            const { items, discount, customerName } = req.body;

            if (!customerName) return res.status(400).json({ message: "Thiếu tên khách hàng!" });
            if (!items || items.length === 0) return res.status(400).json({ message: "Hóa đơn phải có ít nhất 1 sản phẩm!" });

            // Gọi thuật toán tự động tạo mã
            const invoiceNo = await generateInvoiceNo();

            const newInvoice = new Invoice({ ...req.body, invoiceNo });

            // Trừ tồn kho
            for (const item of items) {
                if(item.productId) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: -item.quantity }
                    });
                }
            }

            await newInvoice.save();
            return res.status(201).json(newInvoice);
        } catch (error) {
            console.error("LỖI BACKEND CREATE INVOICE:", error);
            return res.status(400).json({ message: "Lỗi tạo hóa đơn", error: error.message });
        }
    },

    getInvoiceById: async (req, res) => {
        try {
            const invoice = await Invoice.findById(req.params.id).populate('items.productId', 'sku images');
            if (!invoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
            return res.status(200).json(invoice);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
        }
    },

    updateInvoice: async (req, res) => {
        try {
            // Tách invoiceNo ra để không ai có thể sửa được mã HD đã chốt
            const { invoiceNo, ...updateData } = req.body; 
            const invoice = await Invoice.findById(req.params.id);
            if (!invoice) return res.status(404).json({ message: "Hóa đơn không tồn tại" });

            Object.assign(invoice, updateData);
            await invoice.save(); 
            return res.status(200).json(invoice);
        } catch (error) {
            return res.status(400).json({ message: "Lỗi cập nhật", error: error.message });
        }
    },

    deleteInvoice: async (req, res) => {
        try {
            const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
            if (!deletedInvoice) return res.status(404).json({ message: "Không tìm thấy" });
            return res.status(200).json({ message: "Đã xóa hóa đơn" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi xóa", error: error.message });
        }
    }
};

export default InvoiceController;