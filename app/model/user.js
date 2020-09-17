let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema(
    {
        userId:{
            type:String,
            index:true,
            unique:true,
            default:''
        },
        email:{
            type:String,
            default:''
        },
        password:{
            type:String,
            default:''
        },
        username:{
            type:String,
            default:'anonymous'
        },
        mobile:{
            type:Number,
            default:1234567891
        },
        createdOn:{
            type:Date,
            default:new Date()
        }
    }
)

let userModel = mongoose.model('user',userSchema);
module.exports=userModel;