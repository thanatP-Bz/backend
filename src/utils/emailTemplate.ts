export const getPasswordResetEmail = (resetUrl: string, userName?: string) => {
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
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
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
