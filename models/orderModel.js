const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    orderStatus:{
        type:String,
        default:"pending"
    },
    paid:{
        type:Boolean,
        default:false,
    },
    address:{
        type:Object,
    },
    product:{
        type:Object,
    },
    userId:{
        type:String,

    },
    quantity:{
        type:Number,

    },
    payment:{
        type:Object,
        default:{},
    },
    paymentType:{
        type:String,
        default:'cod'
    },
    total:{
        type:Number,

    },
    amountPayable:{
        type:Number,
        default:0,
    },
    orderId:{
        type:Number,
        default:0,
    }
},{timestamps:true});

//Export the model
module.exports = mongoose.model('Order', orderSchema);