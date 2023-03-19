const User = require("../models/userModel");
module.exports = {
    verifyLoggedIn: (req, res, next) => {
        if (!req.session.userLoggedIn) {
          res.redirect("/login");
        } else {
          next();
        }
      },
      verifyLoggedOut: (req, res, next) => {
        if (req.session.userLoggedIn) {
          res.redirect("/");
        } else {
          next();
        }
      },
      checkBan: async (req, res, next) => {
        if (req.session.user) {
          const user = await User.findById(req.session.user._id);
          if (user?.block) {
            req.session.user = null;
            req.session.userLoggedIn = false;
            res.redirect("/");
          }else{
            next()
          }
        } else {
          next()
        }
      },
};
