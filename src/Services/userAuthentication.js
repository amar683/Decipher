require("../db/connection");
const User = require("../db/Models/userSchema");
const Connection = require("../db/Models/connectionsSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { response } = require("express");
const fs = require("fs");


const registerUser = async (req,res)=>{
        try {

            const password = req.body.sign_in_password;
            const confirm_password = req.body.sign_in_confirm_password;

            var profilePic = fs.readFileSync(req.file.path);
            console.log("register userfunction 0");
            var encoded_image = profilePic.toString("base64");
            console.log("inside register function");

            if(password===confirm_password){  
                const newUser = new User({
                    name:req.body.name,
                    email:req.body.sign_in_email,
                    password:password,
                    image:{
                        contentType:req.body.mimetype,
                        path:req.body.path,
                        img:Buffer.from(encoded_image,"base64")
                    }
                });
                console.log("inside register function 2");


                //token
                const token = await newUser.generateWebToken();
                res.cookie("jwt",token,{
                    expires: new Date(Date.now + 60000),
                    httpOnly: true,
                    // secure:true          //will use this in production build
                });


                const save_user = await newUser.save();
                // console.log("pass saving");
                return save_user;
            }
        
        }catch (error) {
            console.log(error);
            return;
        }
}



const signInUser = async (req,res)=>{
    try {
        const password = req.body.sign_in_password;
        const email = req.body.sign_in_email;
        console.log(email,password);

        const fetch_user = await User.findOne({email:email});
        console.log(fetch_user);


        const isMatch = await bcrypt.compare(password,fetch_user.password);
        console.log(isMatch);

        if(isMatch){

            const token = await fetch_user.generateWebToken();
            res.cookie("jwt",token,{
                expires: new Date(Date.now + 60000),
                httpOnly: true,
                // secure:true          //will use this in production build
            });
            // console.log("this is cookie ",req.cookies.jwt);

            return true;
        }else{
            return false;
        }
    } catch (error) {
        console.log(error);
        return;
    }
}


//act as middleware
const authenticateUser = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
        console.log(verifyUser);

        const user = await User.findOne({_id:verifyUser._id});

        req.verified = true;                   //we can create a variable to pass on to the next upcomming function and access it by writing req.name_of_variable
        req.user = user;
        req.token = token;
    } catch (error) {
        console.log("User not verified");
        req.verified = false;
    }
    next();
}



module.exports = {registerUser,signInUser,authenticateUser}