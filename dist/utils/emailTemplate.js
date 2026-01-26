"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerificationEmail = exports.getPasswordResetConfirmationEmail = exports.getPasswordResetEmail = void 0;
const getPasswordResetEmail = (resetUrl, userName) => {
    return {
        subject: "Password Reset Request",
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .button {
              display: inline-block;
              background-color: #4F46E5;
              color: white !important;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning {
              background-color: #fef3c7;
              padding: 15px;
              border-left: 4px solid #f59e0b;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || "User"},</p>
              
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy this link:</p>
              <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link expires in 15 minutes</li>
                  <li>If you didn't request this, ignore this email</li>
                  <li>Your password won't change until you complete the reset</li>
                </ul>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
      Password Reset Request
      
      Hello ${userName || "User"},
      
      We received a request to reset your password.
      
      Click this link to reset: ${resetUrl}
      
      This link expires in 15 minutes.
      
      If you didn't request this, ignore this email.
    `,
    };
};
exports.getPasswordResetEmail = getPasswordResetEmail;
// utils/emailTemplates.ts (or wherever you have your email templates)
const getPasswordResetConfirmationEmail = (userName) => {
    return {
        subject: "Password Changed Successfully",
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #10b981;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .warning {
              background-color: #fef3c7;
              padding: 15px;
              border-left: 4px solid #f59e0b;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background-color: #4F46E5;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Changed Successfully</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || "User"},</p>
              
              <p>Your password has been successfully changed.</p>
              
              <p><strong>When:</strong> ${new Date().toLocaleString()}</p>
              
              <div class="warning">
                <strong>⚠️ Didn't change your password?</strong>
                <p>If you didn't make this change, please contact our support team immediately and secure your account.</p>
              </div>
              
              <p>For security reasons, you may want to:</p>
              <ul>
                <li>Review your recent account activity</li>
                <li>Update passwords on other accounts if you used the same password</li>
                <li>Enable two-factor authentication (if available)</li>
              </ul>
              
              <p>Thank you for keeping your account secure!</p>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
      Password Changed Successfully
      
      Hello ${userName || "User"},
      
      Your password has been successfully changed on ${new Date().toLocaleString()}.
      
      If you didn't make this change, please contact support immediately.
      
      Thank you for keeping your account secure!
    `,
    };
};
exports.getPasswordResetConfirmationEmail = getPasswordResetConfirmationEmail;
// Add this to your existing emailTemplate.ts file
const getVerificationEmail = (verificationUrl, userName) => {
    return {
        subject: "Verify Your Email Address",
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .button {
              display: inline-block;
              background-color: #4F46E5;
              color: white !important;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .warning {
              background-color: #fef3c7;
              padding: 15px;
              border-left: 4px solid #f59e0b;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Task Manager!</h1>
            </div>
            <div class="content">
              <p>Hello ${userName || "User"},</p>
              
              <p>Thank you for signing up! Please verify your email address to activate your account:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </div>
              
              <p>Or copy this link:</p>
              <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link expires in 24 hours</li>
                  <li>If you didn't create an account, ignore this email</li>
                  <li>You won't be able to login until you verify your email</li>
                </ul>
              </div>
              
              <p>Best regards,<br>Task Manager Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
      Welcome to Task Manager!
      
      Hello ${userName || "User"},
      
      Thank you for signing up! Please verify your email address to activate your account.
      
      Click this link to verify: ${verificationUrl}
      
      This link expires in 24 hours.
      
      If you didn't create an account, ignore this email.
    `,
    };
};
exports.getVerificationEmail = getVerificationEmail;
//# sourceMappingURL=emailTemplate.js.map