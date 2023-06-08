const _ = require("lodash");
const Article = require("../db/Models/articleSchema");

const renderArticle = async (req,res)=>{
    try {
        const title = req.params.articleTitle;
        const author = req.params.author;

        // const lowerCaseTitle = _.lowerCase(articleTitle);
        // console.log(lowerCaseTitle);
        // const lowerCaseAuthor = _.lowerCase(author);
        // console.log(lowerCaseAuthor);

        const article = await Article.findOne({title:title, author: author});
        return article;
    } catch (error) {
        res.send(error);
        console.log(error);
    }

      
}

module.exports = {renderArticle};