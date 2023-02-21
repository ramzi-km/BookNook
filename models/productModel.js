const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    mrp:{
        type:Number,
        required:true,
    
    },
    price:{
        type:Number,
        required:true,
    },
    inStock:{
        type:Number,
        required:true,
    },
    author:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    richDescription:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    coverImage:{
        type:String,
        required:true,
    },
    extraImages:{
        type:Array,
    },
    isFeatured:{
        type:String,
        default:false,
        index:true,
    },
    ratings:{
        type:Array,
        default:[]
    },
    reviews:{
        type:Array,
        default:[]
    },
    unList:{
        type:Boolean,
        default:false,
    }

},{timestamps:true});

//Export the model
module.exports = mongoose.model('Product', productSchema);