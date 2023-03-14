const mongoose = require("mongoose");
const multer = require("multer");
//------------------------------ Models-----------------------------//

const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const Coupon = require("../models/couponModel.js");
const Order = require("../models/orderModel.js");

//----------------------------------------------------------------//

//-------------------------middlewares----------------------------//

const { uploadImages } = require("../middlewares/multer.js");

//----------------------------------------------------------------//

//-------------------------helpers-------------------------------//

function getImageFieldsToUpdate(files) {
  const fields = {};
  if (files.mainImage) fields.mainImage = files.mainImage;
  if (files.coverImage) fields.coverImage = files.coverImage;
  if (files.extraImages) fields.extraImages = files.extraImages;
  return fields;
}

function formattedDate(d) {
  let month = String(d.getMonth() + 1);
  let day = String(d.getDate());
  const year = String(d.getFullYear());

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return `${year}-${month}-${day}`;
}

//-------------------------------------------------------------//

let addCategoryError = null;
let editCategoryError = null;
let addProductMessage = null;
let addProductFailMessage = null;
let editProductMessage = null;
let editProductFailMessage = null;
let imageFileError = null;

module.exports = {
  getPanel: async (req, res) => {
    try {
      let admin = req.session.admin;
      let users = await User.find().lean();
      res.render("admin/adminPanel", { admin, users });
    } catch (error) {
      console.log(error);
    }
  },
  //------------------------------ user management-----------------------------//

  getUserM: async (req, res) => {
    let admin = req.session.admin;
    let users = await User.find().lean();
    res.render("admin/userM", { admin, users });
  },
  //block or unblock user
  blockUser: async (req, res) => {
    let userId = req.params.id;
    //bUser = blocking or unblocking user
    let bUser = await User.findById(userId);

    if (bUser.block) {
      bUser.block = false;
      await bUser.save();
      res.redirect("/admin/userM");
    } else {
      bUser.block = true;
      await bUser.save();
      res.redirect("/admin/userM");
    }
  },
  //--------------------------- product management----------------------------//

  getProductM: async (req, res) => {
    let admin = req.session.admin;
    try {
      let products = await Product.find().lean();
      res.render("admin/productM", {
        admin,
        products,
        message: addProductMessage,
        failMessage: addProductFailMessage,
        editMessage: editProductMessage,
        editFailMessage: editProductFailMessage,
      });
      addProductMessage = null;
      addProductFailMessage = null;
      editProductFailMessage = null;
      editProductMessage = null;
    } catch (error) {
      res.send(error);
    }
  },
  //get add product page
  getAddProduct: async (req, res) => {
    let admin = req.session.admin;
    try {
      let categories = await Category.find().lean();
      res.render("admin/addProduct", {
        admin,
        categories,
        imageError: imageFileError,
      });
      imageFileError = null;
    } catch (error) {
      res.send(error);
    }
  },
  //post add product page
  addProduct: async (req, res) => {
    uploadImages(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // a multer error occured when uploading
        imageFileError = "choose only image files";
        res.redirect("/admin/productM/addProduct");
        return;
      } else if (err) {
        // an unknown error occured while uploading
        imageFileError =
          "error occured when uplaoding images,make sure you only chose 3 images on the side images input and all the chosen files are image files";
        res.redirect("/admin/productM/addProduct");
        return;
      }
      // everything went fine
      try {
        const fields = {
          name: req.body.name,
          author: req.body.author,
          category: req.body.category,
          mrp: req.body.mrp,
          price: req.body.price,
          inStock: req.body.inStock,
          description: req.body.description,
          richDescription: req.body.richDescription,
          mainImage: req.files.mainImage,
          coverImage: req.files.coverImage,
          extraImages: req.files.extraImages,
        };
        console.log(req.body);
        console.log(req.files);
        console.log(fields);
        const newProduct = new Product(fields);
        await newProduct.save();
        imageFileError = null;
        addProductMessage = "product added successfully";
        res.redirect("/admin/productM");
      } catch (err) {
        addProductFailMessage = "Failed to add product";
        res.redirect("/admin/productM");
      }
    });
  },
  // get edit product page
  getEditProduct: async (req, res) => {
    let admin = req.session.admin;
    try {
      const categories = await Category.find().lean();
      const product = await Product.findOne({ _id: req.params.id });
      req.session.editingProduct = product;
      res.render("admin/editProduct", {
        categories,
        admin,
        product,
        imageError: imageFileError,
      });
      imageFileError = null;
    } catch (error) {
      res.send(error);
    }
  },
  // post edit product page
  editProduct: (req, res) => {
    uploadImages(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // a multer error occured when uploading
        imageFileError = "choose only image files";
        res.redirect(`/admin/productM/editProduct/${req.params.id}`);
        return;
      } else if (err) {
        // an unknown error occured while uploading
        imageFileError =
          "error occured when uploading images,make sure you only chose 3 images on side images input and all the chosen files are image files";
        res.redirect(`/admin/productM/editProduct/${req.params.id}`);
        return;
      }

      // everything went fine //
      try {
        let productId = req.params.id;
        const fieldsToUpdate = {
          name: req.body.name,
          author: req.body.author,
          category: req.body.category,
          mrp: req.body.mrp,
          price: req.body.price,
          inStock: req.body.inStock,
          description: req.body.description,
          richDescription: req.body.richDescription,
        };
        await Product.updateOne({ _id: productId }, fieldsToUpdate);

        const imageFieldsToUpdate = getImageFieldsToUpdate(req.files);
        if (Object.keys(imageFieldsToUpdate).length > 0) {
          await Product.updateOne({ _id: productId }, imageFieldsToUpdate);
        }
        editProductMessage = "Product edited successfully";
        imageFileError = null;
        res.redirect("/admin/productM");
      } catch (error) {
        editProductFailMessage = "Failed to edit product";
        res.redirect("/admin/productM");
      }
    });
  },
  // delete extra images individually
  deleteExtraImage: async (req, res) => {
    let imageName = req.params.imageName;
    let prodId = req.params.prodId;
    await Product.findByIdAndUpdate(prodId, {
      $pull: { extraImages: { filename: imageName } },
    });
    console.log(prodId);
    res.redirect("back");
  },

  // unlist product
  unListProduct: async (req, res) => {
    try {
      let productId = req.params.id;
      let product = await Product.findById(productId);
      product.unList = true;
      await product.save();
      res.redirect("/admin/productM");
    } catch (error) {
      res.send(error);
    }
  },
  //list product
  listProduct: async (req, res) => {
    try {
      let productId = req.params.id;
      let product = await Product.findById(productId);
      product.unList = false;
      await product.save();
      res.redirect("/admin/productM");
    } catch (error) {
      res.send(error);
    }
  },

  //-------------------------- category management------------------------//

  getCategoryM: async (req, res) => {
    let admin = req.session.admin;
    let categories = await Category.find().lean();
    res.render("admin/categoryM", { admin, categories });
  },
  //get add category page
  getAddCategory: (req, res) => {
    let admin = req.session.admin;
    res.render("admin/addCategory", { admin, error: addCategoryError });
    addCategoryError = null;
  },
  //add category
  addCategory: async (req, res) => {
    req.body.category = req.body.category.toLowerCase();
    let categoryName =
      req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1);
    let category = await Category.findOne({ name: categoryName });
    if (category) {
      addCategoryError = "category already exist";
      res.redirect("/admin/categoryM/addCategory");
    } else {
      const newCategory = await Category.create({ name: categoryName });
      res.redirect("/admin/categoryM");
    }
  },
  //get edit category page
  getEditCategory: async (req, res) => {
    let admin = req.session.admin;
    const category = await Category.findOne({ _id: req.params.id });
    req.session.editingCategory = category;
    res.render("admin/editCategory", {
      category,
      admin,
      error: editCategoryError,
    });
    editCategoryError = null;
  },
  //edit category
  editCategory: async (req, res) => {
    req.body.category = req.body.category.toLowerCase();
    let categoryName =
      req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1);

    let categoryExist = await Category.findOne({ name: categoryName });

    if (req.session.editingCategory.name == categoryName) {
      res.redirect("/admin/categoryM");
    } else if (categoryExist) {
      editCategoryError = "category already exist";
      res.redirect(
        "/admin/categoryM/editCategory/" + req.session.editingCategory._id
      );
    } else {
      await Category.updateOne(
        { _id: req.session.editingCategory._id },
        { name: categoryName }
      );
      req.session.editingCategory = null;
      editCategoryError = null;
      res.redirect("/admin/categoryM");
    }
  },
  //unList Category
  unListCategory: async (req, res) => {
    let categoryId = req.params.id;
    let category = await Category.findById(categoryId);
    category.unList = true;
    await category.save();
    res.redirect("/admin/categoryM");
  },
  //list category
  listCategory: async (req, res) => {
    let categoryId = req.params.id;
    let category = await Category.findById(categoryId);
    category.unList = false;
    await category.save();
    res.redirect("/admin/categoryM");
  },

  //--------------------------- Coupon management----------------------------//

  // get coupon management page
  getCouponM: async (req, res) => {
    let admin = req.session.admin;
    let coupons = await Coupon.find().lean();
    res.render("admin/couponM", { admin, coupons });
  },
  // get coupon add page
  getAddCoupon: (req, res) => {
    let admin = req.session.admin;
    res.render("admin/addCoupon", { admin });
  },
  // post coupon add page
  addCoupon: async (req, res) => {
    try {
      const newCoupon = await Coupon.create(req.body);
      res.redirect("/admin/couponM");
    } catch (err) {
      console.log(err);
      res.redirect("/admin/couponM");
    }
  },
  // get edit coupon page
  getEditCoupon: async (req, res) => {
    let admin = req.session.admin;
    try {
      const coupon = await Coupon.findById(req.params.id);
      let expiryDate = formattedDate(coupon.expiryDate);
      res.render("admin/editCoupon", { admin, coupon, expiryDate });
    } catch (err) {
      console.log(err);
      res.redirect("/admin/couponM");
    }
  },
  // post edit coupon page
  editCoupon: async (req, res) => {
    let couponId = req.params.id;
    try {
      const coupon = await Coupon.updateOne({ _id: couponId }, req.body);
      res.redirect("/admin/couponM");
    } catch (err) {
      res.redirect("/admin/couponM");
    }
  },
  //unList Coupon
  unListCoupon: async (req, res) => {
    let couponId = req.params.id;
    let coupon = await Coupon.findById(couponId);
    coupon.unList = true;
    await coupon.save();
    res.redirect("/admin/couponM");
  },
  //list Coupon
  listCoupon: async (req, res) => {
    let couponId = req.params.id;
    let coupon = await Coupon.findById(couponId);
    coupon.unList = false;
    await coupon.save();
    res.redirect("/admin/couponM");
  },

  //--------------------------- Order management----------------------------//

  // get order management page
  getOrderM: async (req, res) => {
    let admin = req.session.admin;
    let orders = await Order.find().lean();
    res.render("admin/orderM", { admin, orders });
  },

  // get order view page
  getOrderView: async (req, res) => {
    let admin = req.session.admin;
    let objectId = req.params.id;
    try {
      let order = await Order.findById(objectId).lean();
      res.render("admin/viewOrder", { admin, order });
    } catch (error) {
      res.send(error);
    }
  },
  // update order status
  updateOrderStatus: async (req, res) => {
    let status = req.body.status;
    let objectId = req.params.id;
    try {
      let order = await Order.findById(objectId);
      if (status == "delivered") {
        order.paid = true;
        order.amountToPay = 0;
      }
      order.status = status;
      order.save();
      res.redirect("/admin/orderM");
    } catch (error) {
      res.send(error);
    }
  },
};
