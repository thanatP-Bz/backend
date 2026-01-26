"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const email_1 = require("./email");
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: `"Your App Name" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || "",
        };
        const info = await email_1.transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.messageId);
    }
    catch (error) {
        console.error("❌ Error sending email:", error);
        throw new Error("Failed to send email");
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map