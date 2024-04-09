const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  minCartValue: {
    type: Number,
    default: 0, // Set a default value or adjust as needed
  },
  usageLimit: {
    type: Number,
    default: null, // Set to null for unlimited usage
  },
  createdAt: {
    type: Date,
    default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  },
  // isActive: {
  //   type: Boolean,
  //   default: true, // Set to true initially
  // },
  // status: {
  //   type: String,
  //   default: 'Active',
  // },
  used: {
    type: Number,
    default: 0,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
