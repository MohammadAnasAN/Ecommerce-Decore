
const express  = require("express");
const userConnection = require('../model/userSchema');
const router = express.Router();
const usercontroller=require("../controller/userCtrl")
const usershop=require('../controller/shopCtrl')
const useraddress=require('../controller/profileCtrl')
const userSession=require('../middleware/userSession');
const userRazorpay=require('../controller/razorpayCtrl')
const userCoupon=require('../controller/couponCtrl')


// get
// const {
    
//     getLogin,
//     getSignup

// } = require("../controller/userCtrl")


// router.get("/",getLogin);


// router.get('/signup',getSignup)
// post
// const {
    
//     postSignup,
//     postLogin

// } = require("../controller/userCtrl")


router.get('/login',usercontroller.getLogin)
router.get('/signup',usercontroller.getSignup)


router.post('/signup',usercontroller.postSignup);
router.post('/user/login',usercontroller.postLogin)

router.get('/verifyemail',usercontroller.verifyemail)
router.post('/getOtp',usercontroller.verifypost)
 router.post('/resendotp',usercontroller.resendotp)
//home
router.get('/home',userSession,usershop.getHome)
//getLandingpage

router.get('/',usershop.getLand)

router.get('/homeproduct',userSession,usershop.getHomeProduct)

router.get('/office',userSession,usershop.getOffice)//pagination along with iyyyyyy
//display
router.get('/display/:id',userSession,usershop.display)
router.put('/edit-review/:id',userSession,usershop.putEditReview)

router.delete('/delete-review/:reviewId',userSession,usershop.deleteReview)

//search
router.get('/search', userSession, usershop.sortProducts);

//sort

router.get('/Home/:criteria', userSession, usershop.sortProducts);


// router.get('/total-pages',userSession,usershop.pagination)




//logout
router.get('/logout',usercontroller.Getlogout);
router.post('/logout',usercontroller.postLogout);


//profile

////////////////////////////////////////
//address

router.get('/Address',userSession,useraddress.getAddress);


router.get('/AddAddress',userSession,useraddress.getAddaddress);
router.get('/AddressCheckout',userSession,useraddress.getAddNewaddressCheck);//from check out to new address page

router.post('/AddNewAddress',userSession,useraddress.postAddAddress)
router.post('/NewAddressCheckout',userSession,useraddress.postAddNewAddress)//address add in the checkout page


router.get('/editAddress/:id',userSession,useraddress.geteditAddress)
router.post('/posteditAddress/:id',userSession,useraddress.posteditAddress)


router.post('/deleteAddress/:id',userSession,useraddress.deleteAddress)

//cart

router.get('/cart',userSession,useraddress.getCart)
router.post('/add-to-cart/:id',userSession,useraddress.addToCart)
router.post('/updateQuantity/:productId', useraddress.updateQuantity)
router.post('/removeFromCart/:productId',   useraddress.removeFromCart)

//profile
router.get('/newprofile',userSession,useraddress.getprofile);
router.post('/updateProfile',userSession,useraddress.postUpdateProfile);

//refereral

router.post('/createReferral',useraddress.createReferral)
router.post('/checkReferralCode',useraddress.checkReferralCode)


//checkout
router.get('/checkout',userSession,useraddress.getCheckout);
router.get('/checkoutFailure/:orderId',userSession,useraddress.getCheckout);

// router.post('/placeOrder',usershop.Placeorder);


router.post('/place-order',userSession, useraddress.placeOrder);
router.post('/payment-failure',userSession,useraddress.handlePaymentFailure)

//orderpage

router.get('/orderPage',userSession,useraddress.getOrderPage)

//orderDetails
router.get('/order/:orderId',userSession,usershop.orderDetails)

//ordercancel

router.post('/cancelOrder/:orderId/:itemId',userSession,useraddress.orderCancel)

//orderReturn

router.post('/returnOrder/:orderId/:itemId',useraddress.orderReturn)

//return expiry
router.post('/updateStatus',useraddress.returnExpiry)

//invoice
router.get('/generatePDFInvoice/:orderId',userSession,useraddress.generatePDFInvoice)

//razorpay

router.post('/razorpayInstance/:orderid',userSession,userRazorpay.razorpay)
router.post('/razorpay',userSession,userRazorpay.razorPayOrder)
 
//whishlist
router.get('/whishlist',userSession,useraddress.getWhishlist);
router.post('/toggleWishlist/:productId',userSession,useraddress.toggleWishlist)
router.post('/removeFromWishlist/:productId',userSession,useraddress.removeFromWishlist)
// router.get('/checkWishlistStatus/:productId',userSession,useraddress.checkWishlist)
// router.post('/removeFromWishlist/:productId',useraddress.removeFromWishlist)

//wallet
router.get('/wallet',userSession,useraddress.getWallet);
router.post('/verify-razorpay-payment',userSession,useraddress.walletverifyRazorpayPayment)
router.post('/generate-razorpay-order',userSession,useraddress.generateWalletRazorpay)
//applying coupon
router.post('/apply-coupon',userSession,userCoupon.applyCoupon)

router.post('/remove-coupon',userSession,userCoupon.removeCoupon)

//rating
router.post('/rate-product',userSession,usershop.productRating)

//review
router.post('/write-review',userSession,usershop.writeReview)

 
module.exports = router;

