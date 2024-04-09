const mongoose=require('mongoose');

const addressSchema=new mongoose.Schema({
    userId:{
        type:String
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'User', // Assuming your user model is named 'User'
        // required: true
    },
    fullName:{
        type:String
    },
    houseName:{
        type:String
    },
    streetAddress:{
        type:String
    },
    country:{
        type:String
    },
    state:{
        type:String
    },
    city:{
        type:String
    },
    pinCode:{
        type:String,
        min:100000,
        max:999999
    },
})
const Address=mongoose.model('Address',addressSchema)
module.exports=Address;