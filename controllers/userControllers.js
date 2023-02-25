module.exports = {
  getHome: (req, res) => {
    let user = req.session.user;
    res.render("user/index", { user });
  },
};
