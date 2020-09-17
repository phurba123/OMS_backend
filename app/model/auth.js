let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let authSchema = new Schema(
    {
        userId:{
            type:String,
            default:''
        },

        authToken:
        {
            type:String,
            default:''
        },

        tokenSecret:
        {
            type:String,
            default:''
        },

        tokenGenerationTime:
        {
            type:Date,
            default:Date.now()
        }
    }
);
let authModel = mongoose.model('authModel',authSchema);

module.exports = authModel;
