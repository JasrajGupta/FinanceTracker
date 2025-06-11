const express = require("express");
const router = express.Router();
const { sendWelcomeEmail } = require("../utils/emailSender");

router.get("/send-test-email", async (req, res) => {
  try {
    await sendWelcomeEmail("your-email@example.com", "Test User");
    res.send("✅ Test email sent successfully!");
  } catch (err) {
    console.error("EMAIL ERROR:", err);  // 👈 ADD THIS
    res.status(500).send("❌ Failed to send email.");
  }
});

module.exports = router;
