const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: Array,
  },
  cart: {
    type: Array,
  },
  wishlist: {
    type: Array,
  },
  myOrders: {
    type: Array,
  },

  wallet: {
    type: Number,
    default: 0,
  },
  block: {
    type: Boolean,
    default: false,
  },
});

//Export the model
module.exports = mongoose.model("User", userSchema);
