const mongoose = require('mongoose');
const multer = require('multer');
const moment = require('moment');
const cloudinary = require('../config/cloudinary');
//------------------------------ Models-----------------------------//

const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');
const Category = require('../models/categoryModel.js');
const Coupon = require('../models/couponModel.js');
const Order = require('../models/orderModel.js');

//----------------------------------------------------------------//

//-------------------------middlewares----------------------------//

const { uploadImages } = require('../middlewares/multer.js');

//----------------------------------------------------------------//

//-------------------------helpers-------------------------------//

async function getImageFieldsToUpdate(files) {
  const fields = {};
  if (files.mainImage) {
    let mainImage = files.mainImage[0];
    const imageFile = await cloudinary.uploader.upload(mainImage.path, {
      folder: 'booknook',
    });
    fields.mainImage = imageFile;
  }
  if (files.coverImage) {
    let coverImage = files.coverImage[0];
    const imageFile2 = await cloudinary.uploader.upload(coverImage.path, {
      folder: 'booknook',
    });
    fields.coverImage = imageFile2;
  }
  if (files.extraImages) {
    let extraImages = files.extraImages;
    for (i in extraImages) {
      let imageFile3 = await cloudinary.uploader.upload(extraImages[i].path, {
        folder: 'booknook',
      });
      extraImages[i] = imageFile3;
    }
    fields.extraImages = extraImages;
  }
  return fields;
}

function formattedDate(d) {
  let month = String(d.getMonth() + 1);
  let day = String(d.getDate());
  const year = String(d.getFullYear());

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return `${year}-${month}-${day}`;
}

const formatCash = (n) => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K';
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M';
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B';
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T';
};
//-------------------------------------------------------------//

let addCategoryError = null;
let editCategoryError = null;
let addProductMessage = null;
let addProductFailMessage = null;
let editProductMessage = null;
let editProductFailMessage = null;
let imageFileError = null;
let addProductError = null;
let editProductError = null;
let addCouponError = null;
let editCouponError = null;

