const Connection = require("../db/Models/connectionsSchema");
const User = require("../db/Models/userSchema");
const Chat = require("../db/Models/chatSchema");

const displayChats = async (req,res)=>{

    try {
        const user = await Connection.findOne({userId:req.user._id});
        const connection = await user.connection.filter((element)=>{
            if(element.userId == req.params.userIdtoChat)
                return element;

        });
        console.log(connection); 

        const chat = await Chat.findById({_id:connection[0].chatRoomId});

        console.log("in displaycaht");
        console.log(chat);

        const chatUser = await User.findById({_id:connection[0].userId});

        return {chats:chat.chats,chatUser:chatUser,chatRoomId:connection[0].chatRoomId};

    } catch (error) {
        console.log("error in displayChat function");
    }
    
}

const sendMessage = async (req,res)=>{
    try {

        if(req.body.chat_message.trim() == "")
            return;
            
        await Chat.findByIdAndUpdate({
            _id:req.params.chatRoomId
        },{
            $push:{
                chats:{
                    userId:req.user._id,
                    userName:req.user.name,
                    message:req.body.chat_message.trim()
                }
            }
        });
    } catch (error) {
        console.log("error in sendMesssage function",error);
    }   
}

module.exports = {displayChats,sendMessage}