const mongoose = require("mongoose");

const chat = mongoose.Schema({
    // userOne: {
    //     type:String,
    //     require:true,
    // },
    // userTwo: {
    //     type:String,
    //     require:true,
    // },
    chats:[{
        userId: String, 
        userName: String,
        message: String
    }]
});


const Chat = new mongoose.model("Chat",chat);

module.exports = Chat; 