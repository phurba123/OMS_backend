let mongoose = require('mongoose')
let Schema = mongoose.Schema;

let transactionSchema = new Schema(
    {
        transactionId:{
            type:String,
            unique:true
        },
        userId:{
            type:String
        },
        totalPrice:{
            type:String
        },
        products:{
            type:[{
                productId:{
                    type:String
                },
                productName:{
                    type:String
                },
                productPrice:{
                    type:String
                }
            }]
        },
        orderedOn:{
            type:Date,
            default:Date.now()
        }
    }
)

let transactionModel = mongoose.model('transactions',transactionSchema);
module.exports=transactionModel;