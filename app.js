const express = require("express");
const path = require("path");
const session = require("express-session");
const nocache = require("nocache");
require("dotenv").config();
const morgan = require("morgan");
const cors = require('cors');
const connectDb = require("./config/connection.js");
const MongoStore = require("connect-mongo");

const app = express();
const PORT = process.env.PORT || 8000;

const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");


//log requests
app.use(morgan("dev"));

//connect to database
connectDb();

//view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const threeDay = 1000 * 60 * 60 * 72;
app.use(
  session({
    secret: "Key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: threeDay },
    store: MongoStore.create({ mongoUrl: process.env.MONGOOSE_CONNECT }),
  })
);
app.use(nocache());
app.use(cors());
app.use('*',cors());

//listening
app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});

//route setup
app.use("/", userRouter);
app.use("/admin", adminRouter);

//render 404 page
app.use((req, res) => {
  res.status(404).render("404");
});

module.exports = app;
