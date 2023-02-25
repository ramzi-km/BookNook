const mongoose = require("mongoose");
const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const Coupon = require("../models/couponModel.js");

let addCategoryError = null;
let editCategoryError = null;
let addProductMessage = null;

function formattedDate(d) {
  let month = String(d.getMonth() + 1);
  let day = String(d.getDate());
  const year = String(d.getFullYear());

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return `${year}-${month}-${day}`;
}

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
    let products = await Product.find().lean();
    res.render("admin/productM", {
      admin,
      products,
      message: addProductMessage,
    });
    addProductMessage = null;
  },
  //get add product page
  getAddProduct: async (req, res) => {
    let admin = req.session.admin;
    let categories = await Category.find().lean();
    res.render("admin/addProduct", { admin, categories });
  },
  //post add product page
  addProduct: async (req, res) => {
    try {
      const newProduct = await Product.create({
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
      });
      addProductMessage = "product added successfully";
      res.redirect("/admin/productM");
    } catch (err) {
      console.log(err);
    }
  },
  // get edit product page
  getEditProduct: async (req, res) => {
    let admin = req.session.admin;
    const categories = await Category.find().lean();
    const product = await Product.findOne({ _id: req.params.id });
    req.session.editingProduct = product;
    res.render("admin/editProduct", {
      categories,
      admin,
      product,
    });
  },
  // post edit product page
  editProduct: async (req, res) => {
    let productId = req.params.id;
    if (req.files.mainImage && req.files.coverImage && req.files.extraImages) {
      await Product.updateOne(
        { _id: productId },
        {
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
        }
      );
      res.redirect("/admin/productM");
    } else if (
      req.files.mainImage &&
      req.files.coverImage &&
      !req.files.extraImages
    ) {
      await Product.updateOne(
        { _id: productId },
        {
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
        }
      );
      res.redirect("/admin/productM");
    } else if (
      req.files.mainImage &&
      !req.files.coverImage &&
      req.files.extraImages
    ) {
      await Product.updateOne(
        { _id: productId },
        {
          name: req.body.name,
          author: req.body.author,
          category: req.body.category,
          mrp: req.body.mrp,
          price: req.body.price,
          inStock: req.body.inStock,
          description: req.body.description,
          richDescription: req.body.richDescription,
          mainImage: req.files.mainImage,
          extraImages: req.files.extraImages,
        }
      );
      res.redirect("/admin/productM");
    } else if (
      !req.files.mainImage &&
      req.files.coverImage &&
      req.files.extraImages
    ) {
      await Product.updateOne(
        { _id: productId },
        {
          name: req.body.name,
          author: req.body.author,
          category: req.body.category,
          mrp: req.body.mrp,
          price: req.body.price,
          inStock: req.body.inStock,
          description: req.body.description,
          richDescription: req.body.richDescription,
          coverImage: req.files.coverImage,
          extraImages: req.files.extraImages,
        }
      );
      res.redirect("/admin/productM");
    } else if (
      !req.files.mainImage &&
      !req.files.coverImage &&
      req.files.extraImages
    ) {
      await Product.updateOne(
        { _id: productId },
        {
          name: req.body.name,
          author: req.body.author,
          category: req.body.category,
          mrp: req.body.mrp,
          price: req.body.price,
          inStock: req.body.inStock,
          description: req.body.description,
          richDescription: req.body.richDescription,
          extraImages: req.files.extraImages,
        }
      );
      res.redirect("/admin/productM");
    } else if (
      !req.files.mainImage &&
      req.files.coverImage &&
      !req.files.extraImages
    ) {
      await Product.updateOne(
        { _id: productId },
        {
          name: req.body.name,
          author: req.body.author,
          category: req.body.category,
          mrp: req.body.mrp,
          price: req.body.price,
          inStock: req.body.inStock,
          description: req.body.description,
          richDescription: req.body.richDescription,
          coverImage: req.files.coverImage,
        }
      );
      res.redirect("/admin/productM");
    } else if (
      req.files.mainImage &&
      !req.files.coverImage &&
      !req.files.extraImages
    ) {
      await Product.updateOne(
        { _id: productId },
        {
          name: req.body.name,
          author: req.body.author,
          category: req.body.category,
          mrp: req.body.mrp,
          price: req.body.price,
          inStock: req.body.inStock,
          description: req.body.description,
          richDescription: req.body.richDescription,
          mainImage: req.files.mainImage,
        }
      );
      res.redirect("/admin/productM");
    } else if (
      !req.files.mainImage &&
      !req.files.coverImage &&
      !req.files.extraImages
    ) {
      await Product.updateOne(
        { _id: productId },
        {
          name: req.body.name,
          author: req.body.author,
          category: req.body.category,
          mrp: req.body.mrp,
          price: req.body.price,
          inStock: req.body.inStock,
          description: req.body.description,
          richDescription: req.body.richDescription,
        }
      );
      res.redirect("/admin/productM");
    }
  },
  // unlist product
  unListProduct: async (req, res) => {
    let productId = req.params.id;
    let product = await Product.findById(productId);
    product.unList = true;
    await product.save();
    res.redirect("/admin/productM");
  },
  //list product
  listProduct: async (req, res) => {
    let productId = req.params.id;
    let product = await Product.findById(productId);
    product.unList = false;
    await product.save();
    res.redirect("/admin/productM");
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
    let category = await Category.findOne({ name: req.body.category });
    if (category) {
      addCategoryError = "category already exist";
      res.redirect("/admin/categoryM/addCategory");
    } else {
      const newCategory = await Category.create({ name: req.body.category });
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
    let categoryExist = await Category.findOne({ name: req.body.category });
    if (req.session.editingCategory.name == req.body.category) {
      res.redirect("/admin/categoryM");
    } else if (categoryExist) {
      editCategoryError = "category already exist";
      res.redirect(
        "/admin/categoryM/editCategory/" + req.session.editingCategory._id
      );
    } else {
      await Category.updateOne(
        { _id: req.session.editingCategory._id },
        { name: req.body.category }
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
};
