const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const { sendWelcomeEmail } = require("../utils/emailSender");

 
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
})


router.post("/signup", wrapAsync(async(req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    req.login(registeredUser, async (err) => {
      if (err) return next(err);

      try {
        await sendWelcomeEmail(registeredUser.email, registeredUser.username); // ✅ send real email
      } catch (e) {
        console.error("Signup email failed:", e);
      }

      req.flash("success", `Welcome to Khrcha, ${registeredUser.username}`);
      res.redirect("/transctions");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}));


router.get("/login", (req,res) => {
    res.render("users/login.ejs")
})

router.post("/login",
  saveRedirectUrl,
  passport.authenticate("local", { failureRedirect: `/login`, failureFlash: true }),
  async (req, res) => {
    const { email, username } = req.user;

    try {
      await sendWelcomeEmail(email, username);
    } catch (e) {
      console.error("Email sending failed:", e);
      // Optional: flash message for failure
      req.flash("error", "Login successful, but email failed to send.");
    }

    req.flash("success", `Welcome back to Khrcha, ${username}!`);
    const redirectUrl = res.locals.redirectUrl || "/transctions";
    res.redirect(redirectUrl);
  }
);


router.get("/logout", (req, res) => {
    req.logout((err) => {
        if(err) {
        next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/transctions");
    });
})
module.exports = router;