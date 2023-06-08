const mongoose = require("mongoose");

const like = mongoose.Schema({
    commentId: String,
    likes:[{
        userId: String,
        userName: String,
        image:{
            contentType:String,
            path:String,
            img:Buffer
        }
    }]
}); 


const Like = new mongoose.model("Like",like);

module.exports = Like; 