module.exports = {
  getPanel: async (req, res) => {
    try {
      const admin = req.session.admin;
      const totalUsers = await User.find().lean().count();
      const totalProducts = await Product.find().lean().count();
      const orders = await Order.find().lean();
      const totalOrders = orders.length;
      const categoryDataArray = await Order.aggregate([
        { $match: { paid: true } },
        {
          $group: {
            _id: '$product.category',
            revenue: { $sum: '$total' },
          },
        },
      ]);
      const monthlyDataArray = await Order.aggregate([
        { $match: { paid: true } },
        {
          $group: {
            _id: { $month: '$createdAt' },
            revenue: { $sum: '$total' },
          },
        },
      ]);
      let totalRevenue = 0;
      let totalPending = 0;
      let onlineOrders = 0;
      let cod = 0;
      let deliveredOrders = orders.filter((order) => {
        if (order.status == 'pending' || order.status == 'shipped') {
          totalPending++;
        }
        if (order.paymentType == 'online') {
          onlineOrders++;
        }
        if (order.paymentType == 'cod') {
          cod++;
        }
        if (order.paid) {
          totalRevenue = totalRevenue + order.total;
        }
        return order.status == 'delivered';
      });
      let totalDispatch = deliveredOrders.length;
      let monthlyDataObject = {};
      let categoryDataObject = {};
      monthlyDataArray.map((item) => {
        monthlyDataObject[item._id] = item.revenue;
      });
      categoryDataArray.map((item) => {
        categoryDataObject[item._id] = item.revenue;
      });
      const paymentData = [onlineOrders, cod];
      let monthlyData = [];
      let categoryData = [];
      let categoryName = [];
      for (let i = 1; i <= 12; i++) {
        monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
      }

      Object.entries(categoryDataObject).forEach(([key, value], index) => {
        categoryData[index] = value;
        categoryName[index] = key;
      });

      formattedRevenue = formatCash(totalRevenue);

      res.render('admin/adminPanel', {
        admin,
        totalUsers,
        totalOrders,
        totalPending,
        totalDispatch,
        onlineOrders,
        totalProducts,
        totalRevenue,
        formattedRevenue,
        monthlyData,
        categoryData,
        categoryName,
        paymentData,
      });
    } catch (error) {
      console.log(error);
    }
  },
  //------------------------------ user management-----------------------------//

  getUserM: async (req, res) => {
    let admin = req.session.admin;
    let users = await User.find().lean();
    res.render('admin/userM', { admin, users });
  },
  //block or unblock user
  blockUser: async (req, res) => {
    let userId = req.params.id;
    //bUser = blocking or unblocking user
    let bUser = await User.findById(userId);

    if (bUser.block) {
      bUser.block = false;
      await bUser.save();
      res.redirect('/admin/userM');
    } else {
      bUser.block = true;
      await bUser.save();
      res.redirect('/admin/userM');
    }
  },
  //--------------------------- product management----------------------------//

  getProductM: async (req, res) => {
    let admin = req.session.admin;
    try {
      let products = await Product.find().lean();
      res.render('admin/productM', {
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
      res.render('admin/addProduct', {
        admin,
        categories,
        imageError: imageFileError,
        addError: addProductError,
      });
      imageFileError = null;
      addProductError = null;
    } catch (error) {
      res.send(error);
    }
  },
  //post add product page
  addProduct: async (req, res) => {
    uploadImages(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // a multer error occured when uploading
        imageFileError = 'choose only image files';
        res.redirect('/admin/productM/addProduct');
        return;
      } else if (err) {
        // an unknown error occured while uploading
        imageFileError = `error occured when uplaoding images,make sure you only chose 3 images on the side images input and all the chosen files are image files`;
        res.redirect('/admin/productM/addProduct');
        return;
      }
      // everything went fine
      const productExist = await Product.find({
        $and: [
          { name: req.body.name },
          { author: req.body.author },
          { category: req.body.category },
        ],
      });
      if (productExist[0]) {
        addProductError = 'product with the same details already exists';
        res.redirect('back'); 
      } else {
        try {
          let mainImage = req.files.mainImage[0];
          let coverImage = req.files.coverImage[0];
          let extraImages = req.files.extraImages;
          const imageFile = await cloudinary.uploader.upload(mainImage.path, {
            folder: 'booknook',
          });
          const imageFile2 = await cloudinary.uploader.upload(coverImage.path, {
            folder: 'booknook',
          });
          mainImage = imageFile;
          coverImage = imageFile2;
          for (i in extraImages) {
            let imageFile3 = await cloudinary.uploader.upload(
              extraImages[i].path,
              { folder: 'booknook' }
            );
            extraImages[i] = imageFile3;
          }
          const fields = {
            name: req.body.name,
            author: req.body.author,
            category: req.body.category,
            mrp: req.body.mrp,
            price: req.body.price,
            inStock: req.body.inStock,
            description: req.body.description,
            richDescription: req.body.richDescription,
            mainImage: mainImage,
            coverImage: coverImage,
            extraImages: extraImages,
          };
          const newProduct = new Product(fields);
          await newProduct.save();
          imageFileError = null;
          addProductMessage = 'product added successfully';
          res.redirect('/admin/productM');
        } catch (err) {
          addProductFailMessage = 'Failed to add product';
          res.redirect('/admin/productM');
        }
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
      res.render('admin/editProduct', {
        categories,
        admin,
        product,
        imageError: imageFileError,
        editError: editProductError,
      });
      imageFileError = null;
      editProductError = null;
    } catch (error) {
      res.send(error);
    }
  },

  // post edit product page
  editProduct: async (req, res) => {
    uploadImages(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // a multer error occured when uploading
        imageFileError = 'choose only image files';
        res.redirect(`/admin/productM/editProduct/${req.params.id}`);
        return;
      } else if (err) {
        // an unknown error occured while uploading
        imageFileError =
          'error occured when uploading images,make sure you only chose 3 images on side images input and all the chosen files are image files';
        res.redirect(`/admin/productM/editProduct/${req.params.id}`);
        return;
      }

      // everything went fine //
      let sameProduct = false;
      const productExist = await Product.find({
        $and: [
          { name: req.body.name },
          { author: req.body.author },
          { category: req.body.category },
        ],
      });
      if (
        req.session.editingProduct.name == req.body.name &&
        req.session.editingProduct.category == req.body.category &&
        req.session.editingProduct.author == req.body.author
      ) {
        sameProduct = true;
      }
      if (productExist[0] && !sameProduct) {
        editProductError = 'product with the same details already exists';
        res.redirect('back');
      } else {
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

          const imageFieldsToUpdate = await getImageFieldsToUpdate(req.files);
          if (Object.keys(imageFieldsToUpdate).length > 0) {
            await Product.updateOne({ _id: productId }, imageFieldsToUpdate);
          }
          editProductMessage = 'Product edited successfully';
          imageFileError = null;
          res.redirect('/admin/productM');
        } catch (error) {
          editProductFailMessage = 'Failed to edit product';
          res.redirect('/admin/productM');
        }
      }
    });
  },
  // delete extra images individually
  deleteExtraImage: async (req, res) => {
    let imageName = req.params.imageName;
    let prodId = req.params.prodId;
    await Product.findByIdAndUpdate(prodId, {
      $pull: { extraImages: { original_filename: imageName } },
    });
    res.redirect('back');
  },

  // unlist product
  unListProduct: async (req, res) => {
    ``;
    try {
      let productId = req.params.id;
      let product = await Product.findById(productId);
      product.unList = true;
      await product.save();
      res.redirect('/admin/productM');
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
      res.redirect('/admin/productM');
    } catch (error) {
      res.send(error);
    }
  },

  //-------------------------- category management------------------------//

  getCategoryM: async (req, res) => {
    let admin = req.session.admin;
    let categories = await Category.find().lean();
    res.render('admin/categoryM', { admin, categories });
  },
  //get add category page
  getAddCategory: (req, res) => {
    let admin = req.session.admin;
    res.render('admin/addCategory', {
      admin,
      error: addCategoryError,
    });
    addCategoryError = null;
  },
  //add category
  addCategory: async (req, res) => {
    req.body.category = req.body.category.toLowerCase();
    let categoryName =
      req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1);
    let category = await Category.findOne({ name: categoryName });
    if (category) {
      addCategoryError = 'category already exist';
      res.redirect('/admin/categoryM/addCategory');
    } else {
      await Category.create({ name: categoryName });
      res.redirect('/admin/categoryM');
    }
  },
  //get edit category page
  getEditCategory: async (req, res) => {
    let admin = req.session.admin;
    const category = await Category.findOne({ _id: req.params.id });
    req.session.editingCategory = category;
    res.render('admin/editCategory', {
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

    let categoryExist = await Category.findOne({
      name: categoryName,
    });

    if (req.session.editingCategory.name == categoryName) {
      res.redirect('/admin/categoryM');
    } else if (categoryExist) {
      editCategoryError = 'category already exist';
      res.redirect(
        '/admin/categoryM/editCategory/' + req.session.editingCategory._id
      );
    } else {
      await Category.updateOne(
        { _id: req.session.editingCategory._id },
        { name: categoryName }
      );
      req.session.editingCategory = null;
      editCategoryError = null;
      res.redirect('/admin/categoryM');
    }
  },
  //unList Category
  unListCategory: async (req, res) => {
    let categoryId = req.params.id;
    let category = await Category.findById(categoryId);
    category.unList = true;
    await category.save();
    res.redirect('/admin/categoryM');
  },
  //list category
  listCategory: async (req, res) => {
    let categoryId = req.params.id;
    let category = await Category.findById(categoryId);
    category.unList = false;
    await category.save();
    res.redirect('/admin/categoryM');
  },

  //--------------------------- Coupon management----------------------------//

  // get coupon management page
  getCouponM: async (req, res) => {
    let admin = req.session.admin;
    let coupons = await Coupon.find().lean();
    res.render('admin/couponM', { admin, coupons });
  },
  // get coupon add page
  getAddCoupon: (req, res) => {
    let admin = req.session.admin;
    let todaysDate = formattedDate(new Date());
    res.render('admin/addCoupon', { admin, todaysDate, error: addCouponError });
    addCouponError = null;
  },
  // post coupon add page
  addCoupon: async (req, res) => {
    let couponExist = await Coupon.findOne({
      $or: [{ name: req.body.name }, { code: req.body.code }],
    });
    if (couponExist) {
      addCouponError = 'coupon with same name or code already exist';
      res.redirect('back');
    } else {
      try {
        const newCoupon = await Coupon.create(req.body);
        res.redirect('/admin/couponM');
      } catch (err) {
        console.log(err);
        res.redirect('/admin/couponM');
      }
    }
  },
  // get edit coupon page
  getEditCoupon: async (req, res) => {
    let admin = req.session.admin;
    try {
      const coupon = await Coupon.findById(req.params.id);
      req.session.editingCoupon = coupon;
      let todaysDate = formattedDate(new Date());
      let expiryDate = formattedDate(coupon.expiryDate);
      res.render('admin/editCoupon', {
        admin,
        coupon,
        expiryDate,
        todaysDate,
        error: editCouponError,
      });
    } catch (err) {
      console.log(err);
      res.redirect('/admin/couponM');
    }
  },
  // post edit coupon page
  editCoupon: async (req, res) => {
    let sameCoupon = false;
    let couponId = req.params.id;
    let couponExist = await Coupon.findOne({
      $or: [{ name: req.body.name }, { code: req.body.code }],
    });
    if (
      req.session.editingCoupon.name == req.body.name &&
      req.session.editingCoupon.code == req.body.code
    ) {
      sameCoupon = true;
    }
    if (couponExist && !sameCoupon) {
      editCouponError = 'coupon with same name or code already exist';
      res.redirect('back');
    } else {
      try {
        const coupon = await Coupon.updateOne({ _id: couponId }, req.body);
        res.redirect('/admin/couponM');
      } catch (err) {
        res.redirect('/admin/couponM');
      }
    }
  },
  //unList Coupon
  unListCoupon: async (req, res) => {
    let couponId = req.params.id;
    let coupon = await Coupon.findById(couponId);
    coupon.unList = true;
    await coupon.save();
    res.redirect('/admin/couponM');
  },
  //list Coupon
  listCoupon: async (req, res) => {
    let couponId = req.params.id;
    let coupon = await Coupon.findById(couponId);
    coupon.unList = false;
    await coupon.save();
    res.redirect('/admin/couponM');
  },

  //--------------------------- Order management----------------------------//

  // get order management page
  getOrderM: async (req, res) => {
    let admin = req.session.admin;
    let orders = await Order.find().lean();
    res.render('admin/orderM', { admin, orders });
  },

  // get order view page
  getOrderView: async (req, res) => {
    let admin = req.session.admin;
    let objectId = req.params.id;
    try {
      let order = await Order.findById(objectId).lean();
      res.render('admin/viewOrder', { admin, order });
    } catch (error) {
      res.send(error);
    }
  },
  // update order status
  updateOrderStatus: async (req, res) => {
    const status = req.body.status;
    const objectId = req.params.id;
    try {
      const order = await Order.findById(objectId);
      if (status == 'delivered') {
        order.paid = true;
        order.deliveryDate = formattedDate(new Date());
        order.lastDate = Date.now() + 259200000;
        order.amountToPay = 0;
      }
      if (status == 'returned') {
        await User.updateOne(
          { _id: order.userId },
          { $inc: { wallet: order.total } }
        );
      }
      order.status = status;
      await order.save();
      res.redirect('/admin/orderM');
    } catch (error) {
      res.send(error);
    }
  },

  //--------------------------- Sales report ----------------------------//
  getReport: async (req, res) => {
    const admin = req.session.admin;

    let startDate = new Date(new Date().setDate(new Date().getDate() - 8));
    let endDate = new Date();
    let filter = req.query.filter ?? '';

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate);
      startDate.setHours(0, 0, 0, 0);
    }
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate);
      endDate.setHours(24, 0, 0, 0);
    }
    if (filter == 'thisYear') {
      let currentDate = new Date();
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(new Date().setDate(new Date().getDate() + 1));
      endDate.setHours(0, 0, 0, 0);
    }

    if (filter == 'thisMonth') {
      let currentDate = new Date();
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(new Date().setDate(new Date().getDate() + 1));
      endDate.setHours(0, 0, 0, 0);
    }

    if (!req.query.filter && (!req.query.startDate || !req.query.endDate)) {
      filter = 'lastWeek';
    }

    const orders = await Order.find({
      createdAt: { $gt: startDate, $lt: endDate },
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalOrders = orders.length;
    let totalRevenue = 0;
    let totalPending = 0;
    let deliveredOrders = orders.filter((order) => {
      if (order.status == 'pending' || order.status == 'shipped') {
        totalPending++;
      }
      if (order.paid) {
        totalRevenue = totalRevenue + order.total;
      }
      return order.status == 'delivered';
    });

    const totalDispatch = deliveredOrders.length;

    res.render('admin/salesReport', {
      admin,
      orders,
      totalDispatch,
      totalOrders,
      totalPending,
      totalRevenue,
      startDate: moment(
        new Date(startDate).setDate(new Date(startDate).getDate() + 1)
      )
        .utc()
        .format('YYYY-MM-DD'),
      endDate: moment(endDate).utc().format('YYYY-MM-DD'),
      filter,
    });
  },
};
