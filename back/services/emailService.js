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
    
    // Email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #04ac9c;">EnovaTM Notification</h2>
        <p>${message}</p>
        ${ticketLink ? `<p><a href="${ticketLink}" style="background-color: #04ac9c; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">View Ticket</a></p>` : ''}
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This is an automated message from the EnovaTM system. Please do not reply to this email.</p>
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