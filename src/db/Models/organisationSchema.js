const mongoose = require("mongoose");

const organisation = mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
    },
    contact:{
        type:String,
        require:true
    },
    cause:{
        type:String,
        require:true
    },
    website:String,
    image:{
        contentType:String,
        path:String,
        img:Buffer
    }
});


const Organisation = new mongoose.model("Organisation",organisation);

module.exports = Organisation; 