import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS?.replace(/\s+/g, ''), // Strip spaces from App Password
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"CoreInventory Security" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verification Code: Reset Your Password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #020617; color: white;">
        <h2 style="color: #3b82f6; font-size: 24px; font-weight: 800; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.1em;">Security Verification</h2>
        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">You requested a password reset for your CoreInventory account. Use the following code to verify your identity. This code will expire in 10 minutes.</p>
        
        <div style="margin: 40px 0; text-align: center;">
          <span style="display: inline-block; padding: 16px 32px; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; font-size: 40px; font-weight: 900; letter-spacing: 0.2em; color: #ffffff;">${otp}</span>
        </div>
        
        <p style="color: #64748b; font-size: 12px; font-style: italic;">If you did not request this, please ignore this email or contact security if you suspect unauthorized access.</p>
        
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #475569; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">© 2026 CoreInventory SaaS System</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP Email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};
