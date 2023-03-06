const User = require("../models/userModel");
module.exports = {
  checkBan: async (req, res, next) => {
    if (req.session.user) {
      const user = await User.findById(req.session.user.id);
      if (user?.block) {
        req.session.user = null;
        req.session.userLoggedIn = false;
        res.redirect("/home");
      }else{
        next()
      }
    } else {
      next()
    }
  },
};
