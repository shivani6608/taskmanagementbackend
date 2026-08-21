const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: true,
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
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
const sendTaskCreatedEmail = async (user, task) => {
  if (!user?.email) {
    console.log("No user email found. Skipping task created email.");
    return;
  }

  return sendMail({
    to: user.email,
    subject: `Task Created: ${task.title}`,
    html: `
      <h2>Task Created Successfully</h2>
      <p>Hello ${user.name || "User"},</p>
      <p>Your task has been created successfully.</p>
      <p><strong>Task:</strong> ${task.title}</p>
      <p><strong>Status:</strong> ${task.status || "TODO"}</p>
      <p><strong>Priority:</strong> ${task.priority || "MEDIUM"}</p>
    `,
  });
};

const sendTaskCompletedEmail = async (user, task) => {
  if (!user?.email) {
    console.log("No user email found. Skipping task completed email.");
    return;
  }

  return sendMail({
    to: user.email,
    subject: `Task Completed: ${task.title}`,
    html: `
      <h2>Task Completed</h2>
      <p>Hello ${user.name || "User"},</p>
      <p>Your task "${task.title}" has been completed.</p>
    `,
  });
};

module.exports = {
  sendMail,
  sendTaskCreatedEmail,
  sendTaskCompletedEmail,
};
