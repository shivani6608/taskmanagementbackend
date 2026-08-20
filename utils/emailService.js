const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
 user: process.env.EMAIL_USER,
 pass: process.env.EMAIL_PASS,
 },
});
// Never throws â€” a broken SMTP config should not break task creation/updates.
const sendMail = async ({ to, subject, html }) => {
 if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
 console.warn('Email not sent: EMAIL_USER/EMAIL_PASS not configured');
 return;
 }
 try {
 await transporter.sendMail({
 from: `"Task Manager" <${process.env.EMAIL_USER}>`,
 to,
 subject,
 html,
 });
 } catch (error) {
 console.error(`Failed to send email to ${to}:`, error.message);
 }
};
const sendTaskCreatedEmail = (user, task) =>
 sendMail({
 to: user.email,
 subject: `Task created: ${task.title}`,
 html: `<p>Hi ${user.name},</p>
 <p>Your task <strong>${task.title}</strong> has been created successfully.</p>
 <p>Status: ${task.status} | Priority: ${task.priority}</p>
 ${task.dueDate ? `<p>Due: ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}`,
 });
const sendTaskCompletedEmail = (user, task) =>
 sendMail({
 to: user.email,
 subject: `Task completed: ${task.title}`,
 html: `<p>Hi ${user.name},</p>
 <p>Nice work! Your task <strong>${task.title}</strong> has been marked as
<strong>DONE</strong>.</p>`,
 });
module.exports = { sendTaskCreatedEmail, sendTaskCompletedEmail };