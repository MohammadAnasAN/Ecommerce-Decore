const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    items: [
        {   
            // _id: { type: String, default: uuidv4 },
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, default: 1 },
            unitPrice: { type: Number, required: true },
            status: { type: String, enum: ['pending', 'shipped', 'delivered','cancelled','return_requested','returned','return_rejected'], default: 'pending' },
            cancellationReason:{type:String},
            returnReason:{type:String},
        }
    ],
    shippingAddress: {
        fullName:{type:String},
        // productImage: {  type: [String],   },
        houseName: { type: String, required: true },
        
        streetAddress: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        // country: { type: String, required: true },
        pinCode: { type: String, required: true },
    },
    appliedCoupon: { type: String }, 
    disamnt :  { type: Number, default: 0 },
    paymentMethod: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    paymentstatus : {type: String, enum : ['confirmed','failed'],default : 'confirmed'},
    createdAt: {
        type: Date,
        default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    },
    isDeliveredMessageDisplayed: { type: Boolean, default: false },

    
});
const  Order= mongoose.model('Order',orderSchema);
module.exports=Order;

// module.exports = mongoose.model('Order', orderSchema);
