const mongoose = require('mongoose')


const LoginSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true,
        unique: true  
    },
    password:{
        type:String,
        required:true
    },
    isBlocked: {
        type: Boolean,
        default: false,
      },
    phoneNumber:{
        type: Number,
        
    } ,
    confirmPassword:{
        type: String,
        required: true
    },
    wallet: {
        balance: { type: Number, default: 0 },
        transactions: [{
            amount: { type: Number, required: true },
            description: { type: String, required: true },
            date: { type: Date, default: Date.now },
        }],
    },
    referralCode:{type: String},
    referredCode:{type: String},
    firstOrderCompleted: { type: Boolean, default: false }

})

const userCollection=new mongoose.model('users',LoginSchema)

module.exports=userCollection