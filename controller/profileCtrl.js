const express=require('express');
const mongoose=require('../config/dbConnect');
const Address=require('../model/addressMdl');
const user=require('../model/userSchema')
const Cart=require('../model/cartMdl')
const Product=require('../model/addProductMdl')
const Order= require('../model/orderMdl');
const Wishlist=require('../model/wishlistMdl')
const Razorpay = require("razorpay");
const { generateRazorpayOrder } = require('../controller/razorpayCtrl'); // Import the function to generate Razorpay order ID
const Coupon=require('../model/couponMdl')
const PDFDocument = require('pdfkit');



const app=express();


//get



exports.getprofile=async(req,res)=>{
    
    try{
        const userData = req.session.user; 
        const userDetails=await user.findById(userData);
        console.log('userDetailss:',userDetails)
        res.render('newprofile',{userDetails})
    
       }catch{
            console.log('error is occurs')
            res.status(500).send('Internal Server Error');
       } 
    
}
exports.getAddress=async(req,res)=>{
   try{
    const userData = req.session.user; 
        const userDetails=await user.findById(userData);
        console.log('userDetailss:',userDetails)
        console.log('id,',userDetails._id)
    // res.render('address',{userDetails})

    const addresses=await Address.find({userId:userDetails._id});
    console.log('addresses:',addresses)
    res.render('address',{userDetails,addresses});

   }catch{
        console.log('error is occurs')
        res.status(500).send('Internal Server Error');
   }

   
}
exports.getAddaddress=async(req,res)=>{
    try{
        const userData = req.session.user; 
            const userDetails=await user.findById(userData);
            console.log('userDetailss:',userDetails)
        res.render('AddAddress',{userDetails})
    
       }catch{
            console.log('error is occurs')
            res.status(500).send('Internal Server Error');
       }
}

exports.getAddNewaddressCheck=async(req,res)=>{
    try{
        const userData = req.session.user; 
            const userDetails=await user.findById(userData);
            console.log('userDetailss:',userDetails)
        res.render('checkoutAddrs')
    
       }catch{
            console.log('error is occurs')
            res.status(500).send('Internal Server Error');
       }
}

exports.geteditAddress=async(req,res)=>{
    try{
            const userData = req.session.user; 
            const userDetails=await user.findById(userData);
            console.log('userDetailss:',userDetails)

            const addressId=req.params.id;
            const address=await Address.findById(addressId)
            if(!address){
                return res.status(404).send('Address not found')
            }
        res.render('EditAddress',{userDetails,address})
    
       }catch{
            console.log('error is occurs')
            res.status(500).send('Internal Server Error');
       }
}

