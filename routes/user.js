const express = require("express");
const router = express.Router();

//-----------------------------------Middlewares-------------------------------------------//

const {
  verifyLoggedIn,
  verifyLoggedOut,
  checkBan,
} = require("../middlewares/userAuth.js");

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

const {
  getHome,
  getShop,
  getProductDetails,
  getCart,
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  getWishlist,
  removeFromWishlist,
  addToWishlist,
  removeFromWishlist2,
} = require("../controllers/userControllers");

/* ----------------------Home page-----------------------------*/

//Get Home page
router.get("/", getHome);
//post home page
router.post("/logout", logOut);

/* ----------------------Shop page-----------------------------*/

// get shop page
router.get("/shop", getShop);

/* ----------------------Product details page-----------------------------*/

router.get("/productDetails/:id", getProductDetails);

/* ----------------------Cart page-----------------------------*/

//get cart page
router.get("/cart", verifyLoggedIn, checkBan, getCart);
// add product to cart
router.get("/addToCart/:id", verifyLoggedIn, checkBan, addToCart);
// remove product from cart
router.get("/removeFromCart/:id", verifyLoggedIn, checkBan, removeFromCart);

// increase quantity
router.get(
  "/cart/incQuantity/:id",
  verifyLoggedIn,
  checkBan,
  increaseQuantity
);
// decrease quantity
router.get(
  "/cart/decQuantity/:id",
  verifyLoggedIn,
  checkBan,
  decreaseQuantity
);

/* ----------------------Wishlist page-----------------------------*/

//get wishlist page
router.get("/wishlist", verifyLoggedIn, checkBan, getWishlist);
//add to wishlist
router.get("/wishlist/add/:id", verifyLoggedIn, checkBan,addToWishlist);
//remove from wishlist
router.get("/wishlist/remove/:id", verifyLoggedIn, checkBan,removeFromWishlist);
router.get("/wishlist/remove2/:id", verifyLoggedIn, checkBan,removeFromWishlist2);


/* -------------------User Authentication----------------------*/

//Get login page
router.get("/login", verifyLoggedOut, getLogin);
//post login page
router.post("/login", verifyLoggedOut, validateUser);

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
router.get("/loginVerification", verifyLoggedOut, getloginverification);
//get resendLoginOtp
router.get("/resendLoginOtp", verifyLoggedOut, resendLoginOtp);
//post loginverification page
router.post("/verifyLoginOtp", verifyLoggedOut, verifyLoginOtp);

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

/* -------------------xx----------------------*/

module.exports = router;
