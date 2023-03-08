const express = require("express");
const router = express.Router();
const multer = require("multer");

//-----------------------------------Middlewares-------------------------------------------//

const { verfiyLoggedIn, verifyLoggedOut } = require("../middlewares/adminAuth");

//-----------------------------------Controllers-------------------------------------------//

const {
  getLogin,
  doLogout,
  validateAdmin,
} = require("../controllers/adminAuthControllers");
const {
  getPanel,
  getUserM,
  blockUser,
  getProductM,
  listProduct,
  unListProduct,
  getAddProduct,
  addProduct,
  getEditProduct,
  editProduct,
  getCategoryM,
  listCategory,
  unListCategory,
  getAddCategory,
  addCategory,
  getEditCategory,
  editCategory,
  getCouponM,
  getAddCoupon,
  addCoupon,
  getEditCoupon,
  editCoupon,
  unListCoupon,
  listCoupon,
  getOrderM,
  getOrderView,
  updateOrderStatus,
  deleteExtraImage,
} = require("../controllers/adminControllers");

// get admin panel
router.get("/", verfiyLoggedIn, getPanel);
// post admin panel
router.post("/", doLogout);

// get admin login
router.get("/adminLogin", verifyLoggedOut, getLogin);
// post admin login
router.post("/adminLogin", verifyLoggedOut, validateAdmin);

//------------------------------ user management-----------------------------//

// get user management page
router.get("/userM", verfiyLoggedIn, getUserM);
//block or unblock user
router.get("/userM/:id", verfiyLoggedIn, blockUser);

//--------------------------- product management----------------------------//

//get product management page
router.get("/productM", verfiyLoggedIn, getProductM);
// get add product
router.get("/productM/addProduct", verfiyLoggedIn, getAddProduct);
// post add product
router.post("/productM/addProduct", verfiyLoggedIn, addProduct);

// get edit product page
router.get("/productM/editProduct/:id", verfiyLoggedIn, getEditProduct);
// post edit product page
router.post("/productM/editProduct/:id", verfiyLoggedIn, editProduct);
// delete extra images individually
router.get(
  "/productM/editProduct/deleteExtraImage/:prodId/:imageName",
  verfiyLoggedIn,
  deleteExtraImage
);

// Unlist product
router.get("/productM/unList/:id", verfiyLoggedIn, unListProduct);
// List product
router.get("/productM/list/:id", verfiyLoggedIn, listProduct);

//-------------------------- category management------------------------//

//get category page
router.get("/categoryM", verfiyLoggedIn, getCategoryM);
// get add category page
router.get("/categoryM/addCategory", verfiyLoggedIn, getAddCategory);
// post add category
router.post("/categoryM/addCategory", verfiyLoggedIn, addCategory);
// get edit category page
router.get("/categoryM/editCategory/:id", verfiyLoggedIn, getEditCategory);
// post edit category
router.post("/categoryM/editCategory", verfiyLoggedIn, editCategory);
// unlist category
router.get("/categoryM/unList/:id", verfiyLoggedIn, unListCategory);
// list category
router.get("/categoryM/list/:id", verfiyLoggedIn, listCategory);

//-------------------------- Coupon management------------------------//

// get coupon page
router.get("/couponM", verfiyLoggedIn, getCouponM);
// get coupon add page
router.get("/couponM/addCoupon", verfiyLoggedIn, getAddCoupon);
// post coupon add page
router.post("/couponM/addCoupon", verfiyLoggedIn, addCoupon);
// get coupon edit page
router.get("/couponM/editCoupon/:id", verfiyLoggedIn, getEditCoupon);
// post coupon edit page
router.post("/couponM/editCoupon/:id", verfiyLoggedIn, editCoupon);
// unlist coupon
router.get("/couponM/unList/:id", verfiyLoggedIn, unListCoupon);
// list category
router.get("/couponM/list/:id", verfiyLoggedIn, listCoupon);

//-------------------------- Order management------------------------//

// get order management page
router.get("/orderM", verfiyLoggedIn, getOrderM);
// update order status
router.post("/orderM/:id", verfiyLoggedIn, updateOrderStatus);
// get order views page
router.get("/orderM/viewOrder/:id", verfiyLoggedIn, getOrderView);

module.exports = router;
