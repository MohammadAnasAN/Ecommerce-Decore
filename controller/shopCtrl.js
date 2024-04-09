const express=require('express');
const router=express();
const Wishlist=require('../model/wishlistMdl')

const productData=require('../model/addProductMdl')
const categoryCollection=require('../model/categoryMdl')
const Order=require('../model/orderMdl')





// exports.getHome=async(req,res)=>{
   
//         const products= await productData.find({isVisible:true});
        
//         res.render('home',{products})
//     } 


    exports.getHome = async (req, res) => {
        try {

            const userId = req.session.user;
            console.log('userId',userId);
            // Fetch all products with isVisible set to true
            const products = await productData.find({ isVisible: true }).populate('category');
    
            // Fetch all categories with isBlocked set to false
            const categories = await categoryCollection.find({ isBlocked: false });
    
            // Filter products based on category name and isBlocked
            const filteredProducts = products.filter(product => {
                const matchingCategory = categories.find(category => category.categoryName === product.selectCategory);
                return matchingCategory;
            });
            const wishlist = await Wishlist.findOne({ user: userId }, { 'items.product': 1 }).exec();
            let productIds;
        
            if (wishlist) {
                productIds = wishlist.items.map(item => item.product);
                console.log('Product IDs in the wishlist:', productIds);
            } else {
                console.log('Wishlist not found for the user.');
            }
        
            // Continue with other operations outside the then block
            res.render('home', { products: filteredProducts, productIds: productIds || [] });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    };

    exports.orderDetails=async(req,res)=>{
       try {
        // Fetch the last order made by the user
        const order = await Order.findOne({ user: req.session.user }).sort({ createdAt: -1 }).populate('items.product').populate('shippingAddress');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.render('orderDetails', { order });
    } catch (error) {
        console.error('Error in fetching order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
    }

    exports.getLand = async (req, res) => {
        try {

            const userId = req.session.user;
            console.log('userId',userId);
            // Fetch all products with isVisible set to true
            const products = await productData.find({ isVisible: true }).populate('category');
    
            // Fetch all categories with isBlocked set to false
            const categories = await categoryCollection.find({ isBlocked: false });
    
            // Filter products based on category name and isBlocked
            const filteredProducts = products.filter(product => {
                const matchingCategory = categories.find(category => category.categoryName === product.selectCategory);
                return matchingCategory;
            });
            const wishlist = await Wishlist.findOne({ user: userId }, { 'items.product': 1 }).exec();
            let productIds;
        
            if (wishlist) {
                productIds = wishlist.items.map(item => item.product);
                console.log('Product IDs in the wishlist:', productIds);
            } else {
                console.log('Wishlist not found for the user.');
            }
        
            // Continue with other operations outside the then block
            res.render('landingpage', { products: filteredProducts, productIds: productIds || [] });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    };



//categoryhome
exports.getHomeProduct=async(req,res)=>{

   

    try {

        const currentPage = parseInt(req.query.page) || 1;
        const productsPerPage = 8;
        // Fetch all products with isVisible set to true
        const products = await productData.find({$and:[{isVisible:true},{selectCategory:'HOUSE'}]}).populate('category');

        // Fetch all categories with isBlocked set to false
        const categories = await categoryCollection.find({ isBlocked: false });

        // Filter products based on category name and isBlocked
        const filteredProducts = products.filter(product => {
            const matchingCategory = categories.find(category => category.categoryName === product.selectCategory);
            return matchingCategory;
        });

         // Calculate the total number of products and pages
         const allProductsCount = filteredProducts.length;
         const totalPages = Math.ceil(allProductsCount / productsPerPage);
     
         // Fetch the products for the current page
         const skip = (currentPage - 1) * productsPerPage;
         const productsToRender = filteredProducts.slice(skip, skip + productsPerPage);

        res.render('homeproduct',  { products: productsToRender, currentPage, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
}
}
//categoryOffice



exports.getOffice = async (req, res) => {
    try {
        const currentPage = parseInt(req.query.page) || 1;
        const productsPerPage = 8;
    
        // Fetch all categories with isBlocked set to false
        const categories = await categoryCollection.find({ isBlocked: false });
    
        // Fetch all products with isVisible set to true and selectCategory set to 'OFFICE', populating the 'category' field
        const products = await productData.find({ $and: [{ isVisible: true }, { selectCategory: 'OFFICE' }] }).populate('category');
    
        // Filter products based on category name and isBlocked
        const filteredProducts = products.filter(product => {
          const matchingCategory = categories.find(category => category.categoryName === product.selectCategory);
          return matchingCategory;
        });
    
        // Calculate the total number of products and pages
        const allProductsCount = filteredProducts.length;
        const totalPages = Math.ceil(allProductsCount / productsPerPage);
    
        // Fetch the products for the current page
        const skip = (currentPage - 1) * productsPerPage;
        const productsToRender = filteredProducts.slice(skip, skip + productsPerPage);
    
        
        res.render('office', { products: productsToRender, currentPage, totalPages });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
};



// exports.getOffice=async(req,res)=>{

//     const products=await productData.find({$and:[{isVisible:true},{selectCategory:'OFFICE'}]});
//     res.render('office',{products})
// }


//display

exports.display = async (req, res) => {
    try {
        const id = req.params.id;
        const products = await productData.findOne({_id: id}).populate('reviews.user');
        const userData = req.session.user; // Get user data from session
        res.render('display', { products, userData });
    } catch (error) {
        console.error('Error displaying product:', error);
        res.status(500).send('Internal Server Error');
    }
};



exports.putEditReview=async(req,res)=>{
    const { reviewId, newReviewText } = req.body;
    const userId = req.session.user; // Assuming user ID is stored in session

    try {
        // Find the product containing the review
        const product = await productData.findOne({ 'reviews._id': reviewId });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Review or product not found' });
        }

        // Find the index of the review in the product's reviews array
        const reviewIndex = product.reviews.findIndex(review => review._id.equals(reviewId));

        if (reviewIndex === -1) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Check if the user is the author of the review
        if (!product.reviews[reviewIndex].user.equals(userId)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to edit this review' });
        }

        // Update the review text
        product.reviews[reviewIndex].reviewText = newReviewText;
        
        // Save the updated product with the edited review
        await product.save();

        res.json({ success: true, message: 'Review updated successfully' });
    } catch (error) {
        console.error('Error editing review:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.deleteReview=async (req,res)=>{
    const { reviewId } = req.params;
    const userId = req.session.user; // Assuming user ID is stored in session

    try {
        // Find the product containing the review
        const product = await productData.findOne({ 'reviews._id': reviewId });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Find the review by its ID
        const review = product.reviews.find(review => review._id.equals(reviewId));

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Check if the user is the author of the review
        if (!review.user.equals(userId)) {
            return res.status(403).json({ success: false, message: 'You are not authorized to delete this review' });
        }

        // Remove the review from the array
        product.reviews.pull({ _id: reviewId });
        await product.save();

        res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


//sortProduct

exports.sortProducts = async (req, res) => {
    try {
        console.log("hjbdjhbd")
        const searchQuery = req.query.q
        console.log('ddddddquery', searchQuery )
        const sortBy = req.params.criteria || 'default'; // Use params instead of query for sorting criteria
        let baseQuery = { isVisible: true };
        

        // Apply search criteria
        if (searchQuery) {
            baseQuery.productName = { $regex: searchQuery, $options: 'i' };
        }

        // Apply sorting criteria
        let products;

        switch (sortBy) {
            case 'popularity':
                products = await productData.find(baseQuery).sort({ sales: -1 });
                break;
            case 'priceLowToHigh':
                products = await productData.find(baseQuery).sort({ price: 1 });
                break;
            case 'priceHighToLow':
                products = await productData.find(baseQuery).sort({ price: -1 });
                break;
            case 'averageRatings':
                products = await productData.find(baseQuery).sort({ rating: -1 });
                break;
            case 'newArrivals':
                products = await productData.find(baseQuery).sort({ createdAt: -1 });
                break;
            case 'featured':
                products = await productData.find({ ...baseQuery, isFeatured: true });
                break;
            case 'aToZ':
                products = await productData.find(baseQuery).sort({ productName: 1 });
                break;
            case 'zToA':
                products = await productData.find(baseQuery).sort({ productName: -1 });
                break;
            default:
                products = await productData.find(baseQuery);
                break;
        }

        const userId = req.session.user
        console.log('user',userId);
        const wishlist = await Wishlist.findOne({ user: userId }, { 'items.product': 1 }).exec();
        let productIds;
    
        if (wishlist) {
            productIds = wishlist.items.map(item => item.product);
            console.log('Product IDs in the wishlist:', productIds);
        } else {
            console.log('Wishlist not found for the user.');
        }

        res.render('Home', { products ,productIds});
    } catch (error) {
        console.error('Error fetching and sorting products:', error);
        res.status(500).send('Internal Server Error');
    }
};


exports.getLandingpage = async (req, res) => {
    try {

        const userId = req.session.user;
        console.log('userId',userId);
        // Fetch all products with isVisible set to true
        const products = await productData.find({ isVisible: true }).populate('category');

        // Fetch all categories with isBlocked set to false
        const categories = await categoryCollection.find({ isBlocked: false });

        // Filter products based on category name and isBlocked
        const filteredProducts = products.filter(product => {
            const matchingCategory = categories.find(category => category.categoryName === product.selectCategory);
            return matchingCategory;
        });
        const wishlist = await Wishlist.findOne({ user: userId }, { 'items.product': 1 }).exec();
        let productIds;
    
        if (wishlist) {
            productIds = wishlist.items.map(item => item.product);
            console.log('Product IDs in the wishlist:', productIds);
        } else {
            console.log('Wishlist not found for the user.');
        }
    
        // Continue with other operations outside the then block
        res.render('home', { products: filteredProducts, productIds: productIds || [] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



//review

exports.writeReview=async(req,res)=>{
    const { productId, review } = req.body;
    const userId = req.session.user; // Assuming user ID is stored in session

    try {
        const product = await productData.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if the review text is not just whitespace
        if (!review.trim()) {
            return res.status(400).json({ success: false, message: 'Review text cannot be empty or whitespace' });
        }

        // Check if the user has already reviewed the product
        const existingReviewIndex = product.reviews.findIndex(review => review.user.equals(userId));

        if (existingReviewIndex !== -1) {
            // Update existing review if found
            product.reviews[existingReviewIndex].reviewText = review;
        } else {
            // Add new review if not found
            product.reviews.push({ user: userId, reviewText: review });
        }

        await product.save();
        res.json({ success: true, message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Error writing review:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}





//rating

exports.productRating=async(req,res)=>{
    
    const productId = req.body.productId;
    const userId = req.session.user; // Assuming user is authenticated and user ID is stored in session

    try {
        const product = await productData.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        const ratingValue = parseInt(req.body.rating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            return res.status(400).send('Invalid rating value');
        }

        // Ensure that ratings array is initialized
        product.ratings = product.ratings || [];

        // Check if the user has already rated the product
        const existingRatingIndex = product.ratings.findIndex(rating => rating.userId && rating.userId.equals(userId));
        if (existingRatingIndex !== -1) {
            // Update existing rating
            product.ratings[existingRatingIndex].rating = ratingValue;
        } else {
            // Add new rating
            product.ratings.push({ userId: userId, rating: ratingValue });
        }

         product.averageRating = product.calculateAverageRating();

        await product.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error rating product:', error);
        res.status(500).send('Internal Server Error');
    }
}




//search

// exports.search=async (req, res) => {
//     try {
//         const query = req.query.query.toLowerCase();

//         // Use Mongoose find to search for products based on the query
//         const matchingProducts = await productData.find({
//             $or: [
//                 { productName: { $regex: query, $options: 'i' } }, // Case-insensitive search
//                 // { description: { $regex: query, $options: 'i' } },
               
//             ],
//         });

//         res.json(matchingProducts);
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

//pagination

// exports.pagination=async (req, res) => {
//     try {
//       // Assuming you have a list of all products in your database
//       const allProductsCount = await productData.countDocuments();
    
//       // Set the number of products to display per page
//       const productsPerPage = 8;
  
//       // Calculate the total number of pages
//       const totalPages = Math.ceil(allProductsCount / productsPerPage);
  
//       // Send the total number of pages as JSON
//       res.json({ totalPages });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };


// Update the getHome route to handle search queries
// exports.searchProducts = async (req, res) => {
//     const searchQuery = req.body.searchQuery;
//      console.log('hits on search')
//     try {
//         const products = await productData.find({
//             isVisible: true,
//             productName: { $regex: new RegExp(searchQuery, 'i') },
//         });

//         if (products.length === 0) {
//             res.json({ message: 'No product found' });
//         } else {
//             res.render('searchResults', { products, searchQuery });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };
