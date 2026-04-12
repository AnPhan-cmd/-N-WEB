import mongoose  from "mongoose";

const contactSchema = new mongoose.Schema({
    fullname: {type: String, require: true},
    email: {type: String, require: true},
    subject: {type: String, default: 'Hỗ trợ khách hàng'}, 
    message: {type: String, require: true},
    status: {type: String, enum: ['pending', 'resolved'], default: 'pending'}},   // trang thái để admin để quản lý
    {timestamps: true}); 

const Contact = mongoose.model('Contact', contactSchema);   
export default Contact;