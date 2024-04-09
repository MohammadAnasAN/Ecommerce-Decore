const express=require( 'express');
const Coupon=require('../model/couponMdl');
const Cart=require('../model/cartMdl')

//get
exports.coupon = async (req, res) => {
    try {
      console.log('couponpage hit');
  
      // Fetch the list of coupons from the database
      let coupons = await Coupon.find();
  
      // Update coupon status based on expiry date
      coupons.forEach(coupon => {
        coupon.active = new Date(coupon.expiryDate) > new Date();
      });
  
      // Save the updated coupons
      await Promise.all(coupons.map(coupon => coupon.save()));
  
      // Fetch the updated list of coupons (with the active status)
      coupons = await Coupon.find();
  
      // Render the coupon list page with the fetched data
      res.render('couponAdmin', { coupons });
    } catch (error) {
      console.error('Error fetching or updating coupons:', error);
      // Handle the error and redirect to an error page or display an error message
      res.redirect('/error');
    }
  };

exports.addCoupon=(req,res)=>{
    res.render('couponAdd')
}
exports.editCouponPage=async(req,res)=>{
  try {
    // Extract coupon ID from request parameters
    const couponId = req.params.id;
  console.log('couponid',couponId);

    // Find the coupon by ID
    const coupon = await Coupon.findById(couponId);
    console.log('coupon',coupon);

    // Check if the coupon exists
    if (!coupon) {
      return res.status(404).send('Coupon not found');
    }

    // Render the "Edit Coupon" page with the coupon data
    res.render('editCoupon', { coupon });
  } catch (error) {
    console.error('Error rendering edit page:', error);
    // Handle the error and redirect to an error page or display an error message
    res.redirect('/error');
  }
}

//post

exports.saveCoupon=async(req,res)=>{
    try {
        console.log('Saving new Coupon...');
        // Extract coupon details from the form submission
        const { code, discountPercentage, expiryDate, minCartValue, usageLimit } = req.body;

        // Create a new Coupon instance
        const newCoupon = new Coupon({
            code,
            discountPercentage,
            expiryDate,
            minCartValue,
            usageLimit,
        });

        // Save the coupon to the database
        const savedCoupon = await newCoupon.save();

        // Redirect to a success page or any other page as needed
        res.redirect('/coupon');
    } catch (error) {
        console.error(error);

            // Send a 500 Internal Server Error status along with a simple error message
            res.status(500).send('Internal Server Error: Failed to save the coupon. Please try again.');
    }
}


exports.deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    // Find the coupon by ID
    const coupon = await Coupon.findById(couponId);

    // Check if the coupon exists
    if (!coupon) {
      return res.status(404).send('Coupon not found');
    }

    // Delete the coupon from the database
    await Coupon.findByIdAndDelete(couponId);

    // Redirect to the coupon management page after successful deletion
    res.redirect('/coupon');

  } catch (error) {
    console.error('Error deleting coupon:', error);
    // Handle the error and redirect to an error page or display an error message
    res.redirect('/error');
  }
};


exports.editCoupon = async (req, res) => {
  try {
    console.log('Editing Coupon...');

    // Extract coupon details from the form submission
    const { code, discountPercentage, expiryDate, minCartValue, usageLimit } = req.body;
    
    // Get the coupon ID from the request parameters
    const couponId = req.params.id;

    // Find the existing coupon by ID
    const existingCoupon = await Coupon.findById(couponId);

    // Check if the coupon exists
    if (!existingCoupon) {
      return res.status(404).send('Coupon not found');
    }

    // Update the existing coupon with the new details
    existingCoupon.code = code;
    existingCoupon.discountPercentage = discountPercentage;
    existingCoupon.expiryDate = expiryDate;
    existingCoupon.minCartValue = minCartValue;
    existingCoupon.usageLimit = usageLimit;

    // Save the updated coupon to the database
    const updatedCoupon = await existingCoupon.save();

    // Redirect to a success page or any other page as needed
    res.redirect('/coupon');
  } catch (error) {
    console.error(error);

    // Send a 500 Internal Server Error status along with a simple error message
    res.status(500).send('Internal Server Error: Failed to edit the coupon. Please try again.');
  }
};



exports.applyCoupon=async(req,res)=>{
  try {
    const { couponCode } = req.body;
    const userData = req.session.user;

    console.log('coupon',couponCode)

    // Fetch user's cart
    const userCart = await Cart.findOne({ user: userData }).populate('items.product');

    // Calculate new total price with the coupon applied
    let totalPrice = 0;
    userCart.items.forEach(item => {
        totalPrice += item.product.price * item.quantity;
    });

    // Fetch coupon details by code
    const coupon = await Coupon.findOne({ code: couponCode });

    // Check if coupon is valid
    if (!coupon || coupon.expiryDate < new Date() || totalPrice < coupon.minCartValue) {
      let message = 'Invalid coupon code';
      if (totalPrice < coupon.minCartValue) {
          message = `Invalid coupon code. Coupon is applicable only for orders above ${coupon.minCartValue}`;
      }
      return res.status(400).json({ success: false, message });
  }

    // const userUsedCoupon = await Cart.findOne({ user: userData, appliedCoupon: coupon._id });
    // if (userUsedCoupon) {
    //     return res.status(400).json({ success: false, message: 'This coupon has already been used by the user' });
    // }

    // Apply discount
    const discountAmount = (totalPrice * coupon.discountPercentage) / 100;
    totalPrice -= discountAmount;

    // Update cart with new total price and applied coupon
    userCart.totalPrice = totalPrice;
    // userCart.appliedCoupon = coupon._id;     // Assuming you store coupon reference in appliedCoupon
    var newPrice =await userCart.save();
    console.log('new price',newPrice);

    return res.status(200).json({ success: true, message: 'Coupon applied successfully', totalPrice });
} catch (error) {
    console.error('Error in applying coupon:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
}
}


exports.removeCoupon=async(req,res)=>{
  try {
    console.log('remove coupon hits')
    const userData = req.session.user;
    console.log('userdata',userData)
    // Fetch user's cart
    const userCart = await Cart.findOne({ user: userData }).populate('items.product');

    // Reset total price
    let totalPrice = 0;
    userCart.items.forEach(item => {
        totalPrice += item.product.price * item.quantity;
    });

    // Remove applied coupon
    userCart.totalPrice = totalPrice;
    userCart.appliedCoupon = null; // Remove applied coupon reference
    await userCart.save();

    return res.status(200).json({ success: true, message: 'Coupon removed successfully', totalPrice });
} catch (error) {
    console.error('Error removing coupon:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
}
}

// Server-side code to apply the coupon
// exports.applyCoupon = async (req, res) => {
//   try {
//       const { code } = req.query;
//       const coupon = await Coupon.findOne({ code });

//       if (!coupon) {
//           return res.json({ success: false, message: 'Coupon not found.' });
//       }

      
//       const subtotal = userCart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
//       const discountPercentage = coupon.discountPercentage;
//       const discountedSubtotal = subtotal * (1 - (discountPercentage / 100));
      
//       // Update the order details with the discounted subtotal and applied coupon
//       // For example, you might update a field in the database or session

//       res.json({ success: true, coupon });
//   } catch (error) {
//       console.error('Error applying coupon:', error);
//       res.json({ success: false, message: 'An error occurred while applying the coupon.' });
//   }
// };
