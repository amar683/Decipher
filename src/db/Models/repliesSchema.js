const mongoose = require("mongoose");

const reply = mongoose.Schema({
    commentId:{
        type:String,
        require:true,
    },
    replies:[{
        userId: String,
        userName: String,
        image:{
            contentType:String,
            path:String,
            img:Buffer
        },
        reply: String,
        likes:Number
    }]
}); 


const Reply = new mongoose.model("Reply",reply);

module.exports = Reply; 