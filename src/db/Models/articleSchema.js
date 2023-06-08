const mongoose = require("mongoose");

const article = mongoose.Schema({
    userId:{
        type:String,
        require:true,
    },
    title:{
        type:String,
        require:true,
    },
    author:{
        type:String,
        require:true,
    },
    category:{
        type:String,
        require:true
    },
    content:{
        type:String,
        require:true
    },
    image:{
        contentType:String,
        path:String,
        img:Buffer
    },
    time : { 
        type : Date, 
        default: Date.now 
    }
});


const Article = new mongoose.model("Article",article);

module.exports = Article; 