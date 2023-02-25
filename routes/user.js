const express = require("express");
const router = express.Router();

//-----------------------------------Middlewares-------------------------------------------//


const { verifyLoggedOut } = require("../middlewares/verifyUserLoggeOut.js");

//----------------------Controllers---------------//
const {
  getLogin,
  getSignup,
  postSignup,
  logOut,
  getVerification,
  verifySignupOtp,
  resendSignupOtp,
  getloginverification,
  resendLoginOtp,
  verifyLoginOtp,
  getEmailInput,
  postEmailInput,
  getPasswordVerification,
  verifyPasswordOtp,
  resendPasswordOtp,
  getResetPassword,
  postResetPassword,
  validateUser,
} = require("../controllers/userAuthControllers.js");

const { getHome } = require("../controllers/userControllers");
const verifyUserLoggeOut = require("../middlewares/verifyUserLoggeOut.js");




//Get Home page
router.get("/", getHome);
//post home page
router.post("/logout",logOut);

/* -------------------User Authentication----------------------*/

//Get login page
router.get("/login",verifyLoggedOut, getLogin);
//post login page
router.post("/login",verifyLoggedOut, validateUser);

//Get signup page
router.get("/signup", getSignup);
//post signup page
router.post("/signup", postSignup);

//get verification page
router.get("/verification", getVerification);
//post verification page
router.post("/verifySignupOtp", verifySignupOtp);
//get resendotp
router.get("/resendSignupOtp", resendSignupOtp);

//get loginverification page
router.get("/loginVerification",verifyLoggedOut, getloginverification);
//get resendLoginOtp
router.get("/resendLoginOtp",verifyLoggedOut, resendLoginOtp);
//post loginverification page
router.post("/verifyLoginOtp",verifyLoggedOut, verifyLoginOtp);

// get reset password email input page
router.get("/emailInput", getEmailInput);
router.post("/emailInput", postEmailInput);
//get reset password otp page
router.get("/resetPasswordVerification", getPasswordVerification);
router.post("/resetPasswordVerification", verifyPasswordOtp);
//get reset password page
router.get("/resetPassword", getResetPassword);
router.post("/resetPassword", postResetPassword);
//get resend password otp page
router.get("/resendPasswordOtp", resendPasswordOtp);

module.exports = router;
