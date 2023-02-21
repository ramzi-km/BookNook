const mongoose = require("mongoose");
const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");

let addCategoryError = null;
let editCategoryError = null;

module.exports = {
  getPanel: async (req, res) => {
    try {
      let admin = req.session.admin;
      let users = await User.find().lean();
      res.render("admin/adminpanel", { admin, users });
    } catch (error) {
      console.log(error);
    }
  },
  //user management
  getUserM: async (req, res) => {
    let admin = req.session.admin;
    let users = await User.find().lean();
    res.render("admin/userm", { admin, users });
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
  //product management
  getProductM: async (req, res) => {
    let admin = req.session.admin;
    let products = await Product.find().lean();
    res.render("admin/productm", { admin, products });
  },
  //get add product page
  getAddProduct: (req, res) => {
    let admin = req.session.admin;
    res.render("admin/addProduct", { admin });
  },

  //category management
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
};
