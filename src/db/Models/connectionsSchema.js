const mongoose = require("mongoose");

const connection = mongoose.Schema({
    userId:{
        type:String,
        require:true,
    },
    connection:[{
        userId: String,
        userName: String,
        image:{
            contentType:String,
            path:String,
            img:Buffer
        },
        chatRoomId: String
    }],
    recievedReq : [{
        userId: String,
        userName: String,
        image:{
            contentType:String,
            path:String,
            img:Buffer
        }
    }],
    sentReq : [{
        userId: String,
        userName: String,
        image:{
            contentType:String,
            path:String,
            img:Buffer
        }
    }]
});


const Connection = new mongoose.model("Connection",connection);

module.exports = Connection; 