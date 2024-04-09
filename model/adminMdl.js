const mongoose=require('mongoose')

const adminschema=new mongoose.Schema({
    name:{
        type:String
    },
    password:{
        type:String
    }
});
// const Admin= mongoose.model('adminLogin',adminschema);
// module.exports=Admin;
 const Admin = mongoose.model("adminLogin",adminschema);
 module.exports = Admin;
