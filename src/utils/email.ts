import nodemailer from "nodemailer";

console.log("📧 Email config:", {
  user: process.env.EMAIL_USER,
  passExists: !!process.env.EMAIL_PASS,
  passLength: process.env.EMAIL_PASS?.length,
});

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(`❌ Email configuration error:`, error);
  } else {
    console.log(`✅ Email server is ready to send messages`);
  }
});
