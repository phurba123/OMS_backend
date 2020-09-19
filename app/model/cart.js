let mongoose = require('mongoose')
let Schema = mongoose.Schema;

let cartSchema = new Schema(
    {
        userId:{
            type:String,
            unique:true
        },
        cartProducts:{
            type:[{
                productId:{
                    type:String
                },
                productName:{
                    type:String
                },
                productImage:{
                    type:String
                },
                productPrice:{
                    type:String,
                    default:'$0'
                }
            }]
        }
    }
)

let cartModel=mongoose.model('cart',cartSchema);
module.exports=cartModel;