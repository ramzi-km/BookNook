const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  unList: {
    type: Boolean,
    default: false,
  },
},{timestamps:true});

//Export the model
module.exports = mongoose.model("Category", categorySchema);
