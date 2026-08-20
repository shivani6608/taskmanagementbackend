const express = require('express');
const router = express.Router();

const { sendMail } = require('../utils/emailService');

router.get('/test-email', async (req, res) => {
  try {
    const testEmail = process.env.EMAIL_USER;

    await sendMail({
      to: testEmail,
      subject: 'Task Manager Email Test',
      html: `
        <h2>Email is working!</h2>
        <p>This is a test email from your Task Management backend.</p>
      `,
    });

    res.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
    });
  } catch (error) {
    console.error('Test email failed:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
