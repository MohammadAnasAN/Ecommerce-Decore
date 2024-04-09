const express=require('express');
const mongoose=require('../config/dbConnect');
const Address=require('../model/addressMdl');
const user=require('../model/userSchema')
const Cart=require('../model/cartMdl')
const Product=require('../model/addProductMdl')
const Order= require('../model/orderMdl');
const Wishlist=require('../model/wishlistMdl')
const Razorpay = require("razorpay");


exports.razorpay=async(req,res)=>{

    console.log("Inside RazorPay");
    const { amount } = req.body;
    console.log("amount",amount);
    var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEYSECRET});
    var options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    // Creating the order
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
        res.status(500).send("Error creating order");
        return;
      }
     
      res.send({ orderId: order.id });
      // Replace razorpayOrderId and razorpayPaymentId with actual values
      // Redirect to /orderdata on successful payment
    });
  
}

exports.razorPayOrder=async(req,res)=>{
  try{
      console.log('order side hitz on razorpay')
      const{addressId,paymentMethod,couponCodedata}=req.body;

      console.log("couponCodedata",couponCodedata);
      const user=req.session.user;

      const userCart=await Cart.findOne({user}).populate('items.product');
      // console.log('userCArt',userCart)

      if(!addressId || !paymentMethod || !userCart){
          return res.status(400).json({error:'Invalid request data'});
      }

      const validAddress=userCart.user.toString()===req.session.user.toString();// checking selected address belongs to the user
      // console.log('valdadd',validAddress)
      if (!validAddress) {
          return res.status(400).json({ error: 'Invalid address' });
      }

       console.log('validAddress::',validAddress)
       console.log('cart items:',userCart.items)
      for(const item of userCart.items){
          const product=item.product;

        

          if (product.stockCount < item.quantity) {
              console.log('vgjgjjcjc')
              return res.status(400).json({ success:false, error: 'Insufficient stock for some products' });
          }
     
          console.log("product stock1",product.stockCount)

          product.stockCount -= item.quantity;
          console.log("product stock2",product.stockCount)
          await product.save();
        

      }
      
      const deliveryFee = 50; 
      const subtotal = userCart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      const totalPrice = subtotal + deliveryFee;

       // Create order
       const order = new Order({
          user,
          items: userCart.items.map(item => ({
              product: item.product._id,
              quantity: item.quantity,
              unitPrice: item.product.price,
              status: 'pending',
          })),
          shippingAddress: await Address.findById(addressId),
          paymentMethod,
          totalPrice,
      });

     

      await order.save();

      // Clear user cart
      userCart.items = [];
      await userCart.save();

      
      res.status(201).json({ order });


  }catch (error){
      console.error('Error in placeOrder:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}


// exports.placeOrder=async(req,res)=>{
//   try{
//       console.log('order side hit')
//       const{addressId,paymentMethod}=req.body;
//       const user=req.session.user;

//       const userCart=await Cart.findOne({user}).populate('items.product');
//       console.log('userCArt',userCart)

//       if(!addressId || !paymentMethod || !userCart){
//           return res.status(400).json({error:'Invalid request data'});
//       }

//       const validAddress=userCart.user.toString()===req.session.user.toString();// checking selected address belongs to the user
//       console.log('valdadd',validAddress)
//       if (!validAddress) {
//           return res.status(400).json({ error: 'Invalid address' });
//       }

//        console.log('validAddress::',validAddress)
//        console.log('cart items:',userCart.items)
//       for(const item of userCart.items){
//           const product=item.product;

        

//           if (product.stockCount < item.quantity) {
//               console.log('vgjgjjcjc')
//               return res.status(400).json({ success:false, error: 'Insufficient stock for some products' });
//           }
     
//           console.log("product stock1",product.stockCount)

//           product.stockCount -= item.quantity;
//           console.log("product stock2",product.stockCount)
//           await product.save();
        

//       }
      
//       const deliveryFee = 50; 
//       const subtotal = userCart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
//       const totalPrice = subtotal + deliveryFee;

//       // Generate Razorpay order ID
//   const razorpayOrder = await generateRazorpayOrder(totalPrice);

//       // Create order
//       const order = new Order({
//           user,
//           items: userCart.items.map(item => ({
//               product: item.product._id,
//               quantity: item.quantity,
//               unitPrice: item.product.price,
//               status: 'pending',
//           })),
//           shippingAddress: await Address.findById(addressId),
//           paymentMethod,
//           totalPrice,
//           paymentDetails: {
//               method: 'Razorpay',
//               razorpayOrderId: razorpayOrder.orderId,
//             },
//       });

//       await order.save();

//       // Clear user cart
//       userCart.items = [];
//       await userCart.save();

      
//       res.status(201).json({ order });


//   }catch (error){
//       console.error('Error in placeOrder:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }
// }



// exports.razorpayPayment=async(req,res)=>{
    
//     try {
  
//         const userId = req.session.user;
//         const userCart = await cart.find({ userId: userId });
//         const productData = await product.find();
//         const { razorpay_payment_id, address } = req.body;
  
//         const submittedData = {
//             userId: userId,
//             paymentMethod: "RazorPay",
//             selectedAddress: address
//         };
  
  
//         const fetchedAddressData = await Address.findOne({ _id: address });
  
//         const orderNumber = generateOrderNumber();
  
//         if(fetchedAddressData){
          
        
//           const orderData = await Order.create({
//               orderNumber: orderNumber,
//               userId: submittedData.userId,
//               products: userCart.map(item => ({
//                   productId: item.productId,
//                   productName: item.productName,
//                   productImage: item.productImage,
//                   quantity: item.quantity,
//                   price: item.price,
//                   status: 'Pending',
//                   // discountPrice: item.discountPrice || 0     
//               })),
//               totalQuantity: userCart.reduce((total, item) => total + item.quantity, 0), 
//               totalPrice: userCart.reduce((total, item) => total + (item.quantity * item.price), 0), 
//               address: {
//                   name: fetchedAddressData.name,  
//                   address: fetchedAddressData.address,
//                   locality: fetchedAddressData.locality,
//                   phone: fetchedAddressData.phone,
//                   pincode: fetchedAddressData.pincode,
//                   state: fetchedAddressData.state
//               },
//               paymentMethod: submittedData.paymentMethod,
//               orderDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
//           });
          
//           const minusQuantityPromises = userCart.map(async (item) => {
//             const productToUpdate = productData.find(product => product._id.toString() === item.productId.toString());
//             if (productToUpdate && productToUpdate.stockCount >= item.quantity) {
//                 await product.updateOne(
//                     { _id: item.productId },
//                     { $inc: { stockCount: -item.quantity } }
//                 );
//             } else {
//                 throw new Error(Insufficient stock for product ${item.productId});
//             }
//         });
//         await Promise.all(minusQuantityPromises);
        
//           const deletedData = await cart.deleteMany({ userId: userId });
//          res.redirect("/paymentSuccess")
//         }
  
//     } catch (error) {
//       console.log(error);
//       res.render("pageNotFound404");
//     }
  
// }

// router.post('/order2ForRazorPay', async (req, res) => {
//     const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
//     // Verify the Razorpay signature
//     const isValidSignature = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  
//     if (!isValidSignature) {
//       return res.status(400).json({ success: false, error: 'Invalid Razorpay signature' });
//     }
  
//     // Find the order using Razorpay order ID
//     const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpay_order_id });
  
//     if (!order) {
//       return res.status(404).json({ success: false, error: 'Order not found' });
//     }
  
//     // Update the order status to 'paid' and save the Razorpay payment details
//     order.status = 'paid';
//     order.paymentDetails = {
//       method: 'Razorpay',
//       razorpayOrderId,
//       razorpayPaymentId,
//       razorpaySignature,
//     };
  
//     await order.save();
  
//     // Send a success response to the client
//     res.json({ success: true, message: 'Payment successful', order });
//   });
  