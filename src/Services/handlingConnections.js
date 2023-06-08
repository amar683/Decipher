const Chat = require("../db/Models/chatSchema");
const Connection = require("../db/Models/connectionsSchema");
const User = require("../db/Models/userSchema");

const displayConnections = async (userId)=>{
    try {
        const user_connection = await Connection.findOne({userId:userId});
        return user_connection;
    } catch (error) {
        console.log("Error in sendConnection Req function");
    }
} 

const sendConnectionReq = async (req,res)=>{
    try {
        const sendFromUser = await User.findById({_id:req.user._id});
        const sendToUser = await User.findById({_id:req.params.toUserId});

        const userConnections = await Connection.findOne({userId:sendFromUser._id});
        const filterAlreadySent = userConnections.sentReq.filter((user)=>{
            if(user.userId == sendToUser._id)
            return user;
        });
        const filterAlreadyConnection = userConnections.connection.filter((user)=>{
            if(user.userId == sendToUser._id)
            return user;
        });

        if(filterAlreadySent.length > 0 || filterAlreadyConnection.length > 0)
            return;
 
        await Connection.findOneAndUpdate({
            userId: sendToUser._id
        },{
            $push:{
                recievedReq: {
                    userId: sendFromUser._id,
                    userName : sendFromUser.name,
                    image: sendFromUser.image
                }
            }
        });
        await Connection.findOneAndUpdate({
            userId: sendFromUser._id
        },{
            $push:{
                sentReq: {
                    userId: sendToUser._id,
                    userName : sendToUser.name,
                    image: sendToUser.image
                }
            }
        });

    } catch (error) {
        console.log("Error in sendConnection Req function",error);
    }
}

const acceptConnectionReq = async (req,res)=>{
    try {
        const recievedUser = await User.findById({_id:req.user._id});
        const reqFromUser = await User.findById({_id:req.params.reqFromUserId});

        const newChat = new Chat({
            // userOne: recievedUser._id,
            // userTwo: reqFromUser._id
        });

        await newChat.save();

        await Connection.findOneAndUpdate({
            userId: reqFromUser._id
        },{
            $push:{
                connection: {
                    userId: recievedUser._id,
                    userName : recievedUser.name,
                    image: recievedUser.image,
                    chatRoomId:newChat._id
                }
            },
            $pull:{
                sentReq:{
                    userId: recievedUser._id,
                    userName : recievedUser.name,
                    image: recievedUser.image
                }
            }
        });


        await Connection.findOneAndUpdate({
            userId: recievedUser._id
        },{
            $push:{
                connection: {
                    userId: reqFromUser._id,
                    userName : reqFromUser.name,
                    image: reqFromUser.image,
                    chatRoomId: newChat._id
                }
            },
            $pull:{
                recievedReq:{
                    userId: reqFromUser._id,
                    userName : reqFromUser.name,
                    image: reqFromUser.image
                }
            }
        });



    } catch (error) {
        console.log("Error in acceptConnectionReq Req function");
    }
}

const rejectConnectionReq = async (req,res)=>{
    try {
        const recievedUser = await User.findById({_id:req.user._id});
        const reqFromUser = await User.findById({_id:req.params.reqFromUserId});


        await Connection.findOneAndUpdate({
            userId: reqFromUser._id
        },{
            $pull:{
                sentReq:{
                    userId: recievedUser._id,
                    userName : recievedUser.name,
                    image: recievedUser.image
                }
            }
        });


        await Connection.findOneAndUpdate({
            userId: recievedUser._id
        },{
            $pull:{
                recievedReq:{
                    userId: reqFromUser._id,
                    userName : reqFromUser.name,
                    image: reqFromUser.image
                }
            }
        });
    } catch (error) {
        console.log("Error in rejectConnectionReq Req function");
    }
}

const removeConnection= async (req,res)=>{
    try {
        const recievedUser = await User.findById({_id:req.user._id});
        const removeUserId = await User.findById({_id:req.params.removeUserId});

        await Connection.findOneAndUpdate({
            userId: removeUserId._id
        },{
            $pull:{
                connection:{
                    userId: recievedUser._id,
                    userName : recievedUser.name,
                    image: recievedUser.image
                    
                }
            }
        });

        await Connection.findOneAndUpdate({
            userId: recievedUser._id
        },{
            $pull:{
                connection:{
                    userId: removeUserId._id,
                    userName : removeUserId.name,
                    image: removeUserId.image
                }
            }
        });

    } catch (error) {
        console.log("Error in removeConnection Req function");
    }
}

const addingConnection = async (userId)=>{
    try{
        const connection = new Connection({
            userId:userId
        });
        
        await connection.save();
        console.log("passed connection save");
    }catch(error){
        console.log(error,"error in addingArticleIdtoComments");
    }

}
module.exports = {addingConnection,displayConnections,sendConnectionReq,acceptConnectionReq,rejectConnectionReq,removeConnection};