require('dotenv').config();
const mongoose = require("mongoose");
require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const user = mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true
    },
    image:{
        contentType:String,
        path:String,
        img:Buffer
    },
    tokens:[{
        token:{
            type:String,
            require:true
        }
    }]
});


user.methods.generateWebToken = async function(){
    try {
        const token = jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        console.log("pased generate token");
        return token;
    } 
    catch (error) {
        return error;
    }
}

user.pre("save",async function(next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,5);
    }
    next();
});

const User = new mongoose.model("User",user);

module.exports = User; 