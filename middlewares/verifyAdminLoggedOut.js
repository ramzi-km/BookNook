module.exports = {
    verifyLoggedOut: (req, res, next) => {
        if (req.session.adminLoggedIn) {
          res.redirect("/admin");
        } else {
          next();
        }
      }
};
