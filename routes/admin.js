const express = require("express");
const router = express.Router();

//-----------------------------------Middlewares-------------------------------------------//

const { verfiyLoggedIn } = require("../middlewares/verifyAdminLoggedIn");
const { verifyLoggedOut } = require("../middlewares/verifyAdminLoggedOut");

//-----------------------------------Controllers-------------------------------------------//
const { getLogin, doLogout, validateAdmin } = require('../controllers/adminAuthControllers');
const {
  getUserM,
  blockUser,
  getProductM,
  getAddProduct,
  getCategoryM,
  getAddCategory,
  addCategory,
  listCategory,
  unListCategory,
  getEditCategory,
  editCategory,
  getPanel,
} = require("../controllers/adminControllers");




// get admin panel
router.get("/", verfiyLoggedIn,getPanel);
// post admin panel
router.post("/", doLogout);

// get admin login
router.get("/adminLogin", verifyLoggedOut, getLogin);
// post admin login
router.post("/adminLogin", validateAdmin);


//---------- user management-----------//

// get user management page
router.get('/userM',verfiyLoggedIn,getUserM)
//block or unblock user
router.get('/userM/:id',verfiyLoggedIn,blockUser)

//--------- product management---------//

//get product management page
router.get('/productM',verfiyLoggedIn,getProductM)
// get add product
router.get('/productM/addProduct',verfiyLoggedIn,getAddProduct)

//--------- category management--------//

//get category page
router.get('/categoryM',verfiyLoggedIn,getCategoryM)
// get add category page
router.get('/categoryM/addCategory',verfiyLoggedIn,getAddCategory)
// post add category
router.post('/categoryM/addCategory',verfiyLoggedIn,addCategory)
// get edit category page
router.get('/categoryM/editCategory/:id',verfiyLoggedIn,getEditCategory)
// post edit category
router.post('/categoryM/editCategory',verfiyLoggedIn,editCategory)
// unlist category
router.get('/categoryM/unList/:id',verfiyLoggedIn,unListCategory)
// list category
router.get('/categoryM/list/:id',verfiyLoggedIn,listCategory)



module.exports = router;
