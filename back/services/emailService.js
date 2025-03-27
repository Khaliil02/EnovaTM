const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASSWORD || 'password'
  }
});

// Send notification email
const sendNotificationEmail = async (to, subject, message, ticketId = null) => {
  try {
    // Create ticket link if ID is provided
    const ticketLink = ticketId 
      ? `${process.env.CLIENT_URL}/tickets/${ticketId}` 
      : null;
    
    // Enhanced email template with better styling
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <div style="background-color: #04ac9c; padding: 15px; border-radius: 5px 5px 0 0;">
          <h2 style="color: white; margin: 0;">EnovaTM Notification</h2>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px; line-height: 1.5;">${message}</p>
          ${ticketLink ? `<p style="margin-top: 25px;"><a href="${ticketLink}" style="background-color: #04ac9c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Ticket</a></p>` : ''}
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 0 0 5px 5px; font-size: 12px; color: #666;">
          <p>This is an automated message from the EnovaTM system. Please do not reply to this email.</p>
          <p>If you wish to manage your notification preferences, please visit your <a href="${process.env.CLIENT_URL}/settings" style="color: #04ac9c;">account settings</a>.</p>
        </div>
      </div>
    `;
    
    // Send email
    const info = await transporter.sendMail({
      from: `"EnovaTM" <${process.env.SMTP_FROM || 'noreply@enova.com'}>`,
      to,
      subject,
      text: message,
      html
    });
    
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendNotificationEmail
};