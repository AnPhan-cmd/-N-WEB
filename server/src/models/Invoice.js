import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNo: { type: String, required: true, unique: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerID: { type: String, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    address: { type: String, trim: true, default: '' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, default: 0 },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Transfer', 'Credit Card'],
        default: 'Cash'
    },
    status: { 
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled'],
        default: 'Pending'
    },
    discount: { type: Number, default: 0 },
    notes: String
}, { timestamps: true });

// TỰ ĐỘNG TÍNH TOÁN (Dành cho Mongoose v7/v8 - Không dùng next())
invoiceSchema.pre('save', function() {
    if (this.items && this.items.length > 0) {
        const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.totalAmount = Math.max(0, subtotal - (this.discount || 0));
    } else {
        this.totalAmount = 0;
    }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;