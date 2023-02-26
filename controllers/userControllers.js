const mongoose = require("mongoose");
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");

module.exports = {
  getHome: (req, res) => {
    let user = req.session.user;
    res.render("user/home", { user });
  },
  getShop: async (req, res) => {
    let user = req.session.user;
    try {
      let products = await Product.find().lean();
      let categories = await Category.find().lean();
      let authors = await Product.aggregate([
        { $group: { _id: "$author"} },
      ])

      res.render("user/shop", { user, products, categories,authors });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  },
  getProductDetails:async(req,res) => {
    let user = req.session.user;
    let productId = req.params.id
    try {
      let product = await Product.findById(productId)

      res.render('user/productDetails',{user,product})
    } catch (err) {
      console.log(err);
      res.redirect('back')
    }
  },
};
