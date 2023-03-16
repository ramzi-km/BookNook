const mongoose = require("mongoose");

//-------------Models--------------//
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const User = require("../models/userModel.js");
const Order = require("../models/orderModel.js");
//---------------xx--------------------//

//-------------------------helpers-------------------------------//

function createId() {
  let date = new Date();
  let components = [
    date.getYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  ];

  let id = "id" + components.join("");
  return id;
}
let stockError = false;
let addressError = false;

//-------------------------------------------------------------//

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
    let productInCart = [];
    let productInWishlist = [];
    if (user) {
      productInCart = await User.find(
        {
          _id: user._id,
          cart: { $elemMatch: { id: productId } },
        },
        { cart: 1 }
      );
      productInWishlist = await User.find({
        _id: user._id,
        wishlist: productId,
      });
    } else {
      productInCart = [];
      productInWishlist = [];
    }

    try {
      let product = await Product.findById(productId);

      res.render("user/productDetails", {
        user,
        product,
        productInCart,
        productInWishlist,
      });
    } catch (err) {
      res.send(err);
    }
  },
  //----------------xx---------------------------//

  //--------------Whishlist page----------//

  //get wishlist page
  getWishlist: async (req, res) => {
    const userId = req.session.user._id;
    try {
      const user = await User.findById(userId);
      let wishlist = user.wishlist;
      const products = await Product.find({
        _id: { $in: wishlist },
        unList: false,
      }).lean();

      res.render("user/wishlist", { user, products });
    } catch (error) {
      res.send(error);
    }
  },
  // remove from wishlist
  removeFromWishlist: async (req, res) => {
    let userId = req.session.user._id;
    let prodId = req.params.id;
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: {
          wishlist: prodId,
        },
      });
      res.redirect("back");
    } catch (error) {
      res.send(error);
    }
  },
  removeFromWishlist2: async (req, res) => {
    let userId = req.session.user._id;
    let prodId = req.params.id;
    try {
      let user = await User.updateOne(
        { _id: userId },
        {
          $pull: {
            wishlist: prodId,
          },
        }
      );
      res.json({ user });
    } catch (error) {
      res.send(error);
    }
  },
  // add to wishlist
  addToWishlist: async (req, res) => {
    const userId = req.session.user._id;
    const prodId = req.params.id;
    try {
      let user = await User.updateOne(
        { _id: userId },
        {
          $addToSet: {
            wishlist: prodId,
          },
        }
      );
      res.json({ user });
    } catch (error) {
      res.send(error);
    }
  },

  //----------------xx---------------------------//

  //-------------------Cart page-----------------//
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
        totalPrice = totalPrice + item.price * item.cartQuantity;
      });

      let totalMrp = 0;

      products.forEach((item, index) => {
        totalMrp = totalMrp + item.mrp * item.cartQuantity;
      });

      res.render("user/cart", {
        user,
        products,
        totalPrice,
        totalMrp,
        stockError,
      });
      stockError = false;
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
    try {
      const userId = req.session.user._id;
      const { cart } = await User.findOne(
        {
          _id: userId,
          cart: { $elemMatch: { id: req.params.id } },
        },
        { _id: 0, "cart.$": 1 }
      );

      let quantity = cart[0].quantity;
      if (quantity > 8) {
        res.json({ quantity, success: true, increased: false });
      } else {
        const user = await User.updateOne(
          { _id: userId, cart: { $elemMatch: { id: req.params.id } } },
          {
            $inc: {
              "cart.$.quantity": 1,
            },
          }
        );
        if (user.acknowledged) {
          quantity++;
          res.json({ quantity, success: true, increased: true });
        } else {
          res.json({ success: false, increased: false });
        }
      }
    } catch (error) {
      res.json({ error, success: false });
    }
  },

  // Decrease quantity
  decreaseQuantity: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const { cart } = await User.findOne(
        {
          _id: userId,
          cart: { $elemMatch: { id: req.params.id } },
        },
        { _id: 0, "cart.$": 1 }
      );
      let quantity = cart[0].quantity;

      if (quantity <= 1) {
        res.json({ quantity, success: true, decreased: false });
      } else {
        const user = await User.updateOne(
          { _id: userId, cart: { $elemMatch: { id: req.params.id } } },
          {
            $inc: {
              "cart.$.quantity": -1,
            },
          }
        );
        if (user.acknowledged) {
          quantity--;
          res.json({ quantity, success: true, decreased: true });
        } else {
          res.json({ success: false, decreased: false });
        }
      }
    } catch (error) {
      res.json({ error, success: false });
    }
  },

  //----------------xx---------------------------//

  //--------------Checkout page----------//

  //get checkout page
  getCheckout: async (req, res) => {
    const userId = req.session.user._id;
    try {
      const user = await User.findById(userId);
      let address = user.address;
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
      stockError = false;
      products.forEach((product, index) => {
        product.cartQuantity = cartQuantities[product._id];
        totalPrice = totalPrice + product.price * product.cartQuantity;
        if (product.inStock < product.cartQuantity) {
          stockError = true;
        } else {
        }
      });
      if (stockError || !products[0]) {
        res.redirect("/cart");
      } else {
        res.render("user/checkout", {
          user,
          address,
          products,
          totalPrice,
          addressError,
        });
        addressError = false;
      }
    } catch (error) {
      res.send(error);
    }
  },

  postCheckout: async (req, res) => {
    if (req.body.address == "empty") {
      addressError = true;
      res.redirect("/cart/checkout");
    } else {
      const userId = req.session.user._id;
      const payment = req.body.paymentType;
      const addressId = req.body.address;
      try {
        let { address } = await User.findOne(
          { _id: userId },
          { _id: 0, address: { $elemMatch: { id: addressId } } }
        );
        if (payment == "cod") {
          let user = await User.findById(userId);
          let cart = user.cart;
          const cartQuantities = {};
          const cartList = cart.map((item) => {
            cartQuantities[item.id] = item.quantity;
            return item.id;
          });

          let products = await Product.find({
            _id: { $in: cartList },
            unlist: false,
          }).lean();

          let orders = [];
          let i = 1;
          let orderCount = await Order.find().count();
          for (let product of products) {
            await Product.updateOne(
              { _id: product._id },
              {
                $inc: {
                  inStock: -1 * cartQuantities[product._id],
                },
              }
            );
            orders.push({
              address: address[0],
              product: product,
              userId: userId,
              quantity: cartQuantities[product._id],
              total: cartQuantities[product._id] * product.price,
              amountToPay: cartQuantities[product._id] * product.price,
              paymentType: "cod",
              orderId: orderCount + i,
            });
            i++;
          }
          await Order.create(orders);
          await User.findByIdAndUpdate(userId, {
            $set: { cart: [] },
          });
          res.redirect("/orderPlaced");
        } else {
          res.redirect("/cart/checkout");
        }
      } catch (error) {
        res.send(error);
      }
    }
  },

  //get order placed page
  getOrderPlaced: (req, res) => {
    const user = req.session.user;
    res.render("user/orderPlaced", { user });
  },
  //----------------xx---------------------------//

  //--------------Profile page----------//

  //add user address
  addAddress: async (req, res) => {
    const userId = req.session.user._id;
    const { name, mobile, address, city, state, pinCode } = req.body;
    await User.updateOne(
      { _id: userId },
      {
        $addToSet: {
          address: {
            name,
            mobile,
            address,
            city,
            state,
            pinCode,
            id: createId(),
          },
        },
      }
    );
    res.redirect("back");
  },

  // edit address
  editAddress: async (req, res) => {
    let userId = req.session.user._id;
    let addressId = req.params.id;
    const { name, mobile, address, city, state, pinCode } = req.body;
    try {
      await User.updateOne(
        { _id: userId, address: { $elemMatch: { id: addressId } } },
        {
          $set: {
            "address.$": {
              name,
              mobile,
              address,
              city,
              state,
              pinCode,
              id: addressId,
            },
          },
        }
      );
      res.redirect("back");
    } catch (error) {
      res.send(error);
    }
  },

  //delete address
  deleteAddress: async (req, res) => {
    let userId = req.session.user._id;
    let addressId = req.params.id;
    try {
      await User.updateOne(
        { _id: userId, address: { $elemMatch: { id: addressId } } },
        {
          $pull: {
            address: {
              id: addressId,
            },
          },
        }
      );
      res.redirect("back");
    } catch (error) {
      res.send(error);
    }
  },

  // get my orders page
  getMyOrders: async (req, res) => {
    const userId = req.session.user._id;
    const user = req.session.user;
    const orders = await Order.find({ userId: userId })
      .sort({ _id: -1 })
      .lean();
    res.render("user/myOrders", { user, orders });
  },

  // get order details page
  getOrderDetails: async (req, res) => {
    const userId = req.session.user._id;
    const user = req.session.user;
    const orderId = req.params.id;

    const [order] = await Order.find({ userId: userId, _id: orderId });

    console.log(order);
    res.render("user/orderDetails", { user, order });
  },

  //----------------xx---------------------------//
};
