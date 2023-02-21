const express = require("express");
const router = express.Router();

const {
  getPanel,
  verifyLoggedIn,
  verifyLoggedOut,
  getLogin,
  validateAdmin,
  doLogout,
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
} = require("../controllers/adminControllers");


// get admin panel
router.get("/", verifyLoggedIn, getPanel);
// post admin panel
router.post("/", doLogout);

// get admin login
router.get("/adminLogin", verifyLoggedOut, getLogin);
// post admin login
router.post("/adminLogin", validateAdmin);


//----------get user management-----------//
router.get('/userM',verifyLoggedIn,getUserM)
//block or unblock user
router.get('/userM/:id',verifyLoggedIn,blockUser)

//---------get product management---------//
router.get('/productM',verifyLoggedIn,getProductM)
// get add product
router.get('/productM/addProduct',verifyLoggedIn,getAddProduct)

//---------get category management--------//
router.get('/categoryM',verifyLoggedIn,getCategoryM)
// get add category page
router.get('/categoryM/addCategory',verifyLoggedIn,getAddCategory)
//post add category
router.post('/categoryM/addCategory',verifyLoggedIn,addCategory)
// get edit category page
router.get('/categoryM/editCategory/:id',verifyLoggedIn,getEditCategory)
//post edit category
router.post('/categoryM/editCategory',verifyLoggedIn,editCategory)
// unlist category
router.get('/categoryM/unList/:id',verifyLoggedIn,unListCategory)
// list category
router.get('/categoryM/list/:id',verifyLoggedIn,listCategory)



module.exports = router;
