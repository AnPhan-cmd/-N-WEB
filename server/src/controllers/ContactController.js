import Contact from '../models/Contact.js';

class ContactController {
    // User gửi tin nhắn (Public)
    async sendContact(req, res) {
        try {
            // ✅ Đổi subject thành phone cho khớp với form giao diện
            const { fullName, email, phone, message } = req.body; 
            const newContact = new Contact({ fullName, email, phone, message });
            await newContact.save();
            res.status(201).json({ message: "Tin nhắn của bạn đã được gửi thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi gửi tin nhắn", error: error.message });
        }
    }

    // Admin lấy danh sách câu hỏi (Private) 
    async getAllContacts(req, res) {
        try {
            const contacts = await Contact.find().sort({ createdAt: -1 });
            res.status(200).json(contacts);
        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
        }
    }

    // Admin xóa yêu cầu hỗ trợ (Private) 
    async deleteContact(req, res) {
        try {
            await Contact.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: "Xóa tin nhắn thành công!" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi xóa", error: error.message });
        }
    }
}

export default new ContactController();