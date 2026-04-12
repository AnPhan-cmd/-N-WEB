import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Đóng gói dữ liệu gửi lên Backend
            const payload = {
                fullName: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: formData.message
            };

            await axios.post('http://localhost:3000/api/contacts/send', payload); 
            
            toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.');
            setFormData({ name: '', email: '', phone: '', message: '' }); 
        } catch (error) {
            console.error("Lỗi gửi liên hệ:", error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page-wrapper">
            <ToastContainer position="top-center" autoClose={3000} />
            
            <div className="contact-card">
                <div className="contact-header">
                    <h2>Liên hệ Harmony Furniture</h2>
                    <p>Vui lòng điền thông tin vào biểu mẫu dưới đây để gửi tin nhắn cho chúng tôi. Đội ngũ CSKH sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group-row">
                        <div className="form-group half-width">
                            <label>Họ và Tên *</label>
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Nhập họ và tên..." 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Số điện thoại *</label>
                            <input 
                                type="tel" 
                                name="phone" 
                                placeholder="Nhập số điện thoại..." 
                                value={formData.phone} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ Email *</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Nhập địa chỉ Email..." 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>Nội dung tin nhắn *</label>
                        <textarea 
                            name="message" 
                            rows="6" 
                            placeholder="Bạn cần chúng tôi hỗ trợ gì..." 
                            value={formData.message} 
                            onChange={handleChange} 
                            required 
                        ></textarea>
                    </div>

                    <button type="submit" className="btn-submit-contact" disabled={isSubmitting}>
                        {isSubmitting ? 'ĐANG GỬI...' : 'GỬI TIN NHẮN'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;