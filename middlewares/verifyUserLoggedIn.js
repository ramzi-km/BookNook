module.exports = {
    verifyLoggedIn: (req, res, next) => {
        if (!req.session.userLoggedIn) {
          res.redirect("/login");
        } else {
          next();
        }
      }
};
