import nodemailer from 'nodemailer';

export const sendOTPEmail = async (toEmail, otpCode, purposeTitle = 'Verification Code') => {
  const host = process.env.SMTP_HOST || 'smtp.mail.yahoo.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'admin@pos.com';
  const pass = process.env.SMTP_PASS;

  console.log(`\n========================================`);
  console.log(`📧 [OTP GENERATED] For: ${toEmail}`);
  console.log(`🔑 [OTP CODE]: ${otpCode} (Valid for 10 minutes)`);
  console.log(`========================================\n`);

  if (!pass) {
    console.log(`ℹ️ SMTP_PASS is not configured in backend/.env. OTP code logged above for development testing.`);
    return { success: true, mode: 'console' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"POS Flow Security" <${user}>`,
      to: toEmail,
      subject: `POS Flow - ${purposeTitle}: ${otpCode}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; background-color: #f8fafc; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">POS Flow</h1>
            <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Security Verification</span>
          </div>
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">Hello,</p>
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">Your One-Time Password (OTP) for <strong>${purposeTitle}</strong> is:</p>
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px dashed #2563eb; padding: 18px; border-radius: 10px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8;">${otpCode}</span>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.4;">This code is valid for <strong>10 minutes</strong>. If you did not request this verification, please ignore this message.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">POS Flow &copy; 2026. All rights reserved.</p>
        </div>
      `
    });

    console.log(`✉️ OTP Email sent successfully via Yahoo Mail: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`⚠️ Failed to send email via Yahoo SMTP: ${err.message}`);
    return { success: true, mode: 'fallback_console' };
  }
};
