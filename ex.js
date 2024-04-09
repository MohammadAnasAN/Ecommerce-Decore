// app.get('/',(req,res)=>{
//     res.render('user/login')
// })

// app.get('/signup',(req,res)=>{
//     res.render('user/signup')
// })

// //Register user
// app.post('/signup',async(req,res)=>{
//     const data={
//         name:req.body.username,
//         password:req.body.password

//     }
//     const existingUser=await collection.findOne({name:data.name})
//     if(existingUser){
//         res.render('user/signup',{errorMessage:"User already exists,Please choose a different username."})
//     }else{
//         //hash the password (avoid hacks)
//         const saltRounds=10;//number of the salt round for bcryptjs
//         const hashedPassword=await bcryptjs.hash(data.password,saltRounds)

//         data.password= hashedPassword;//replace hashed password with orginal password

//         const userdata=await collection.insertMany(data);
//         console.log(userdata);
//         res.render('user/login')
            
//     }

//     // const userdata=await collection.insertMany(data);if elsen veliyil ittal cheyumbol exist aaya username databsel add aavunund
//     // console.log(userdata);
// })

// //login user

// app.post('/login',async(req,res)=>{
//       try{
//           const check=await collection.findOne({name:req.body.username})
//           if(!check){
//                res.send('user name cannot found')
//           }
//           //comparer the hash password from the database with the plain text
//           const isPasswordMatch=await bcryptjs.compare(req.body.password,check.password);
//           if(isPasswordMatch){
//             res.render('user/home')
//           }else{
//             req.send('wrong password');
//           }
//       }catch{
//           res.send('Wrong Details')
//       }
// })
const editproduct = async (req,res)=>{
    const id = req.params.id
    const categories = await category.distinct('name'); 
    const prod = await product.findOne({_id:id})
    res.render('admin/editproduct',{prod,categories})
}

exports.editProduct= async (req,res)=>{
    try {
        const {productId} = req.params;

        const {
           productName,
           description,
           selectCategory,
           price,
           rating,
           stockCount,
           
        } = req.body;

        let productImages = [];

        if (req.files && req.files.length > 0) {
            const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
            productImages = fileUrls;
        }

        const existingProduct = await AddProduct.findById(productId);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        existingProduct. productName =  productName;
        existingProduct.description = description;
        existingProduct.selectCategory = selectCategory;
        existingProduct.price = price;
        existingProduct.rating = rating;
        existingProduct. stockCount = stockCount;
        existingProduct.productImages = productImages;

        const updatedProduct = await existingProduct.save();

        res.json({
            message: 'Product updated successfully',
            product: updatedProduct,
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}