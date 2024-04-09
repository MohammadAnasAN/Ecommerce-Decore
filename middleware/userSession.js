const userSdata=require('../model/userSchema')

async function userSession(req,res,next){
    const user=await userSdata.find({_id:req.session.user})
    console.log(user)
    if(req.session.user&&user[0].isBlocked==false){
        next()

    }else{
      res.redirect('/');
    }
}
module.exports=userSession;