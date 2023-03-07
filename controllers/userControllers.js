const mongoose = require("mongoose");

//-------------Models--------------//
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const User = require("../models/userModel.js");
//---------------xx--------------------//

module.exports = {
  //----------------Home------------------//
  getHome: (req, res) => {
    let user = req.session.user;
    res.render("user/home", { user });
  },
  //---------------xx--------------------//

  //-------------product listing--------------//
  getShop: async (req, res) => {
    let user = req.session.user;
    const category = req.query.category ?? "";
    const search = req.query.search ?? "";
    const sort = req.query.sort ?? 0;
    const price = req.query.price ?? "";
    let page = Number(req.query.page ?? 0);
    page = Math.max(page, 0);

    try {
      let categoryFilter = await Category.find({
        unList: false,
        name: new RegExp(category, "i"),
      }).lean();
      let categoryArray = categoryFilter.map((category) => category.name);

      const findConditions = {
        unList: false,
        category: { $in: categoryArray },
        name: new RegExp(search, "i"),
      };
      if (price === "1") {
        findConditions.price = { $gt: 99, $lt: 501 };
      } else if (price === "2") {
        findConditions.price = { $gt: 500, $lt: 1501 };
      } else if (price === "3") {
        findConditions.price = { $gt: 1500 };
      }
      const products = await Product.find(findConditions)
        .sort(sort == "0" ? { createdAt: -1 } : { price: sort })
        .skip(page * 9)
        .limit(9)
        .lean();
      const productCount = await Product.find(findConditions).lean().count();

      let categories = await Category.find({ unList: false }).lean();
      let pageCount = Math.ceil(productCount / 9);
      res.render("user/shop", {
        user,
        products,
        categories,
        category,
        search,
        sort,
        price,
        page,
        pageCount,
      });
    } catch (err) {
      res.send(err);
    }
  },
  //-------------xx--------------//

  //--------------product details page----------//
  getProductDetails: async (req, res) => {
    let user = req.session.user;
    let productId = req.params.id;
    try {
      let product = await Product.findById(productId);

      res.render("user/productDetails", { user, product });
    } catch (err) {
      res.send(err);
    }
  },
  //----------------xx---------------------------//

  //--------------Cart page----------//
  getCart: async (req, res) => {
    let userId = req.session.user._id;
    try {
      let user = await User.findById(userId);
      let cart = user.cart;
      const cartQuantities = {};
      const cartList = cart.map((item) => {
        cartQuantities[item.id] = item.quantity;
        return item.id;
      });

      const products = await Product.find({
        _id: { $in: cartList },
        unlist: false,
      }).lean();

      let totalPrice = 0;

      products.forEach((item, index) => {
        item.cartQuantity = cartQuantities[item._id];
        totalPrice = totalPrice + item.price * cartQuantities[item._id];
      });

      let totalMrp = 0;

      products.forEach((item, index) => {
        totalMrp = totalMrp + item.mrp * cartQuantities[item._id];
      });

      res.render("user/cart", { user, products, totalPrice, totalMrp });
    } catch (error) {
      res.send(error);
    }
  },

  //add product to cart
  addToCart: async (req, res) => {
    const userId = req.session.user._id;
    const prodId = req.params.id;
    try {
      const prodExist = await User.find({ _id: userId, "cart.id": prodId });
      if (prodExist[0]) {
        res.redirect("/cart");
      } else {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { cart: { id: prodId, quantity: 1 } },
        });
        res.redirect("/cart");
      }
    } catch (error) {
      res.send(error);
    }
  },

  // remove product from cart
  removeFromCart: async (req, res) => {
    const userId = req.session.user._id;
    const prodId = req.params.id;
    console.log(userId, prodId);
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { cart: { id: prodId } },
      });
      res.redirect("/cart");
    } catch (error) {
      res.send(error);
    }
  },

  // Increase quantity
  increaseQuantity: async (req, res) => {
    const userId = req.session.user._id;
    const user = await userModel.updateOne(
      { _id: userId, cart: { $elemMatch: { id: req.params.id } } },
      {
        $inc: {
          "cart.$.quantity": 1,
        },
      }
    );
    res.redirect("/cart");
  },

  // Decrease quantity
  decreaseQuantity: async (req, res) => {
    const userId = req.session.user._id;
    let { cart } = await userModel.findOne(
      {_id:userId, "cart.id": req.params.id },
      { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
    );
    if (cart[0].quantity <= 1) {
      res.redirect('/cart')
    }
    let user = await userModel.updateOne(
      { _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } },
      {
        $inc: {
          "cart.$.quantity": -1,
        },
      }
    );
    res.redirect('/cart')
  },

  //----------------xx---------------------------//
};
