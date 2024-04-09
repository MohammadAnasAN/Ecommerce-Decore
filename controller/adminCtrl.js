const Admin= require('../model/adminMdl')
const Order=require('../model/orderMdl')
const Product=require('../model/addProductMdl')

const express=require('express')
// const category = require('../models/category')
// const product = require('../models/product')


//admin get login
exports.AdminGetLogin=(req,res)=>{
 
    res.render('adminLogin');
}
exports.userManagement=(req,res)=>{
  res.render('userAdmin');
}
exports.AdminGetDash = async (req, res) => {
  try {
      // Retrieve total price earned each day
      const totalPriceByDay = await Order.aggregate([
          {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  totalEarned: { $sum: "$totalPrice" }
              }
          },
          { $sort: { _id: 1 } }
      ]);
      const labelOrder = ['pending', 'shipped', 'delivered','cancelled','return_requested','returned'];

      const statusCounts = await Order.aggregate([
        {
          $group: {
            _id: '$items.status',
            count: { $sum: 1 }
        }
        }
    ]);
    
    console.log('Status Counts:', statusCounts);

    // const labels = statusCounts.map(data => data._id);
    // const data = statusCounts.map(data => data.count);

    const data = labelOrder.map(label => {
      const statusCount = statusCounts.find(entry => entry._id.includes(label));
      return statusCount ? statusCount.count : 0;
  });
      console.log('nsdjh',totalPriceByDay)
      console.log('Labels:', labelOrder);
        console.log('Data:', data);

        const productsOrderedPerDay = await Order.aggregate([
          {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  count: { $sum: { $size: "$items" } }
              }
          }
      ]);

      // Extract dates and counts for bar chart
      const barLabels = productsOrderedPerDay.map(entry => entry._id);
      const barData = productsOrderedPerDay.map(entry => entry.count);

      const topSellingProducts = await Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.product", count: { $sum: "$items.quantity" } } },
        { $sort: { count: -1 } },
        { $limit: 7 } // Adjust the limit as needed
    ]).exec();

    // Fetch product details for the top-selling products
    const topSellingProductsDetails = await Product.find({ _id: { $in: topSellingProducts.map(product => product._id) } });

    // Combine product details with sales count
    const topSellingProductsData = topSellingProductsDetails.map(product => {
        const salesCount = topSellingProducts.find(item => item._id.equals(product._id)).count;
        return { ...product.toObject(), salesCount };
    });

      res.render('dash', { totalPriceByDay,labels:labelOrder, data,barLabels: barLabels, barData: barData ,topSellingProducts: topSellingProductsData  });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
};



exports.getTopSellingProducts=async(req,res)=>{
  try {
    // Aggregate data to find top selling products
    const topSellingProducts = await Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.product", totalQuantity: { $sum: "$items.quantity" } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 } // Adjust limit as needed
    ]);

    console.log('topSelling',topSellingProducts);

    // Extract product IDs from aggregation result
    const productIds = topSellingProducts.map(item => item._id);

    // Fetch product details for top selling products
    const products = await Product.find({ _id: { $in: productIds } });

    res.status(200).json({ topSellingProducts: products });
} catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}
}



exports.AdminGetproduct=(req,res)=>{
  res.render('productManag')
}

// Admin Post Login
exports.AdminPostLogin = async (req, res) => {
    try {
      const data = {
        name: req.body.username,
        password: req.body.password
       
      };
      console.log("Request body:", req.body);
      console.log("Data:", data);
      const admin = await Admin.findOne({
        name: data.name,
        password: data.password
        
      });
  
      console.log("Admin:", admin);
  
      if (!admin) {
        console.log("Incorrect credentials");
       
        console.log("Admin login failed");
        return res.render("adminLogin", { errorMessage: "Wrong username or password" });
      } else {
        req.session.admin=admin._id;
        res.redirect("/userAdmin");
      }
    } catch (error) {
      console.error(error);
      res.render("adminLogin", { errorMessage: "Internal Server Error" });
    }
  };

exports.getadminlogout=(req,res)=>{
  res.render('adminLogin')
}