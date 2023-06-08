const _ = require("lodash");
const Article = require("../db/Models/articleSchema");
const Comment = require("../db/Models/commentsSchema");
const Like = require("../db/Models/likesSchema");
const Reply = require("../db/Models/repliesSchema");

const renderArticle = async (req,res)=>{
    try {
        // const title = req.params.articleTitle;
        // const author = req.params.author;

        // const lowerCaseTitle = _.lowerCase(articleTitle);
        // console.log(lowerCaseTitle);
        // const lowerCaseAuthor = _.lowerCase(author);
        // console.log(lowerCaseAuthor);
        const articleId = req.params.articleId;
        const article = await Article.findById({_id:articleId});
        // console.log("Article ====-",article);
        return article;
    } catch (error) {
        res.send(error);
        console.log(error);
    }

      
}
 
const deleteArticle = async (req,res)=>{
    try {
        const article = await Article.findById({_id:req.params.articleId});
        console.log(article);

        const allComments = await Comment.findOne({articleId:article._id});

        allComments.comments.forEach(async (comment)=>{

            await Like.findOneAndDelete({commentId:comment._id});
            const allReplies = await Reply.findOne({commentId:comment._id});

            allReplies.replies.forEach(async (reply)=>{
                await Like.findOneAndDelete({commentId:reply._id});
            });
            await Reply.findOneAndDelete({commentId:comment._id});
        });

        await Comment.findOneAndDelete({articleId:article._id});
        await Article.findByIdAndDelete({_id:req.params.articleId});

    } catch (error) {
        console.log("Error in Delete Article function");
    }
}
module.exports = {renderArticle,deleteArticle};