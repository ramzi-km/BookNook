const mongoose = require("mongoose");
const Admin = require("../models/adminModel.js");
const bcrypt = require("bcrypt");

let loginError = null;

module.exports = {
  getLogin: (req, res) => {
    res.render("admin/login", { error: loginError });
    loginError = null;
  },
  validateAdmin: async (req, res) => {
    let admin = await Admin.findOne({ email: req.body.email });

    if (admin) {
      bcrypt.compare(req.body.password, admin.password).then((result) => {
        if (result) {
          console.log("login success");
          req.session.admin = admin;
          req.session.adminLoggedIn = true;
          loginError = null;
          res.redirect("/admin");
        } else {
          loginError = "Invalid username or password";
          res.redirect("/admin/adminLogin");
        }
      });
    } else {
      loginError = "Invalid username or password";
      res.redirect("/admin/adminLogin");
    }
  },
  doLogout: (req, res) => {
    req.session.admin = null;
    req.session.adminLoggedIn = false;
    res.redirect("/admin/adminLogin");
  },
};
