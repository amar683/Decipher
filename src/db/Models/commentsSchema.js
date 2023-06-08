const mongoose = require("mongoose");

const comment = mongoose.Schema({
    articleId:{
        type:String,
        require:true,
    },
    comments:[{
        userId: String,
        userName: String,
        image:{
            contentType:String,
            path:String,
            img:Buffer
        },
        comment: String,
        likes: Number
    }]
});


const Comment = new mongoose.model("Comment",comment);

module.exports = Comment; 