const express=require('express')
const mongoose=require('../config/dbConnect.js')
const Admin=require('../model/adminMdl');
const categoryCollection=require('../model/categoryMdl.js');
const bodyParser = require('body-parser');
const Product=require('../model/addProductMdl.js')

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

//get

exports.categorys=async(req,res)=>{
    try{
        const categories= await categoryCollection.find();
        res.render("category",{categories})
    }catch(error){
        console.error(error);
        res.status(500).send('internal server is occurs')
    }
}

exports.getEditCategory = async (req, res) => {
  let id = req.params.id;
  console.log("Category ID:", id);
  try {
    const allCategories = await categoryCollection.find();
    const category = await categoryCollection.findById(id);
    console.log('All Categories:', allCategories);
    console.log('Category by ID:', category);

    res.render("editCategory", { data: allCategories, id, name: category.categoryName , offer: category.categoryOffer});
  } catch (error) {
    console.log(error);
    console.log('Error While Getting CategoryEdit');
  }
}



//POST


exports.addCategory = async (req, res) => {
  const { categoryName, categoryOffer } = req.body;
  console.log(categoryName);
  console.log('offer',categoryOffer);
  try {
    if (!categoryName || categoryName.trim() === "") {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    if (/^\d/.test(categoryName)) {
      return res.status(400).json({
        error: 'Category name cannot start with a number.',
      });
    }

    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (specialCharsRegex.test(categoryName)) {
      return res.status(400).json({
        error: 'Category name cannot contain special characters.',
      });
    }

    if (categoryName.charAt(0) !== categoryName.charAt(0).toUpperCase()) {
      return res.status(400).json({
        error: 'First letter of the category must be uppercase.',
      });
    }

    const existingCategory = await categoryCollection.findOne({ categoryName });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists.' });
    }

    const newCategory = new categoryCollection({ categoryName, categoryOffer });
    await newCategory.save();

    res.json({ success: 'Category added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


//postEdit

exports.postEditCategory = async (req, res) => {
  try {
    const categoryId = req.params.id; // existing category
    console.log("categoryId:", categoryId);

    const category = await categoryCollection.findById(categoryId);
    console.log("Found the category:", category);

    if (!category) {
      console.log('category Not Found');
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryName = req.body.categoryName;
    const categoryOffer = req.body.categoryOffer;
    console.log('New category:', categoryName);

    if (!categoryName || categoryName.trim() === "") {
      return res.status(400).json({ error: 'Category name is required.' });
    }

     // Validate category name (existing validation code)

     if (categoryOffer < 0 || categoryOffer > 100 || isNaN(categoryOffer)) {
      return res.status(400).json({ error: 'Category offer must be a percentage between 0 and 100.' });
    }

    if (/^\d/.test(categoryName)) {
      return res.status(400).json({
        error: 'Category name cannot start with a number.',
      });
    }

    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;

    if (specialCharsRegex.test(categoryName)) {
      return res.status(400).json({
        error: 'Category name cannot contain special characters.',
      });
    }

    if (categoryName.charAt(0) !== categoryName.charAt(0).toUpperCase()) {
      return res.status(200).json({
        error: 'First letter of the category must be uppercase.',
      });
    }

    const existsCategory = await categoryCollection.findOne({
      categoryName: categoryName,
      _id: { $ne: category._id },
    });

    if (existsCategory) {
      return res.status(400).json({ error: 'Category Already Exists' });
    }

    category.categoryName = categoryName; // Update the properties
    category.categoryOffer = categoryOffer;
    console.log(category.categoryName);

    const updatedCategory = await category.save(); // Save the updated category

    // await Product.updateMany({ category: category._id }, { offerDiscountPercentage: categoryOffer });

    const productsToUpdate = await Product.find({ selectCategory: categoryName });

    // Update offerDiscountPercentage of each product
    await Promise.all(productsToUpdate.map(async (product) => {
      product.offerDiscountPercentage = categoryOffer;
      await product.save();
    }));

    console.log("Update", updatedCategory);

    res.status(200).json({ success: 'Category updated successfully' });

  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.Unlistcategory=async(req,res)=>{
    
  try{
      
      const Id=req.params.id;
      
      const categ=await categoryCollection.findById(Id);

      if(! categ){
          return res.status(404).send("oops user not found")
      }
      categ.isBlocked=! categ.isBlocked;

      const updatedCategory=await categ.save();
      console.log('updated category is :',updatedCategory)

      res.redirect('/category');

  }catch(error){
      console.log("oop error occurs",error);
      res.status(500).send('Internal Server Error')
  }
}

// exports.postEditCategory=async(req,res)=>{

//   try{
//     const categoryId=req.params.id;//existing category
//     console.log("categoryId:",categoryId)
//     // console.log('req.body:',req.body);

//     const category=await categoryCollection.findById(categoryId);
//     console.log("Found the category:",category);

//     if(!category){
//       console.log('category Not Found');
//       return res.status(404).send('Category not found');
//     }
//     const categoryName=req.body.categoryName;
//     console.log('New category:',categoryName);

//     if (!categoryName || categoryName.trim() === "") {
//       return res.render("editCategory", { message: "Category name is required." });
//     }

//     if (/^\d/.test(categoryName)) {
//       return res.render("editCategory", {
//         message: "Category name cannot start with a number.",
//       });
//     }

//     const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
  
//       if (specialCharsRegex.test(categoryName)) {
//         return res.render("editCategory", {
//           message: "Category name cannot contain special characters.",
//         });
//       }
//     if (categoryName.charAt(0) !== categoryName.charAt(0).toUpperCase()) {
//         return res.render("editCategory", {
//           message: "First letter of the category must be uppercase.",
//         });
//     }
//     const existsCategory = await categoryCollection.findOne({
//       categoryName: categoryName,
//       _id: { $ne: category._id }, 
//     });

//     if (existsCategory) {
//       return res.render("editCategory", { message: "Category Already Exists" });
//     }
    
//     category.categoryName = categoryName;// Update the properties
//     console.log(category.categoryName )

//     const updatedCategory = await category.save();// Save the updated category

//     console.log("Update", updatedCategory);
    
  
//     res.redirect("/Category");
    
//   }catch (error) {
//     console.error("Error updating category:", error);
//     res.status(500).send("Internal Server Error");
//   }
// }


//postdelete

exports.deleteCategory=async(req,res)=>{
  const categoryId=req.params.categoryId;
  try{
      const result=await categoryCollection.findByIdAndDelete(categoryId);
      console.log('deleted',result);
      if(!result){
          return res.status(404).send('Category not found')
      }
      res.redirect("/category");
  }catch(error){
      console.log('Error deleting category:',error);
      res.status(500).send("internal server error")
  }
}