const adminSdata=require('../model/adminMdl')

async function adminSession(req,res,next){
    const admin=await adminSdata.find({_id:req.session.admin})
    console.log(admin)
    if(req.session.admin){
        next()

    }else{
      res.redirect('/adminLogin');
    }
}
module.exports=adminSession;