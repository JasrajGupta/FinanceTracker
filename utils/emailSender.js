// utils/emailSender.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.USER, // your Brevo login email
    pass: process.env.API_KEY // generated from Brevo SMTP section
  }
});

async function sendWelcomeEmail(to, username) {
  await transporter.sendMail({
    from: '"Khrcha Web" jasrajgupta1@gmail.com',
    to,
    subject: "Welcome to Khrcha!",
    html: `
    <div style="font-family: sans-serif; background: #f9f9f9; padding: 2rem;">
      <div style="max-width: 600px; margin: auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <h2 style="color: #23BBA9;">👋 Welcome, ${username}!</h2>
        <p style="font-size: 16px;">We’re thrilled to have you on <strong>Khrcha</strong>, your personal budget companion.</p>

        <h3 style="margin-top: 2rem;">🚀 Getting Started Guide:</h3>
        <ol style="font-size: 15px; line-height: 1.7;">
          <li><strong>Add your first transaction:</strong> Log daily income and expenses</li>
          <li><strong>Set your monthly budget:</strong> Assign limits by category</li>
          <li><strong>Visualize your spending:</strong> Use graphs and insights</li>
          <li><strong>Track and improve:</strong> Make smart changes over time</li>
        </ol>


        <p style="margin-top: 2rem;">If you have questions, reply to this email. We're here to help you succeed 💪</p>

        <p style="margin-top: 2rem;">– Team Khrcha</p>
      </div>
    </div>
    `
  });
}
async function sendReminderEmail(to, username) {
  await transporter.sendMail({
    from: '"Khrcha App" jasrajgupta1@gmail.com',
    to,
    subject: "📝 Don’t forget today’s transaction!",
    html: `
      <div style="font-family: sans-serif; padding: 1rem;">
        <h2>Hi ${username},</h2>
        <p>Just a quick reminder to log your spending and income for today in <strong>Khrcha</strong>.</p>
        <p>Keeping track daily helps you stay on top of your budget. 💪</p>
        <p>If added avoid this mail.<p>
        <a href="https:/transctions/new" style="padding: 10px 20px; background: #23BBA9; color: white; text-decoration: none; border-radius: 5px;">Add Today's Transaction</a>
        <p style="margin-top: 1rem;">– Team Khrcha</p>
      </div>
    `
  });
}

module.exports = { sendWelcomeEmail, sendReminderEmail };
