const cron = require("node-cron");
const { sendReminderEmail } = require("./emailSender");
const User = require("../models/user"); // adjust to your path

// Schedule: every day at 7:00 PM
cron.schedule("0 19 * * *", async () => {
  console.log("⏰ Running daily transaction reminder job...");

  try {
    const users = await User.find({}); // you can filter by active users if needed

    for (let user of users) {
      await sendReminderEmail(user.email, user.username);
      console.log("📩 Reminder sent to:", user.email);
    }
  } catch (err) {
    console.error("Reminder job failed:", err);
  }
});
