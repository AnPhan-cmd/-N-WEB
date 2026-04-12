import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    orderNo: { type: String, unique: true }, // Mã HD...
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        image: String,
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'COD' },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'shipping'], 
        default: 'pending' 
    },
    isViewed: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);