const mongoose = require("mongoose");
const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const signupVerifyMail = {
  subject: "BookNook email verification",
  html: `<p>Enter the above OTP in the website to verify your email address and complete the signup to BookNook </p>
  <p>This code expires in 3 minutes </p>`,
};
const loginVerifyMail = {
  subject: "BookNook login confirmation",
  html: `<p>Enter the above OTP in the website to confirm the login to BookNook.<p>
  <p>This code expires in 3 minutes</p><br><p>If it was not done by you we request to immediately reset your password and secure your account</p>`,
};
const resetPasswordVerifyMail = {
  subject: "BookNook reset password confirmation",
  html: `<p>Enter the above OTP in the website to reset the password of your BookNook's account.<p>
  <p>This code expires in 3 minutes</p>`,
};

async function sentOtpVerification(tempUser, mail, req) {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    console.log(otp);
    //mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: tempUser.email,
      subject: mail.subject,
      html: `<h2>"${otp}"</h2>${mail.html}`,
    };

    req.session.otp = otp;
    req.session.otpExpiry = Date.now() + 180000;

    await transporter.sendMail(mailOptions);
    console.log("mail sent");
    //next()
  } catch (err) {
    console.log(err);
  }
}

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  rejectUnauthorized: false,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

let loginError = null;
let signupError = null;
let signupOtpError = null;
let loginOtpError = null;
let emailInputError = null;
let rpOtpError = null;

//exporting

module.exports = {
  getLogin: (req, res) => {
    if (req.session.userLoggedIn) {
      res.redirect("/");
    } else {
      res.render("user/login", { user:req.session.user,error: loginError });
      loginError = null;
    }
  },

  getSignup: (req, res) => {
    res.render("user/signup", { error: signupError });
    signupError = null;
  },

  postSignup: async (req, res) => {
    try {
      const email = req.body.email;
      const findUser = await User.findOne({ email: email });

      if (!findUser) {
        signupError = null;
        req.session.tempUser = req.body;
        sentOtpVerification(req.session.tempUser, signupVerifyMail, req);
        res.redirect("/verification");
      } else {
        //user already exist
        signupError = "An account with this email already exist";
        res.redirect("/signup");
      }
    } catch (err) {
      console.log(err);
    }
  },

  getVerification: (req, res) => {
    res.render("user/verification", {
      user: req.session.tempUser,
      error: signupOtpError,
    });
    signupOtpError = null;
  },

  resendSignupOtp: (req, res) => {
    sentOtpVerification(req.session.tempUser, signupVerifyMail, req);
    res.redirect("/verification");
  },

  verifySignupOtp: async (req, res) => {
    let typedOtp = req.body.typedotp;

    if (req.session.otpExpiry < Date.now()) {
      signupOtpError = "Invalid otp";
      res.redirect("/verification");
    } else {
      if (typedOtp === req.session.otp) {
        //Create new user
        let tempUser = req.session.tempUser;
        tempUser.password = await bcrypt.hash(tempUser.password, 10);
        const newUser = await User.create(tempUser);

        req.session.otp = null;
        req.session.otpExpiry = null;
        signupOtpError = null;
        res.redirect("/login");
      } else {
        signupOtpError = "Invalid otp";
        res.redirect("/verification");
      }
    }
  },

  validateUser: async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      bcrypt.compare(req.body.password, user.password).then((result) => {
        if (result && !user.block) {
          console.log("login success");
          req.session.validatedUser = user;
          req.session.validatedUserLoggedIn = true;
          loginError = null;
          sentOtpVerification(req.session.validatedUser, loginVerifyMail, req);
          res.redirect("/loginVerification");
        } else {
          console.log("login failed");
          if (user.block) {
            loginError = "User is banned";
          } else {
            loginError = "invalid email or password";
          }
          res.redirect("/login");
        }
      });
    } else {
      console.log("login failed");
      loginError = "invalid email or password";
      res.redirect("/login");
    }
  },

  getloginverification: (req, res) => {
    res.render("user/loginVerification", {
      user: req.session.validatedUser,
      error: loginOtpError,
    });
    loginOtpError = null;
  },

  resendLoginOtp: (req, res) => {
    sentOtpVerification(req.session.validatedUser, loginVerifyMail, req);
    res.redirect("/loginVerification");
  },

  verifyLoginOtp: async (req, res) => {
    let typedOtp = req.body.typedotp;

    if (req.session.otpExpiry < Date.now()) {
      loginOtpError = "Invalid otp";
      res.redirect("/loginVerification");
    } else {
      if (typedOtp === req.session.otp) {
        //stor user in session
        req.session.user = req.session.validatedUser;
        req.session.userLoggedIn = true;

        req.session.otp = null;
        req.session.otpExpiry = null;
        loginOtpError = null;
        res.redirect("/");
      } else {
        loginOtpError = "Invalid otp";
        res.redirect("/loginVerification");
      }
    }
  },

  getEmailInput: (req, res) => {
    res.render("user/emailInput", { error: emailInputError });
    emailInputError = null;
  },

  postEmailInput: async (req, res) => {
    req.session.rpUser = await User.findOne({ email: req.body.email });
    if (req.session.rpUser) {
      sentOtpVerification(req.session.rpUser, resetPasswordVerifyMail, req);
      res.redirect("resetPasswordVerification");
    } else {
      emailInputError = "an Account with this email doesnt exist";
      res.redirect("/emailInput");
    }
  },

  getPasswordVerification: (req, res) => {
    res.render("user/passwordVerification", {
      error: rpOtpError,
      user: req.session.rpUser,
    });
    rpOtpError = null;
  },

  resendPasswordOtp: (req, res) => {
    sentOtpVerification(req.session.rpUser, resetPasswordVerifyMail, req);
    res.redirect("/resetPasswordVerification");
  },

  verifyPasswordOtp: async (req, res) => {
    let typedOtp = req.body.typedotp;

    if (req.session.otpExpiry < Date.now()) {
      rpOtpError = "Invalid otp";
      res.redirect("/resetPasswordVerification");
    } else {
      if (typedOtp === req.session.otp) {
        //stor user in session
        req.session.rpVerified = true;

        req.session.otp = null;
        req.session.otpExpiry = null;
        rpOtpError = null;
        res.redirect("/resetPassword");
      } else {
        rpOtpError = "Invalid otp";
        res.redirect("/resetPasswordVerification");
      }
    }
  },

  getResetPassword: (req, res) => {
    if (req.session.rpVerified && req.session.rpUser) {
      res.render("user/resetPassword");
    } else {
      res.redirect("/emailInput");
    }
  },

  postResetPassword: async (req, res) => {
    let rpUser = await User.findOne({ email: req.session.rpUser.email });
    rpUser.password = await bcrypt.hash(req.body.password, 10);
    await rpUser.save();
    req.session.rpVerified = false;
    req.session.rpUser = null;
    res.redirect("/login");
  },

  logOut: async (req, res) => {
    req.session.user = null;
    req.session.userLoggedIn = false;
    res.redirect("/");
  },
};
