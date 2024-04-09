const mongoose=require('mongoose');
const connect=mongoose.connect(process.env.MONGODB_URI)


//check database connected or not
connect.then(()=>{
    console.log('Database connected')
})
.catch(()=>{
    console.log('database cannot be connected')
})


module.exports = connect

