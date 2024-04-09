const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  categoryOffer: {
    type: Number, // % of discount
    default: 0,
  }
});



const categoryCollection = mongoose.model('Category', categorySchema);
module.exports = categoryCollection