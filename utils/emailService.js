const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP configuration when the server starts
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL SMTP CONFIGURATION ERROR:', error);
  } else {
    console.log('✅ EMAIL SMTP SERVER READY');
  }
});

const sendMail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER or EMAIL_PASS is missing');
  }

  try {
    const info = await transporter.sendMail({
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('✅ EMAIL SENT');
    console.log('Message ID:', info.messageId);
    console.log('Recipient:', to);

    return info;
  } catch (error) {
    console.error('❌ EMAIL SEND ERROR:', error);
    throw error;
  }
};
