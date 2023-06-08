require('dotenv').config();
const mongoose = require("mongoose");
const db = process.env.DATABASE_URL;
mongoose.connect(db,{
    useFindAndModify:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(()=>{
    console.log("Connection to database established..........");
}).catch(console.error());