exports.getCart = async (req, res) => {
    try {
        const userData = req.session.user;
        const userDetails = await user.findById(userData);

        console.log('userDetailss:', userDetails);

        const userCart = await Cart.findOne({ user: userData }).populate('items.product');
        console.log('usercart:', userCart);

        res.render('cart', { userDetails, userCart });

    } catch (error) {
        console.error('Error in getCart:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getWhishlist = async (req, res) => {
    try {
        const userData = req.session.user;
        const userDetails = await user.findById(userData);

        console.log('userDetailss:', userDetails);

        const userWhishlist = await Wishlist.findOne({ user: userData }).populate('items.product');
        console.log('wishlist:', userWhishlist);

        res.render('wishlist', { userDetails, userWhishlist });

    } catch (error) {
        console.error('Error in getCart:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getCheckout=async(req,res)=>{
    try{

        const userData=req.session.user;
        const userDetails=await user.findById(userData);

        const userCart=await Cart.findOne({user:userData}).populate('items.product');

        

          // Find active coupons (not expired)
        //   const currentDate = new Date();
        //   const activeCoupons = await Coupon.find({ expiryDate: { $gte: currentDate } });
        const currentDate = new Date();
        const appliedCoupons = await Order.find({ user: userData, appliedCoupon: { $exists: true } }).distinct('appliedCoupon');
        const activeCoupons = await Coupon.find({ 
            expiryDate: { $gte: currentDate },
            _id: { $nin: appliedCoupons } // Exclude coupons already applied by the user
        });

        // Calculate subtotal and apply discounts
        let subtotal = 0;
        userCart.items.forEach(item => {
            const productPrice = item.product.price;
            const quantity = item.quantity;
            const offerDiscountPercentage = item.product.offerDiscountPercentage || 0; // Assuming offer discount percentage is stored in the product

            // Calculate discounted price for the item
            const discountedPrice = productPrice * (1 - offerDiscountPercentage / 100);
            item.discountedPrice = discountedPrice; // Add discounted price to the item data

            // Calculate subtotal
            subtotal += discountedPrice * quantity;
        });

          

        const addresses=await Address.find({userId:userDetails._id});

        const walletBalance = userDetails.wallet.balance;

        res.render('checkOutpage',{userDetails,userCart,addresses,activeCoupons,walletBalance,subtotal });

    }catch(error){
        console.error('Error in getCheckout:',error);
        res.status(500).send('Internal Server Error')
    }
}




exports.getOrderPage = async (req, res) => {
    try {
      
        console.log('hits on order details')
       
        const userId = req.session.user;

        const userDetails = await user.findById(userId);
       
        const orders = await Order.find({ user: userId }).populate({
            path: 'items.product',
            select: 'productName productImage price',
        });

     
       
        res.render('order', { orders, userDetails});

        
       

    } catch (error) {
        console.error('Error in getOrderDetails:', error);
        res.status(500).send('Internal Server Error');
    }
};

//reffereral
const generateReferralCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const codeLength = 8;
    let referralCode = '';
  
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }
  
    return referralCode;
  };
  
exports.createReferral=async(req,res)=>{
    console.log("HELLO");
    try {
        // Check if the user with the given ID exists
        const userId = req.session.user;
        // const userData = await user.findOne({ _id: user1 });
        // const userId = userData._id.valueOf();
        const userDetails = await user.findById(userId);
      

  console.log("user123",userDetails);
        if (userDetails) {
            // If the user doesn't have a referral code, generate one and update the user document
            if (!userDetails.referralCode) {
                const referralCode = generateReferralCode();
                await user.findByIdAndUpdate(userId, { referralCode }, { new: true });
                return { status: 'success', message: 'Referral code added successfully', referralCode };
            } else {
                // If the user already has a referral code, return it
                return { status: 'success', message: 'User already has a referral code', referralCode: userDetails.referralCode };
            }
        } else {
            return { status: 'error', message: 'User not found with the provided ID' };
        }
    } catch (error) {
        console.error('Error:', error);
        return { status: 'error', message: 'Internal Server Error'};
}

 }



 exports.checkReferralCode=async(req,res)=>{
    const { referralCode } = req.body;
    console.log(referralCode);
      if (!referralCode) {
          return res.status(400).json({ isValid: false, message: 'Referral code is required.' });
      }
    
      try {
          // Use the collectiontrylogs model to find a user based on the referral code
          const userDetails = await user.findOne({ referralCode: referralCode });
    console.log("user", userDetails);
          if (user) {
              return res.json({ isValid: true, message: 'Referral code is valid.' });
          } else {
              return res.json({ isValid: false, message: 'Invalid referral code.' });
          }
      } catch (error) {
          console.error('Error checking referral code:', error);
          return res.status(500).json({ isValid: false, message: 'Internal server error.'});
    }
    
 }


//invoice

exports.generatePDFInvoice = async (req, res) => {
   try {
        const orderId = req.params.orderId; // Assuming order ID is passed as a parameter
        
        // Fetch the order details from the database using the orderId
        const order = await Order.findById(orderId).populate('user').populate('items.product');
        
        // Create a new PDF document
        const doc = new PDFDocument();
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice_${order._id}.pdf"`);
        
        // Pipe the PDF document to the response
        doc.pipe(res);
        
        // Add content to the PDF document
        doc.fontSize(18).text('Invoice', { align: 'center' }).moveDown();
        doc.fontSize(14).text(`Order ID: ${order._id}`).moveDown();
        doc.fontSize(14).text(`Customer Name: ${order.user.name}`).moveDown();
        doc.fontSize(14).text(`Shipping Address: ${order.shippingAddress.fullName}, ${order.shippingAddress.houseName}, ${order.shippingAddress.streetAddress}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.pinCode}`).moveDown();
        doc.fontSize(14).text(`Payment Method: ${order.paymentMethod}`).moveDown();
        
        // Draw table headers
        const tableHeaders = ['Product', 'Quantity', 'Unit Price', 'Total'];
        const columnWidths = [150, 90, 120, 100];
        let y = doc.y + 35;
        tableHeaders.forEach((header, i) => {
            doc.text(header, 60 + i * 132, y, { width: columnWidths[i], align: 'left' });
            doc.moveTo(50 + i * 100, y + 15).lineTo(50 + i * 130 + columnWidths[i], y + 15).stroke();
        });
        y += 35;
        
        // Draw table rows
        order.items.forEach(item => {
            let x = 50;
            doc.text(item.product.productName, x, y, { width: columnWidths[0], align: 'left' });
            x += columnWidths[0];
            doc.text(item.quantity.toString(), x, y, { width: columnWidths[1], align: 'center' });
            x += columnWidths[1];
            doc.text(`$${item.unitPrice.toFixed(2)}`, x, y, { width: columnWidths[2], align: 'center' });
            x += columnWidths[2];
            doc.text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, x, y, { width: columnWidths[3], align: 'center' });
            y += 35;
        });
        
        // Add total price
        const totalPrice = order.totalPrice.toFixed(2);
        doc.moveDown(1).fontSize(16).text(`Total Price: $${totalPrice}`, { align: 'right' });
        
        // Finalize the PDF document
        doc.end();
    } catch (error) {
        console.error('Error generating PDF invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};
//wallet

exports.getWallet = async (req, res) => {
    try {
        const userId = req.session.user;
        const userDetails = await user.findById(userId).populate('wallet.transactions');
        
        console.log('User Details:', userDetails);
        if (!userDetails) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.render('wallet', { user: userDetails }); // Use userDetails instead of user
    } catch (error) {
        console.error('Error rendering wallet page:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const razorpay = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEYSECRET,
});

exports.generateWalletRazorpay=async (req,res)=>{
    const amount = req.body.amount;
    console.log(amount);
    // Create a Razorpay order
    const options = {
        amount: amount * 100, // Convert amount to paise (Razorpay expects amount in paise)
        currency: "INR",
        receipt: "receipt_order_123",
        payment_capture: 1,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
        console.log(order);
    } catch (error) {
        console.error("Error generating Razorpay order:", error);
        res.status(500).json({ error: "Internal Server Error"});
}

}

exports.walletverifyRazorpayPayment=async(req,res)=>{
    const paymentId = req.body.paymentId;
    const amount = req.body.amount;

    // Verify the payment with Razorpay API
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        console.log("payment");
        console.log(payment);
        // Check if the payment amount and currency match the expected values
        if (payment.amount === amount * 100 && payment.currency === "INR") {
            // Update the wallet balance with the provided amount
            console.log("if");
            const userId = req.session.user; // Assuming you have user authentication middleware
            try {
                const wallet = await user.findOne({ _id: userId });

                if (wallet) {
                    // If wallet exists, update the balance and add a new deposit transaction
                    const updatedBalance = wallet.wallet.balance + parseFloat(amount);

                    await user.updateOne(
                        { _id: userId },
                        {
                            $set: { 'wallet.balance': updatedBalance },
                            $push: { 'wallet.transactions': { type: "deposit", amount: parseFloat(amount), description: "Added balance" } },
                        }
                    );

                    res.json({ success: true });
                } else {
                    // If wallet doesn't exist, return an error
                    res.json({ success: false, error: "Wallet not found for user" });
                }
            } catch (error) {
                console.error("Error updating wallet balance:", error);
                res.json({ success: false, error: "Error updating wallet balance" });
            }
        } else {
            res.json({ success: false, error: "Invalid payment amount or currency" });
        }
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        res.json({ success: false, error: "Internal Server Error" });
    }
}




//post


exports.postUpdateProfile=async(req,res)=>{
    try{
        const{name,phoneNumber,newPassword,confirmPassword}=req.body;

        const userDetails=await user.findById(req.session.user);

        if(!userDetails){
            res.status(404).send('user not found')
        }else{
            if(newPassword!== confirmPassword){
                return res.render('userProfile',{userData:userDetails,errorMessage:'Passwords do not match'});
            }
            userDetails.name=name;
            userDetails.phoneNumber=phoneNumber;
        }
        if(newPassword){
            userDetails.password=newPassword;
            // console.log("pass",userDetails.comparePassword(newPassword))

        }

        await userDetails.save();
        res.redirect('/newprofile');

    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error')
    }
};


exports.postAddAddress = async (req, res) => {
    try {
        const userData = req.session.user;

        const { fullName, houseName, streetAddress, country, state, city, pinCode } = req.body;

        const userId = await user.findById(userData);
        console.log(userId);

        const newAddress = new Address({
            userId: userId._id,
            fullName,
            houseName,
            streetAddress,
            country,
            state,
            city,
            pinCode,
        });

        console.log(newAddress);  

        await newAddress.save();
        console.log("newAddress");
        res.redirect('/address');
    } catch (error) {
        console.log('error is occurs', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.postAddNewAddress = async (req, res) => {
    try {
        const userData = req.session.user;

        const { fullName, houseName, streetAddress, country, state, city, pinCode } = req.body;

        const userId = await user.findById(userData);
        console.log(userId);

        const newAddress = new Address({
            userId: userId._id,
            fullName,
            houseName,
            streetAddress,
            country,
            state,
            city,
            pinCode
        });

        console.log(newAddress);  

        await newAddress.save();
        console.log("newAddress");
        res.redirect('/checkout');
    } catch (error) {
        console.log('error is occurs', error);
        res.status(500).send('Internal Server Error');
    }
}



exports.posteditAddress = async (req, res) => {
    const addressId = req.params.id;
    const { fullName, houseName, streetAddress, country, state, city, pinCode } = req.body;
  
    console.log('Address ID:', addressId);
    console.log('Updated Data:', req.body);
  
    try {
      const address = await Address.findById(addressId);
  
      if (!address) {
        return res.status(404).send('Address not found');
      }
  
     
      address.fullName = fullName;
      address.houseName = houseName;
      address.streetAddress = streetAddress;
      address.country = country;
      address.state = state;
      address.city = city;
      address.pinCode = pinCode;
  
      
      const updatedAddress = await address.save();
  
      console.log('Updated Address:', updatedAddress);
  
      res.redirect('/Address');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  

exports.deleteAddress=async (req,res)=>{
    try{
        const addressId=req.params.id;

        const result=await Address.findByIdAndDelete(addressId);

        if(result){
            res.json({success:true,message:'Address Deleted'})
        }else{
            res.json({success:false,message:'Failed to delete address'})
        }
    }catch{
        console.error('Error:',error);
        res.status(500).json({success:false,message:"Server  Error"})
    }
}


exports.addToCart = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.session.user;
        console.log('hit');

         // Retrieve the product information
         const product = await Product.findById(id);

         if (!product || !product.isVisible || product.stockCount <= 0) {
             return res.status(404).json({ error: 'Product not available' });
         }

        let userCart = await Cart.findOne({ user: userData }).populate('items.product');
        console.log("datas:", userCart);

        if (!userCart) {
            userCart = new Cart({ user: userData, items: [] });
        }

        const existingItem = userCart.items.find((item) => item.product.equals(id));

        if (existingItem) {
            if (existingItem.quantity + 1 > product.stockCount) {
                return res.status(400).json({ error: 'Quantity exceeds available stock' });
            }
            existingItem.quantity += 1;
        } else {
            if (1 > product.stockCount) {
                return res.status(400).json({ error: 'Quantity exceeds available stock' });
            }
            userCart.items.push({ product: id, quantity: 1 });
        }

        console.log(userCart.items);
        await userCart.save();

       
        res.status(200).json({ message: 'Item added to the cart successfully.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
      const { productId } = req.params;
      const { newQuantity } = req.body;
      const userData = req.session.user;
  
      const userCart = await Cart.findOne({ user: userData });
  
      const cartItem = userCart.items.find((item) => item.product.equals(productId));

      const product = await Product.findById(productId);
  
      if (cartItem) {
        // cartItem.quantity =  cartItem.quantity + -newQuantity;
        cartItem.quantity = newQuantity;
        await userCart.save();
        res.status(200).send('Quantity updated successfully.');
      } else {
        res.status(404).send('Item not found in the cart.');
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  };




exports.removeFromCart=async (req,res)=>{
    try{
        console.log('Remove from cart route hit');
        const{productId}=req.params;
        const userData=req.session.user;

        const userCart=await Cart.findOne({user:userData});

        userCart.items=userCart.items.filter((item)=>!item.product.equals(productId))

        await userCart.save();
//return res.status(200)
// res.redirect('/cart')
// return res.status(200).json({ message: 'Item removed from the cart successfully.' });
res.redirect('/cart');

}catch(error){
        console.error('Error',error);
        res.status(500).send('internal server error');
    }
}

//place order
exports.placeOrder = async (req, res) => {
    try {
        console.log('Order side hit');
        const { addressId, paymentMethod, couponCode,Paymentstatus } = req.body;
        const userData = req.session.user;
        
        const paymentstatus = Paymentstatus ? Paymentstatus : "confirmed";
        const userDetails = await user.findById(userData);
        const walletBalance = userDetails.wallet.balance;

        if (!addressId || !paymentMethod) {
            return res.status(400).json({ error: 'Please select a delivery address.' });
        }

        console.log('Coupon code:', couponCode);

        const userCart = await Cart.findOne({user:userData }).populate('items.product');
        console.log('User cart:', userCart);

        if (!addressId || !paymentMethod || !userCart) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        const validAddress = userCart.user.toString() === userData.toString();
        console.log('Valid address:', validAddress);
        
        if (!validAddress) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        console.log('Cart items:', userCart.items);

   //refferel
        if (userDetails.referredCode) {
            // Check if this is the first order of the referred user
            const referredUser = await user.findOne({ referralCode: userDetails.referredCode });
            if (referredUser && !referredUser.firstOrderCompleted) {
                // Add 100 rupees to the wallet of the referred user
                referredUser.wallet.balance += 100;
                referredUser.firstOrderCompleted = true; // Mark the first order as completed
                await referredUser.save();
                console.log('Referred user rewarded with 100 rupees for the first order.');
            }
        }
            let product
            let orderTotal = 0;
        for (const item of userCart.items) {
             product = item.product;

            console.log('Product stock1:', product.stockCount);

            if (product.stockCount < item.quantity) {
                console.log('Insufficient stock for some products');
                return res.status(400).json({  error: 'Insufficient stock for some products' });
            }

            console.log('Product stock1:', product.stockCount);
            product.stockCount -= item.quantity;
            console.log('Product stock2:', product.stockCount);
            orderTotal += product.price * item.quantity;
        }

        if (orderTotal  > 4000 && paymentMethod === 'cod') {
            return res.status(400).json({ error: 'Orders above Rs 4000 are not allowed for Cash on Delivery' });
        }

        // Apply coupon if provided
        let totalPrice;
        let discountAmount = 0
        let appliedCouponId; // Variable to hold the ID of the applied coupon
        const hasOfferPriceItems = userCart.items.some(item => item.product.offerDiscountPercentage > 0);
        
        if (hasOfferPriceItems && couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode });
            // Calculate total price with discount for items with an offer price and applied coupon
            const subtotal = userCart.items.reduce((total, item) => total + item.product.price * item.quantity * (1 - item.product.offerDiscountPercentage / 100), 0);
            discountAmount = (subtotal * coupon.discountPercentage) / 100;
            totalPrice = subtotal - discountAmount;
            appliedCouponId = coupon._id;
        } else if (hasOfferPriceItems) {
            // Calculate total price with discount for items with an offer price (no coupon applied)
            const subtotal = userCart.items.reduce((total, item) => {
                // Calculate the discounted price for each item and add it to the total
                const discountedPrice = item.product.price * (1 - item.product.offerDiscountPercentage / 100) * item.quantity;
                return total + discountedPrice;
            }, 0);
        
            // Add delivery fee
            totalPrice = subtotal + 50;
        
            // Calculate the discount amount by subtracting the total price with discount from the original total price
            discountAmount = orderTotal - subtotal;
        }

        else if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode });
            if (!coupon) {
                return res.status(400).json({ error: 'Invalid coupon code' });
            }
            const subtotal = userCart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
            discountAmount = (subtotal * coupon.discountPercentage) / 100;
            totalPrice = subtotal - discountAmount;
            appliedCouponId = coupon._id; // Assign the ID of the applied coupon
        } else {
            const deliveryFee = 50;
            const subtotal = userCart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
            totalPrice = subtotal + deliveryFee;
        }

        // Create order
        const order = new Order({
            user: userData,
            items: userCart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                unitPrice: item.product.price,
                status: 'pending',
            })),
            shippingAddress: await Address.findById(addressId),
            paymentMethod,
             disamnt : discountAmount,
            totalPrice,
            appliedCoupon: appliedCouponId,
            paymentstatus: paymentstatus, // Assign the ID of the applied coupon to the order
        });

        console.log('orderdetails',order)

        if (paymentMethod === 'wallet' && walletBalance < totalPrice) {
            return res.status(400).json({ error: 'Insufficient wallet balance' });
        }

          // Deduct the purchase amount from the wallet balance if paying with wallet
          if (paymentMethod === 'wallet') {
            userDetails.wallet.balance -= totalPrice;

            userDetails.wallet.transactions.push({
                description: `Deducted for order: ${order._id}`,
                amount: -totalPrice,
                deductedAmount: totalPrice
            });
            
            await userDetails.save();
        }

        await product.save();

        await order.save();

        // Clear user cart
        userCart.items = [];
        await userCart.save();

        res.status(201).json({ order });
    } catch (error) {
        console.error('Error in placeOrder:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.handlePaymentFailure=async(req,res)=>{
    try {
        const { id } = req.body;

        // Update the corresponding order's payment status to "failed"
        const order = await Order.findByIdAndUpdate(id, { paymentstatus: 'confirmed' }, { new: true });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(200).json({ message: 'Payment status updated to failed' });
    } catch (error) {
        console.error('Error handling payment failure:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

//orderCancel

exports.orderCancel = async (req, res) => {
    console.log('cancel hits');
    const { orderId ,itemId} = req.params;
    console.log(itemId);
    const { reason } = req.body;

    try {
        const updateOrder = await Order.findById(orderId);

        if (!updateOrder) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        const itemToCancel = updateOrder .items.find(item => item._id.toString() === itemId);

       
        itemToCancel.status = 'cancelled';
        itemToCancel.cancellationReason = reason;
            
        const productId = itemToCancel.product; // Assuming 'product' is the field in your item representing the product ID
        const quantityToRestore = itemToCancel.quantity;

        // Increment the stock of the canceled product
        const canceledProduct = await Product.findOne({ _id: productId });
        canceledProduct.stockCount += quantityToRestore;

         
             // Check if payment method is RazorPay
             if (updateOrder.paymentMethod === 'RazorPay' || updateOrder.paymentMethod === 'wallet')  {
                // Update user's wallet balance with the total order price
                userWallet = await user.findById(updateOrder.user);
                userWallet.wallet.balance += updateOrder.totalPrice;
    
                walletUpdate = {
                    description: 'Order Cancelled',
                    amount: updateOrder.totalPrice,
                    date: new Date(),
                };
    
                userWallet.wallet.transactions.push(walletUpdate);
            }
    

        const savedOrder = await updateOrder.save();
        await canceledProduct.save()
        await userWallet.save();

        console.log('updateOrder:', savedOrder);

        res.json({ success: true, order: savedOrder });
    } catch (error) {
        console.error("Error In orderStatus", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};



//order return
exports.orderReturn=async(req,res)=>{
    console.log('return hit')
    const {orderId,itemId}=req.params;
    const {reason}=req.body;
    try {
        const updateOrder = await Order.findById(orderId);

        if (!updateOrder) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        const itemToReturn = updateOrder.items.find(item => item._id.toString() === itemId);

        if (!itemToReturn || itemToReturn.status !== 'delivered') {
            return res.status(400).json({ success: false, error: 'Invalid return request' });
        }

        itemToReturn.status = 'return_requested';
        itemToReturn.returnReason = reason;

        const productId=itemToReturn.product;
        const quantityToRestore=itemToReturn.quantity;

        const returnedproduct=await Product.findOne({_id:productId});
        returnedproduct.stockCount +=quantityToRestore;

         // Increment user's wallet balance
         const useReturn =await user.findById(updateOrder.user);
         useReturn.wallet.balance += returnedproduct.price; 

         const walletUpdate = {
            description: 'Product Returned',
            amount: returnedproduct.price,
            date: new Date(),
        };

        useReturn.wallet.transactions.push(walletUpdate);

        const savedOrder = await updateOrder.save();
        await returnedproduct.save();
        await useReturn.save();

        

        res.json({ success: true, order: savedOrder });
        
    } catch (error) {
        console.error('Error in orderReturn:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
//return expiry

exports.returnExpiry=async (req,res)=>{
    try {
        // Find orders with status 'delivered' and update status to 'return_expired'
        const updatedOrders = await Order.updateMany(
            { 'items.status': 'delivered' },
            { $set: { 'items.$.status': 'return_expired' } }
        );
        
        // Check if any orders were updated
        if (updatedOrders.nModified > 0) {
            res.json({ success: true, message: 'Status updated successfully' });
        } else {
            res.json({ success: false, message: 'No orders found with status "delivered"' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

//whishlist

exports.toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId= req.session.user;

        // Find the user's wishlist
        let wishlist = await Wishlist.findOne({ user: userId });

        // If the wishlist doesn't exist, create a new one
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, items: [] });
            await wishlist.save();//last added
        }

        // Check if the product is already in the wishlist
        const existingItemIndex = wishlist.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex === -1) {
            // Add the product to the wishlist
            wishlist.items.push({ product: productId });
        } else {
            // Remove the product from the wishlist
            wishlist.items.splice(existingItemIndex, 1);
        }

        // Save the updated wishlist
        await wishlist.save();

        // Populate the product details if needed
        // const productDetails = await Product.findById(productId);

        return res.json({ success: true /*, productDetails */ });
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.session.user;
        console.log('UserID:', userId);

        // Find the user's wishlist
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.json({ success: false, message: 'Wishlist not found.' });
        }

        // Remove the product from the wishlist
        wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
        await wishlist.save();

        // Optionally, you can send a success message or updated wishlist to the client
        return res.json({ success: true, message: 'Product removed from wishlist.' });
        redirect('/whishlist');
        
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};



