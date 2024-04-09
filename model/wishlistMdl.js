const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true,
      },
      addedAt: {
        type: Date,
        default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      },
    }
  ],
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;