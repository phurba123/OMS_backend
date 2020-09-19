let mongoose = require('mongoose')
let Schema = mongoose.Schema;

let productSchema = new Schema(
    {
        Id:{
            type:String,
            unique:true
        },
        Name:{
            type:String,
            default:'no name'
        },
        Image:{
            type:String,
            default:'no image'
        },
        Price:{
            type:String,
            default:0
        },
        PublishedOn:{
            type:Date,
            default:Date.now()
        }
    }
)

let productModel = mongoose.model('products',productSchema);

module.exports=productModel;