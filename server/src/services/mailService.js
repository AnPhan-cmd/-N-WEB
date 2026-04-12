import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false 
    }
});

const checkConfig = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ LỖI: Chưa cấu hình EMAIL_USER hoặc EMAIL_PASS trong file .env");
        return false;
    }
    return true;
};

const header = `
    <div style="background-color: #046A62; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Harmony Furniture</h1>
    </div>
`;

const footer = `
    <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
        © 2026 Harmony Furniture. All rights reserved.
    </div>
`;

const wrapper = (content) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        ${header}
        <div style="padding: 30px; line-height: 1.6; color: #333;">
            ${content}
        </div>
        ${footer}
    </div>
`;

/**
 * Gửi mã OTP xác thực
 */
export const sendOTP = async (toEmail, otpCode) => {
    if (!checkConfig()) return { success: false, error: "Cấu hình mail chưa hoàn tất" };

    const mailOptions = {
        from: `"Harmony Furniture" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `[Harmony Furniture] ${otpCode} là mã xác nhận của bạn`,
        html: wrapper(`
            <h2 style="color: #046A62;">Xác thực tài khoản của bạn</h2>
            <p>Chào bạn,</p>
            <p>Cảm ơn bạn đã tin tưởng chọn Harmony. Để hoàn tất đăng ký, vui lòng nhập mã OTP dưới đây:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #046A62; letter-spacing: 5px;">${otpCode}</span>
            </div>
            <p style="font-size: 14px; color: #666;">Mã này có hiệu lực trong <b>5 phút</b>. Vui lòng không cung cấp mã này cho bất kỳ ai.</p>
        `)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Mail OTP đã gửi đến:", toEmail);
        return { success: true, response: info.response };
    } catch (error) {
        console.error("❌ Lỗi gửi mail OTP:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Gửi mail xác nhận đặt hàng thành công cho khách
 */
export const sendOrderConfirmEmail = async (toEmail, fullName, orderNo, items, totalAmount) => {
    if (!checkConfig()) return { success: false, error: "Cấu hình mail chưa hoàn tất" };

    const itemRows = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                ${Number(item.price).toLocaleString('vi-VN')}₫
            </td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"Harmony Furniture" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `[Harmony Furniture] Đặt hàng thành công - Mã đơn ${orderNo}`,
        html: wrapper(`
            <h2 style="color: #046A62;">🎉 Đặt hàng thành công!</h2>
            <p>Chào <b>${fullName}</b>,</p>
            <p>Harmony Furniture đã nhận được đơn hàng <b>${orderNo}</b> của bạn. Chúng tôi sẽ xử lý và liên hệ sớm nhất!</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background-color: #046A62; color: white;">
                        <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                        <th style="padding: 10px; text-align: center;">SL</th>
                        <th style="padding: 10px; text-align: right;">Giá</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>

            <div style="text-align: right; font-size: 18px; font-weight: bold; color: #046A62; margin-top: 10px;">
                Tổng cộng: ${Number(totalAmount).toLocaleString('vi-VN')}₫
            </div>

            <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Nếu bạn có thắc mắc, hãy liên hệ chúng tôi qua email hoặc hotline.
            </p>
        `)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Mail xác nhận đặt hàng đã gửi đến:", toEmail);
        return { success: true, response: info.response };
    } catch (error) {
        console.error("❌ Lỗi gửi mail xác nhận đơn hàng:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Gửi mail thông báo cập nhật trạng thái đơn hàng cho khách
 */
export const sendOrderStatusEmail = async (toEmail, fullName, orderNo, status) => {
    if (!checkConfig()) return { success: false, error: "Cấu hình mail chưa hoàn tất" };

    const statusMap = {
        pending:   { text: 'Chờ xác nhận',      icon: '⏳', color: '#f59e0b' },
        approved:  { text: 'Đã xác nhận',        icon: '✅', color: '#10b981' },
        shipping:  { text: 'Đang giao hàng',     icon: '🚚', color: '#3b82f6' },
        completed: { text: 'Giao hàng thành công', icon: '🎉', color: '#046A62' },
        rejected:  { text: 'Đã hủy',             icon: '❌', color: '#ef4444' },
    };

    const statusInfo = statusMap[status] || { text: status, icon: '📦', color: '#046A62' };

    const mailOptions = {
        from: `"Harmony Furniture" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `[Harmony Furniture] Cập nhật đơn hàng ${orderNo} - ${statusInfo.text}`,
        html: wrapper(`
            <h2 style="color: #046A62;">Cập nhật trạng thái đơn hàng</h2>
            <p>Chào <b>${fullName}</b>,</p>
            <p>Đơn hàng <b>${orderNo}</b> của bạn vừa được cập nhật trạng thái:</p>

            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px;">${statusInfo.icon}</span>
                <p style="font-size: 20px; font-weight: bold; color: ${statusInfo.color}; margin: 10px 0;">
                    ${statusInfo.text}
                </p>
            </div>

            <p style="font-size: 14px; color: #666;">
                Cảm ơn bạn đã mua sắm tại Harmony Furniture. Nếu có thắc mắc, vui lòng liên hệ chúng tôi.
            </p>
        `)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Mail cập nhật trạng thái đã gửi đến:", toEmail);
        return { success: true, response: info.response };
    } catch (error) {
        console.error("❌ Lỗi gửi mail trạng thái:", error.message);
        return { success: false, error: error.message };
    }
};