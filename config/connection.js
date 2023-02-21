const mongoose = require("mongoose");

function connectDb() {

  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`Mongo Db connected`);
    })
    .catch((err) => {
      console.log("Error: " + err);
      process.exit(1);
    });
}

module.exports = connectDb;
