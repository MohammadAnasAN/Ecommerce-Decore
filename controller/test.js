exports.getEnergy = async (req, res) => {
    try {
      
        isVisibleCategory = await Category.find();
        
        const offerPrice = await offer.find({isActive:true});

        const offerProduct  = offerPrice.map((item) => item.product);

        const categoryOffer = offerPrice.map((item) => item.category);

         

        const discountMap = {};
        offerPrice.forEach((item) => {
            discountMap[item.product] = item.discount;
        });
       
        const categoryDiscountMap = {};
        offerPrice.forEach((item) => {
            categoryDiscountMap[item.category] = item.discount;
        })

       
       
        
        let showProducts;
        const sortBy = req.params.sortBy; 
        const searchQuery = req.query.q; 
       
        let baseQuery = { isVisible: true, selectCategory: "Sport" };
       
        if (searchQuery) {
            baseQuery.productName = { $regex: searchQuery, $options: 'i' }; 
        }

        switch (sortBy) {
            case 'popularity':
                showProducts = await PRODUCTDATA.find(baseQuery).sort(/* Add popularity sorting criteria soon */);
                break;
            case 'classic':
                showProducts = await PRODUCTDATA.find({ ...baseQuery, selectCategory: "Classic" });
                break;    
            case 'priceLowToHigh':
                showProducts = await PRODUCTDATA.find(baseQuery).sort({ price: 1 });
                break;
            case 'priceHighToLow':
                showProducts = await PRODUCTDATA.find(baseQuery).sort({ price: -1 });
                break;
            case 'a-z':
                showProducts = await PRODUCTDATA.find(baseQuery).sort({ productName: 1 });
                break;
            case 'z-a':
                showProducts = await PRODUCTDATA.find(baseQuery).sort({ productName: -1 });
                break;
            case 'newArrivals':
                showProducts = await PRODUCTDATA.find(baseQuery).sort({ creationDate: -1 });
                break; 
            case 'featured':
                showProducts = await PRODUCTDATA.find({ ...baseQuery, isFeatured: true });
                break;   
            default:
                showProducts = await PRODUCTDATA.find(baseQuery);
                break;
        }

        res.render("Energy", { showProducts, isVisibleCategory, offerProduct, discountMap ,categoryDiscountMap , categoryOffer});
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};