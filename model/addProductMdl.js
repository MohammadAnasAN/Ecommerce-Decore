const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
  },
  price: {
    type: Number,
  },
  description: {
    type: String,
  },
  selectCategory: {
    type: String,
  },
  productImage: {
    type: [String],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
  },
  rating: {
    type: Number,
    default: 0,
  },
  stockCount: {
    type: Number,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    
  },
  offerDiscountPercentage: {
    type: Number,
    default: 0 // Default to 0 if no offer is applicable
},
categoryOfferPercentage: {
  type: Number, 
  default: 0 // Default to 0 if no category offer percentage is specified
},
ratings: [{
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
  },
  rating: {
      type: Number,
      min: 1,
      max: 5
  }
}],
averageRating: {
  type: Number,
  default: 0
},
reviews: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  reviewText: String
}]
});

// Define the method to calculate average rating
productSchema.methods.calculateAverageRating = function() {
if (this.ratings.length === 0) {
  return 0;
} else {
  const totalRating = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return totalRating / this.ratings.length;
}
};

const AddProduct = mongoose.model("Product", productSchema);

module.exports = AddProduct;