const express=require('express');
const app=express();
const userCollection = require('../model/userSchema');
const bcryptjs = require('bcryptjs');
const categoryCollection = require('../model/categoryMdl');
const nodemailer = require('nodemailer')
const otp = require('../model/otp')


 
//get

exports.getLogin = (req,res) =>{
    res.render('login');

}
exports.getSignup=(req,res)=>{
    res.render('signup')
}

exports. verifyemail= async (req,res)=>{
    res.render('verifyemail')
}

exports.Getlogout=(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.error("error destrying the session",err)
            res.status(500).json({error:'internal server error occcurs'})
        }else{
            res.redirect('/login')
        }
    })
}


//post


exports.postSignup = async (req, res) => {
    console.log('Inside postSignup route');
    
    const { name, email, password, confirmPassword } = req.body;
    
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return res.render('signup', { errorMessage: "Please enter a valid email address." });
    }

    // Check if email contains whitespace
    if (/\s/.test(email)) {
        return res.render('signup', { errorMessage: "Email address cannot contain white spaces." });
    }

    const nameRegex = /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/


if (!nameRegex.test(name)) {
    return res.render('signup', { errorMessage: "Please enter a valid name." });
}

    
    function validatePassword(password) {
        if (password.length < 6 || password.length > 20) {
            return false;
        }

        let hasDigit = false;
        let hasLowercase = false;
        let hasUppercase = false;
        let hasSpecialChar = false;
        const specialChars = "!@#$%^&*()-+.";

        for (let i = 0; i < password.length; i++) {
            const char = password[i];

            if (/[0-9]/.test(char)) {
                hasDigit = true;
            } else if (/[a-z]/.test(char)) {
                hasLowercase = true;
            } else if (/[A-Z]/.test(char)) {
                hasUppercase = true;
            } else if (specialChars.includes(char)) {
                hasSpecialChar = true;
            }

            if (hasDigit && hasLowercase && hasUppercase && hasSpecialChar) {
                return true;
            }
        }
        return false;
    }

    // Check if the password meets the strength criteria
    if (!validatePassword(password)) {
        return res.render('signup', {
            errorMessage: "Password must be 6-20 characters long and include at least one digit, one lowercase letter, one uppercase letter, and one special character."
        });
    }

    try {
        const existingUser = await userCollection.findOne({ email })
        if (existingUser) {
            return res.render('signup', { errorMessage: "User already exists. Please choose a different email." });
        }

        if (password !== confirmPassword) {
            return res.render('signup', { errorMessage: "Password and Confirm Password do not match." });
        }

        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        req.session.signupData = {
            name,
            email,
            password,
            confirmPassword,
            referredCode: req.body.referralCode,

        };

        const newOTP = new otp({
            email,
            otp: generatedOTP,
        });
        await newOTP.save();

        const mailBody = `Your OTP for registration is ${generatedOTP}`;
        await mailSender(email, 'Registration OTP', mailBody);
        return res.redirect("/verifyemail");

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const mailSender = async (email, title, body)=>{
    try {
        let transporter = nodemailer.createTransport({
            service:'gmail', 
                auth:{
                    user: 'dcore262@gmail.com', 
                    pass: 'whiv kdbr fpvd nrih',  
                }
        }) 

        let info = await transporter.sendMail({
            from: 'www.decore-company.com',
            to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
        })

        console.log("Info is here: ",info)
        return info

    } catch (error) {
        console.log(error.message);
    }
}



exports.verifypost = async (req,res)=>{
    
    try {
        const enteredOTP = req.body.otp;
        const signupData = req.session.signupData;
        console.log('otp',enteredOTP)
        console.log('sign',signupData)
        if (!signupData) {
            return res.json({ error: 'User data not found. Please sign up again.' });
        }

        const otpRecord = await otp.findOne({ email: signupData.email  });

        if (!otpRecord) {
            return res.json({ error: 'OTP not found. Please request a new one.' });
        }

        console.log('reffered',signupData.referredCode)

        if (enteredOTP === otpRecord.otp) {
            const newUser = new userCollection({
                name: signupData.name,
                email: signupData.email,
                password: signupData.password,
                confirmPassword: signupData.confirmPassword,
                isblocked: false,
                referredCode: signupData.referredCode

            });

            newUser.wallet.balance += 50;

       
            const savedUser = await newUser.save();

            
            delete req.session.signupData;

            const { email, otp } = otpRecord;

            res.json({
                success: 'User registered successfully',
                user: savedUser,
                email,
                otp,
            });
            // res.redirect('/login')
        } else {
           return res.render('veryfyemail',{ errorMessage: 'Incorrect OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Error:', error);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.resendotp = async (req,res)=>{
    
    try {
        const userEmail = req.session.signupData.email; 
            
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
        const newOTP = new otp({
            email: userEmail,
            otp: generatedOTP,
        });
        await newOTP.save();
    
        const mailBody = `Your OTP for registration is ${generatedOTP}`;
        await mailSender(userEmail, 'Registration OTP', mailBody);
        // res.redirect('/resendotp')
    
        res.json({ success: 'OTP Resent successfully' });
    } catch (error) {
        console.error('Error:', error);
        // res.status(500).json({ error: 'Internal Server Error' });
    }
}
//login user

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userCollection.findOne({ email });
        console.log('user:', user);

        if (!user) {
            res.render('login', { errorMessage: 'Email not found' });
        } else {
            // Check if the user is blocked
            if (user.isBlocked) {
                res.render('login', { errorMessage: 'Your account is blocked.' });
                return;
            }

            // Compare plain text password with stored password hash
            if (password === user.password) {
                req.session.user = user._id;
                console.log('user', req.session.user)
                res.redirect('/home');
            } else {
                res.render('login', { errorMessage: 'Wrong password' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



//usermangement handiling

exports.userManagement=async(req,res)=>{
    try{
        const userfind=await userCollection.find();
        console.log(userfind);
        res.render('userAdmin',{userfind})
    }catch(error){
        console.log('Error occurs when try to get the controlside ',error);
    }
};

//block the user
exports.blockUser=async(req,res)=>{
    try{
        const userId=req.params.id;

        const user=await userCollection.findById(userId);

        if(!user){
            return res.status(404).send("oops user not found")
        }
        user.isBlocked=!user.isBlocked;

        const updatedUser=await user.save();

        res.redirect('/userAdmin');

    }catch(error){
        console.log("oop error occurs",error);
        res.status(500).send('Internal Server Error')
    }
}


//logout

exports.postLogout=(req,res)=>{
    req.session.user=null;
    req.session.destroy((error)=>{
        if(err){
            console.error('error occurs:',err);
            res.status(500).json({error:"Internal Server Error"})
        }else{
            res.redirect('/login');
        }
    })
}



