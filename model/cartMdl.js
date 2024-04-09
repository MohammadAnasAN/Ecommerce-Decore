const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  // appliedCoupon: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Coupon',
  //   default: null,
  // },
  totalPrice: {
    type: Number,
    default: 0,
  },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
