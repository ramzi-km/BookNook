module.exports = {
    verfiyLoggedIn:(req, res, next) => {
        if (req.session.adminLoggedIn) {
          next();
        } else {
          res.redirect("/admin/adminLogin");
        }
      }
};
