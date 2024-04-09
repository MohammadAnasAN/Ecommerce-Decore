const express = require("express");
const router = express();
// const bcryptjs = require("bcryptjs");
const mongoose = require("../config/dbConnect");
const AddProduct = require("../model/addProductMdl");
const multer = require("../middleware/multer");
const categoryCollection = require("../model/categoryMdl")

//get

exports.getEditProduct = async (req, res) => {
    const id = req.params.id;
    try {
      
      // const categories = await categoryCollection.distinct(' categoryName');
      const categories = await categoryCollection.find({ isBlocked:false}, { categoryName: 1, _id: 0 })

      const items = await AddProduct.findById(id);
      console.log("Productsss", items, categories);
      res.render("editproduct", { items, categories});

    } catch (error) {
      console.log("Error occure in getEditProduct", error);
    }
  };




exports.addProducts = async (req, res) => {
    try {
      const product = await AddProduct.find();
      const categories = await categoryCollection.find({ isBlocked:false});
      console.log(categories);
      console.log(product);
      res.render("addProduct", { categories, product });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };




// exports.getProducts = async (req, res) => {
   
//     try {
     
      
//       const categories = await AddProduct.find();//product
      
//       const productId = await AddProduct.findById();
//       console.log(categories+"categories");
//       res.render("productManag", { categories});
      
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Internal Server Error");
//     }
//   };
exports.getProducts = async (req, res) => {
  try {
      const products = await AddProduct.find();
      
      // Fetch category names for all products
      const categoryNames = products.map(product => product.selectCategory);

      // Remove duplicate category names (if any)
      const uniqueCategoryNames = [...new Set(categoryNames)];

      // Fetch category details based on category names
      const categories = await categoryCollection.find({ categoryName: { $in: uniqueCategoryNames } });

      // Map category details to product objects
      const productsWithCategory = products
      .filter(product => {
          const category = categories.find(cat => cat.categoryName === product.selectCategory);
          return category && !category.isBlocked; // Exclude products from blocked categories
      })
      .map(product => {
          const category = categories.find(cat => cat.categoryName === product.selectCategory);
          return {
              ...product.toObject(),
              categoryName: category ? category.categoryName : 'Unknown Category'
          };
      });

      res.render("productManag", { categories: productsWithCategory });
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
};



  //post 

  //addproduct post
  exports.AddProductPost = async (req, res) => {
    try {
      const productId = req.params.productid;
  
      const {
        productName,
        price,
        description,
        selectCategory,
        stockCount,
        productRating,
        isVisible,
        offerDiscountPercentage
      } = req.body;
  
      let productImage = [];
  
      if (req.files && req.files.length > 0) {
        const fileUrls = req.files.map((file) => ` /uploads/${file.filename}`);
        productImage = fileUrls;
      }
  
      console.log("Product is ", productId);
      const Product = await AddProduct.findOne();
  
      const data = {
        productName: productName,
        price: price,
        description: description,
        selectCategory: selectCategory,
        productImage: productImage,
        productRating: productRating,
        stockCount: stockCount,
        isVisible: isVisible,
        offerDiscountPercentage: offerDiscountPercentage,
      };
  
      const updatedProduct = await AddProduct.create(data);
      return res.json({ success: true, message: 'Product added successfully' });
      res.redirect("/productManag");
    } catch (error) {
      console.error("Error updating product:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

  //product editing post

  exports.editProduct = async (req, res) => {
    try {
      const productId = req.params.id;
  
      console.log("productId:", productId);
      console.log("body:", req.body);
  
      let productImage = [];
  
      if (req.files && req.files.length > 0) {
        const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
        productImage = fileUrls;
      } else {
        // If no new images are uploaded, keep existing images
        const existingProduct = await AddProduct.findById(productId);
        if (existingProduct.productImage && existingProduct.productImage.length > 0) {
          productImage = existingProduct.productImage;
        }
      }
      console.log(productImage);

      
      
      // if (req.body.price<1){
      //   res.send(500)('you entered a negative number please add postive price')
      // }
      if (req.body.price < 0) {
        res.status(500).send('You entered a negative number. Please add a positive price.');
      }
  
      await AddProduct.findByIdAndUpdate(productId, {
        productName: req.body.productName,
        price: req.body.price,
        description: req.body.description,
        selectCategory: req.body.selectCategory,
        productImage: productImage,
        rating: req.body.rating,
        stockCount: req.body.stockCount,
        offerDiscountPercentage:  req.body.offerDiscountPercentage,
      }).then((pass) => {
        console.log("UpdatedProduct:", pass);
        res.redirect("/productManag");
      });
  
    } catch (error) {
      console.log("Error occurred in editProduct", error);
      res.status(500).send("Internal Server Error");
    }
  };
  


  exports.deleteImage =async (req, res) => {
    try {
        const id = req.params.id;
        const indexToRemove = req.body.index;

        const unsetQuery = { $unset: { [`productImage.${indexToRemove}`]: 1 } };
        await  AddProduct.findByIdAndUpdate(id, unsetQuery);

        await AddProduct.findByIdAndUpdate(id, { $pull: { imageUrl: null } });
        
        const updatedProduct = await AddProduct.findById(id);
        
        if (updatedProduct) {
            console.log(updatedProduct);
            res.status(200).json({ success: true, message: 'Image deleted successfully', data: updatedProduct });
        } else {
            res.status(404).json({ success: false, message: 'Index not found in imageUrl array' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
  
  

  exports.productVisibility = async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await AddProduct.findById(productId);
  
      if (!product) {
        return res.status(404).send("Product not found");
      }
  
      product.isVisible = !product.isVisible;
  
      await product.save();
  
      res.redirect("/productManag");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  exports.deleteProduct = async (req, res) => {
    const productId = req.params.productId;
    console.log("Product ID", productId);
    try {
      const result = await AddProduct.findByIdAndDelete(productId);
  
      console.log("Deleted Product", result);
      if (!result) {
        return res.status(404).send("Product not found");
      }
  
      res.redirect("/productManag");
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).send("Internal Server Error");
    }
  };