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
  getCheckout,
  addAddress,
  postCheckout,
  getOrderPlaced,
  getMyOrders,
  getOrderDetails,
  editAddress,
  deleteAddress,
  addToWishlist2,
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


/* ----------------------Wishlist page-----------------------------*/

//get wishlist page
router.get("/wishlist", verifyLoggedIn, checkBan, getWishlist);

//add to wishlist
router.get("/wishlist/add/:id", verifyLoggedIn, checkBan,addToWishlist);
//add to wishlist2
router.get("/wishlist/add2/:id", verifyLoggedIn, checkBan,addToWishlist2);

//remove from wishlist
router.get("/wishlist/remove/:id", verifyLoggedIn, checkBan,removeFromWishlist);
router.get("/wishlist/remove2/:id", verifyLoggedIn, checkBan,removeFromWishlist2);

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

/* -------------------Checkout page----------------------*/

//get checkout page
router.get("/cart/checkout", verifyLoggedIn, checkBan, getCheckout);
router.post("/cart/checkout", verifyLoggedIn, checkBan, postCheckout);
router.get("/orderPlaced",verifyLoggedIn, checkBan, getOrderPlaced)

/* -------------------User profile----------------------*/


/* ------------Address----------------*/


// add address
router.post('/profile/addAddress',verifyLoggedIn, checkBan,addAddress)
// edit address
router.post('/profile/editAddress/:id',verifyLoggedIn, checkBan,editAddress)
// delete address
router.get('/profile/deleteAddress/:id',verifyLoggedIn,checkBan,deleteAddress)

/* ------------xxxxxx----------------*/


// get order history page
router.get("/profile/myOrders",verifyLoggedIn, checkBan,getMyOrders)
// get order details page
router.get("/profile/myOrders/:id",verifyLoggedIn, checkBan,getOrderDetails)


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
