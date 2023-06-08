const fetch = require('node-fetch');
const getHeadlines = async ()=>{
    try{
        let results = await fetch("https://newsapi.org/v2/top-headlines?country=in&apiKey=8a831a5ab5d34f028e6ff17464a5f89e");
        let response = await results.json();
        // console.log(response);
        return response;
    }
    catch(err){
        console.log(err);
        return err;
    }
}
module.exports = {getHeadlines};