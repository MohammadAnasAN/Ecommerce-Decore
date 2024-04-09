const express=require('express')
const adminController=require('../controller/adminCtrl') 
const admincategory=require('../controller/categoryCtrl');
const adminProduct=require('../controller/addProductCtrl');
const adminUser=require('../controller/userManageCtrl')
const adminOrder=require('../controller/adminOrderCtrl')
const uploads = require("../middleware/multer");
const adminCoupon=require("../controller/couponCtrl")
const adminSale=require('../controller/salesReportCtrl')
const adminSession=require('../middleware/adminSession')

const router=express.Router()

//login
router.get('/adminLogin',adminController.AdminGetLogin)
router.post('/adminLogin',adminController.AdminPostLogin)

router.get('/userAdmins',adminController.userManagement)
router.get('/dash',adminController.AdminGetDash)
router.get('/top-selling-products',adminController.getTopSellingProducts)

router.get('/adminLogin',adminController.getadminlogout)
// router.get('/product',adminController.AdminGetproduct)
//category
router.get('/category',admincategory.categorys)
router.post('/category',admincategory.addCategory)
router.post("/deleteCategory/:categoryId",admincategory.deleteCategory)
router.get("/editCategory/:id",admincategory. getEditCategory);
router.post("/editCategory/:id", admincategory.postEditCategory);
router.post("/blockCategory/:id", admincategory.Unlistcategory);
//addproduct
router.get('/productManag',adminProduct.getProducts)
router.get('/addproduct',adminProduct.addProducts)

router.post('/addproduct/:productid',uploads,adminProduct.AddProductPost)

//editproduct
router.get("/editproduct/:id",adminProduct.getEditProduct)
router.post("/editproduct/:id",uploads,adminProduct.editProduct);

router.post('/deleteImage/:id', adminProduct.deleteImage);
//delete and visible
router.post("/updateVisibility/:id",adminProduct.productVisibility);
router.post("/deleteProduct/:productId",adminProduct.deleteProduct);

//blockedUserr
router.get('/userAdmin',adminSession,adminUser.userManagement)
router.post('/blockUser/:userid',adminUser.blockUser)


//adminOrder

router.get('/orderManage',adminOrder.getOrderManag)

router.post('/orderStatusUpdate/:orderId/:itemId',adminOrder.postOrderManag)

//coupon

router.get('/coupon',adminCoupon.coupon)
router.get('/couponAdd',adminCoupon.addCoupon)
router.get('/editCouponPage/:id',adminCoupon.editCouponPage)

router.post('/saveCoupon',adminCoupon.saveCoupon)
router.post('/deleteCoupon/:id',adminCoupon.deleteCoupon)
router.post('/editCoupon/:id',adminCoupon.editCoupon)

//salesReport
router.get('/salesReport',adminSale.sales)
router.get('/pdf',adminSale.generatePDF)

router.get('/excel',adminSale.generateExcel)

module.exports = router;