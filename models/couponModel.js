const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    code:{
        type:String,
        required:true,

    },
    discountPercentage:{
        type:Number,
        required:true,
    },
    minPurchaseAmount:{
        type:Number,
        required:true,
    },
    maxDiscountAmount:{
        type:Number,
        required:true,
    },
    expiryDate:{
        type:Date,
        required:true,
    },
    unList:{
        type:Boolean,
        default:false
    }
});

//Export the model
module.exports = mongoose.model('Coupon', couponSchema);