const mongoose = require("mongoose");
const Razorpay = require("razorpay");

//-------------Models--------------//
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");
const Coupon = require("../models/couponModel.js");
const User = require("../models/userModel.js");
const Order = require("../models/orderModel.js");
//---------------xx--------------------//

//-------------------------helpers-------------------------------//

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

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
  getHome: async (req, res) => {
    let user = req.session.user;
    try {
      let bestProducts = await Order.aggregate([
        {
          $group: {
            _id: "$product._id",
            name: { $first: "$product.name" },
            category: { $first: "$product.category" },
            totalSold: { $sum: "$quantity" },
            name: { $first: "$product.name" },
            category: { $first: "$product.category" },
            author: { $first: "$product.author" },
            price: { $first: "$product.price" },
            mrp: { $first: "$product.mrp" },
            description: { $first: "$product.description" },
            cover: { $first: "$product.coverImage" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]);
      let latestProducts = await Product.find({ unList: false })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

      let products = await Product.find({ unList: false })
        .sort({ createdAt: -1 })
        .lean();

      let offerProducts = products.filter((product) => {
        if ((product.price / product.mrp) * 100 < 70) {
          return product;
        }
      });
      console.log(offerProducts);
      res.render("user/home", {
        user,
        bestProducts,
        latestProducts,
        offerProducts,
      });
    } catch (error) {
      res.send(error);
    }
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
  // add to wishlist
  addToWishlist2: async (req, res) => {
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
      res.redirect("/wishlist");
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
  // checking coupon code and  applying coupon
  applyCoupon: async (req, res) => {
    let couponCode = req.body.couponCode;
    try {
      let coupon = await Coupon.findOne({ code: couponCode });
      if (coupon) {
        const expiry = new Date(coupon.expiryDate);
        if (expiry < new Date()) {
          res.json({
            errorMessage: "Coupon expired",
            success: true,
            error: true,
          });
        } else {
          res.json({ success: true, coupon, error: false });
        }
      } else {
        res.json({
          errorMessage: "Invalid coupon code",
          success: true,
          error: true,
        });
      }
    } catch (error) {
      res.send(error);
    }
  },
  postCheckout: async (req, res) => {
    const userId = req.session.user._id;
    const payment = req.body.paymentType;
    const addressId = req.body.address;
    const amountToPay = req.body.amountToPay;
    if (req.body.address == "empty") {
      addressError = true;
      res.redirect("/cart/checkout");
    } else {
      try {
        let { address } = await User.findOne(
          { _id: userId },
          { _id: 0, address: { $elemMatch: { id: addressId } } }
        );
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
          if (payment == "cod") {
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
            req.session.orderSuccess = true;
            res.redirect("/orderPlaced");
          } else if (payment == "online") {
            let orders = [];
            for (let product of products) {
              orders.push({
                address: address[0],
                product: product,
                userId: userId,
                quantity: cartQuantities[product._id],
                total: cartQuantities[product._id] * product.price,
                amountToPay: 0,
                paymentType: "online",
                paid: true,
              });
              ``;
            }
            req.session.amountToPay = amountToPay;
            req.session.totalAmount = totalPrice;
            req.session.tempOrders = orders;
            req.session.pass = true;
            res.redirect("/paymentGateway");
          }
        }
      } catch (error) {
        res.send(error);
      }
    }
  },

  getPaymentGateway: async (req, res) => {
    if (req.session.tempOrders && req.session.pass) {
      let user = req.session.user;
      let totalAmount = req.session.totalAmount;
      let amountToPay = req.session.amountToPay;
      req.session.pass = null;
      res.render("user/paymentGateway", { user, totalAmount, amountToPay });
    } else {
      res.redirect("/cart/checkout");
    }
  },

  payment: async (req, res) => {
    let amount = req.session.amountToPay * 100;
    let receiptId = Math.floor(Math.random() * 100000) + Date.now();
    let options = {
      amount: amount, // amount in the smallest currency unit
      currency: "INR",
      receipt: receiptId,
    };
    instance.orders.create(options, function (err, order) {
      res.json({ success: true, key: process.env.KEY_ID, order });
    });
  },

  verifyPayment: async (req, res) => {
    instance.payments
      .fetch(req.body.razorpay_payment_id)
      .then(async (paymentDocument) => {
        if (paymentDocument.status == "captured") {
          try {
            let orders = req.session.tempOrders;
            let i = 1;
            let orderCount = await Order.find().count();
            for (let order of orders) {
              await Product.updateOne(
                { _id: order.product._id },
                {
                  $inc: {
                    inStock: -1 * order.quantity,
                  },
                }
              );
              order.payment = paymentDocument;
              order.orderId = orderCount + i;
              i++;
            }
            await Order.create(orders);
            await User.findByIdAndUpdate(req.session.user._id, {
              $set: { cart: [] },
            });
            req.session.amountToPay = null;
            req.session.totalAmount = null;
            req.session.tempOrders = null;
            req.session.orderSuccess = true;
            res.redirect("orderPlaced");
          } catch (error) {
            req.session.amountToPay = null;
            req.session.totalAmount = null;
            req.session.tempOrders = null;
            res.send(error);
          }
        } else {
          req.session.orderSuccess = false;
          res.redirect("orderPlaced");
        }
      })
      .catch((err) => {
        res.send(err);
      });
  },

  //get order placed page
  getOrderPlaced: (req, res) => {
    const user = req.session.user;
    if (req.session.orderSuccess) {
      req.session.orderSuccess = null;
      res.render("user/orderPlaced", { user });
    } else if (req.session.orderSuccess == false) {
      req.session.orderSuccess = null;
      res.render("user/orderFailure", { user });
    } else {
      res.redirect("/cart");
    }
  },
  //----------------xx---------------------------//

  //--------------Profile page----------//

  //get profile page

  getProfile: async (req, res) => {
    const userId = req.session.user._id;
    try {
      const user = await User.findById(userId);
      res.render("user/profile", { user });
    } catch (error) {
      res.send(error);
    }
  },

  //get coupon page
  getCoupons: async (req, res) => {
    const user = req.session.user;
    const coupons = await Coupon.find({
      unlist: false,
      expiryDate: { $gt: new Date() },
    }).lean();
    res.render("user/coupons", { user, coupons });
  },

  //edit user profile
  editProfile: async (req, res) => {
    const userId = req.params.id;
    try {
      await User.findByIdAndUpdate(userId, req.body);
      res.redirect("back");
    } catch (error) {
      res.send(error);
    }
  },

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
