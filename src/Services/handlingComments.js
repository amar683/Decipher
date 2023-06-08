const User = require("../db/Models/userSchema");
const Article = require("../db/Models/articleSchema");
const Comment = require("../db/Models/commentsSchema");
const Reply = require("../db/Models/repliesSchema");
const Like = require("../db/Models/likesSchema");

const getCommentsForThisArticle = async (req,res)=>{
    // const title = req.params.articleTitle;
    // const author = req.params.author;
    const articleId = req.params.articleId
    try {
        const result = await Article.findById({_id:articleId}); 

        // const articleId = result._id;
        // console.log(articleId);

        const articleComment = await Comment.findOne({
            articleId:articleId
        }); 

        const allComments = articleComment;
        // console.log(allComments);
        return allComments;

    } catch (error) {
        console.log(error,"error in getCommentsForThisArticle");
    }
}



const postComment = async function (req,res){
    const articleId = req.params.articleId;
    const userId = req.params.userId;

    const fetch_user = await User.findById({_id:userId});

    const postText = req.body.comment;

   try{
         await Comment.findOneAndUpdate({
            articleId: articleId,
        },{
            $push:{
                comments: {
                    userId: userId,
                    userName: fetch_user.name,
                    image: fetch_user.image,
                    comment : postText,
                    likes: 0
                }
            }
        });

        const comment = await Comment.findOne({
            articleId: articleId,
        });
        // console.log("comment wala h ----",comment);
        const length = await comment.comments.length;
        // console.log(length);
        const commentId = await comment.comments[length-1]._id;
        // console.log("Comment id = ",commentId);


        const newReply = new Reply({
            commentId:commentId,
        });
        await newReply.save();

        const newLike = new Like({
            commentId:commentId
        });
        await newLike.save();
   }
   catch(error){
        console.log(error,"error in postComment");
   }


}


const likedComment =async (req,res)=>{
    try {
        const commentId = req.params.commentId;

        const alreadyLiked = await Like.findOne({commentId:commentId});
        const filterAlreadyLiked = alreadyLiked.likes.filter((user)=>{
            if(user.userId == req.user._id)
            return user;
        });

        if(filterAlreadyLiked.length > 0)
            return;

        await Like.findOneAndUpdate({
            commentId:commentId
        },
        {
            $push:{
                likes:{
                    userId:req.user._id,
                    userName:req.user.name,
                    image: req.user.image
                }
            }
        });
        const result = await Like.findOne({commentId:commentId});
        const totalLikes = result.likes.length;

        await Comment.findOneAndUpdate({
            'comments._id' : commentId
        },
        {
            $set:{
                'comments.$.likes':totalLikes
            }
        });

    } catch (error) {
        console.log("error in likedComment function",error);   
    }
}
const likedReply =async (req,res)=>{
    try {
        const replyId = req.params.replyId;

        const alreadyLiked = await Like.findOne({commentId:replyId});
        const filterAlreadyLiked = alreadyLiked.likes.filter((user)=>{
            if(user.userId == req.user._id)
            return user;
        });
        if(filterAlreadyLiked.length > 0)
            return;

        await Like.findOneAndUpdate({
            commentId:replyId
        },
        {
            $push:{
                likes:{
                    userId:req.user._id,
                    userName:req.user.name,
                    image: req.user.image
                }
            }
        });
        const like = await Like.findOne({commentId:replyId});
        const totalLikes = like.likes.length;
        // console.log(typeof(totalLikes));

        await Reply.findOneAndUpdate({
            'replies._id' : replyId
        },
        {
            $set:{
                'replies.$.likes':totalLikes
            }
        });
        
    } catch (error) {
        console.log("error in likedComment function",error);   
    }
}

const postReply = async (req,res)=>{
    const commentId = req.params.commentId; 
    const fromUserId = req.params.fromUserId;

    const fetch_user = await User.findById({_id:fromUserId});

    const replyText = req.body.reply;

    try {
        await Reply.findOneAndUpdate({
            commentId: commentId,
        },{
            $push:{
                replies: {
                    userId: fromUserId,
                    userName: fetch_user.name,
                    image: fetch_user.image,
                    reply : replyText,
                    likes:0
                }
            }
        });

        const reply = await Reply.findOne({commentId:commentId});
        const length = reply.replies.length;
        const replyId = reply.replies[length - 1]._id;

        const newLike = new Like({
            commentId:replyId
        });
        await newLike.save();
    } catch (error) {
        console.log("error in postReply function");
    }
}




const addingArticleIdtoComments = async (articleId)=>{
    try{
        const newArticleComment = new Comment({
            articleId:articleId,
        });
        await newArticleComment.save();
    }catch(error){
        console.log(error,"error in addingArticleIdtoComments");
    }

}
module.exports = {postComment,postReply,addingArticleIdtoComments,getCommentsForThisArticle,likedComment,likedReply}