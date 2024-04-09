const express=require('express');
const app=express();
const userCollection = require('../model/userSchema');
const bcryptjs = require('bcryptjs');








//usermangement handiling

exports.userManagement=async(req,res)=>{
    try{
        const userFind=await userCollection.find();
        console.log(userFind);
        res.render('userAdmin',{userFind})
    }catch(error){
        console.log('Error occurs when try to get the controlside ',error);
    }
};

//block the user post
exports.blockUser=async(req,res)=>{
    
    try{
        
        const userId=req.params.userid;
        
        const user=await userCollection.findById(userId);

        if(!user){
            return res.status(404).send("oops user not found")
        }
        user.isBlocked=!user.isBlocked;

        const updatedUser=await user.save();
        console.log('updated user is :',updatedUser)

        res.redirect('/userAdmin');

    }catch(error){
        console.log("oop error occurs",error);
        res.status(500).send('Internal Server Error')
    }
}