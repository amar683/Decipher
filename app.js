//----------------------------------------------- Imports--------------------------------------------

require('dotenv').config();
const express = require('express');
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);
// app.io = io;



const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
var multer = require("multer");
const _ = require("lodash");
const {getHeadlines} = require("./src/Services/headlines");
require("./src/db/connection");
const User = require('./src/db/Models/userSchema');
const Article = require('./src/db/Models/articleSchema');
const Comment = require("./src/db/Models/commentsSchema");
const Like = require("./src/db/Models/likesSchema");
const Reply = require('./src/db/Models/repliesSchema');
const Chat = require("./src/db/Models/chatSchema");
const Organisation = require('./src/db/Models/organisationSchema');
const {renderArticle,deleteArticle} = require("./src/Services/handleArticles");
const {registerUser,signInUser,authenticateUser} = require("./src/Services/userAuthentication");
const {postComment,postReply,addingArticleIdtoComments,getCommentsForThisArticle,likedComment,likedReply} = require("./src/Services/handlingComments");
const {addingConnection,displayConnections,sendConnectionReq,acceptConnectionReq,rejectConnectionReq,removeConnection,} = require("./src/Services/handlingConnections");
const {displayChats,sendMessage} = require("./src/Services/handlingChats");
const {sendMail} = require('./src/Services/mail');



let port = process.env.PORT || 8000;
if(port==null || port==""){
    port=8000;
}

const publicpath = path.join(__dirname,"/public");
const uploadpath = path.join(__dirname,"/uploads");
//-------------------------------------------  Middlewares ------------------------------------------------
app.set('io', io);
app.use(express.static(publicpath));
app.set("view engine","ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false})); //here it was false but i changed for testing img upload
// app.use("/uploads",express.static(path.join(__dirname,'/uploads')));

//---------------------------------using Multer for uploading image to database--------------------------
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadpath);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now());
    }
});
 
var upload = multer({ storage: storage });






// -------------------- Run when client Connects with socket --------------------------------

io.on('connection',socket=>{
    console.log('New Socket on server');

    // ---------------- Update messages on database and display instantly on client----------------------

    socket.on('send_message',async({chatRoomId,currentUserId,message})=>{
        console.log("curr user in send message === ",currentUserId);
        const currentUser = await User.findById({_id:currentUserId});
        await Chat.findByIdAndUpdate({_id:chatRoomId},{
            $push:{
                chats:{
                    userId:currentUser._id,
                    userName:currentUser.name,
                    message:message
                }
            }
        });
        io.sockets.in(chatRoomId).emit('recieved_message',currentUser,message);
    })


    // ---------------- Update articles on selecting category ----------------------

    // socket.on("fetch-article-by-category",async(category)=>{
    //     const articles = await Article.find({category:category});
    //     console.log("fetched article--",articles);
    //     socket.emit("recieve-article-by-category",articles);
    // })
});
 

//---------------------------------------------- Home Routes -----------------------------------------------

app.get("/",authenticateUser,async(req,res)=>{
    
    try {
        const headlines = await getHeadlines();
        const articles = await Article.find();
        try{
            // console.log(articles);
            if(req.verified){
                const userId = req.user._id;
                const user = await User.findOne({_id:userId});
                res.render("home", {
                    headlines: headlines,
                    articles: articles,
                    user:user,
                    renderLogout: true
                });
            }
            else{
                res.render("home", {
                    headlines: headlines,
                    articles: articles,
                    user:"",
                    renderLogout: false
                });
    
            }
            
        }
        catch(error){
            res.render("home", {
                headlines: headlines,
                articles: articles,
                user:"",
                renderLogout: false
            });
            console.log("ERROR in home route", error);
        }
    } catch (error) {
        console.log("ERROR while fetching headlines or articles",error);
    }

   
})
app.post("/category/:category",authenticateUser,async(req,res)=>{
    try {
        const headlines = await getHeadlines();
        const category = req.params.category.toLowerCase();
        const articles = await Article.find({category:category});
        try{
            // console.log(articles);
            if(req.verified){
                const userId = req.user._id;
                const user = await User.findOne({_id:userId});
                res.render("home", {
                    headlines: headlines,
                    articles: articles,
                    user:user,
                    renderLogout: true
                });
            }
            else{
                res.render("home", {
                    headlines: headlines,
                    articles: articles,
                    user:"",
                    renderLogout: false
                });
    
            }
            
        }
        catch(error){
            res.render("home", {
                headlines: headlines,
                articles: articles,
                user:"",
                renderLogout: false
            });
            console.log("ERROR in category route", error);
        }
    } catch (error) {
        console.log("ERROR while fetching headlines or articles throgh category route",error);
    }
})



// --------------------------------------------- User Registration Routes------------------------------------

app.route("/register-user")
    .get((req,res)=>{
        res.render("userRegistration");
    })
    .post(upload.single("profilePic"),async (req,res)=>{
    try {
        
       const save_user = await registerUser(req,res);

       await addingConnection(save_user._id);
       console.log("this is in resisration part-------",save_user); 
       res.redirect("/");
    } catch (error) {
        console.log("eror in reg post route",error);
        res.render("userRegistration");
    }
    })



//---------------------------------------------- Sign In Routes ----------------------------------------------

app.route("/sign-in")
    .get((req,res)=>{
        res.render("signIn");
    })
    .post(async (req,res)=>{
        try {
            const isSignedIn = await signInUser(req,res);
            if(isSignedIn){
                res.redirect("/");
            }
            else{
                res.redirect("/sign-in");
            }
        } catch (error) {
            res.status(400).send(error);  
        }
    })




// ------------------------------------------------- Sign Out Routes ---------------------------------------------

app.get("/sign-out",authenticateUser,async (req,res)=>{

    try {
        req.user.tokens = req.user.tokens.filter((currentIndexToken)=>{
            return currentIndexToken.token != req.token;
        })
        res.clearCookie("jwt");
        await req.user.save();
        console.log("Signed Out Succesfully.....");
        res.redirect("/");
    } catch (error) {
        res.status(400).send(error);
    }
})


// ------------------------------------------------- Donate Route ---------------------------------------------

app.get("/donate",authenticateUser,async (req,res)=>{

    try {
        const orgList = await Organisation.find();
        if(req.verified){
            res.render("donationOrg",{
                user: req.user,
                renderLogout: true,
                orgList:orgList
            });
        }else{
            res.render("donationOrg",{
                user: "",
                renderLogout: false,
                orgList:orgList
            });
        }
    } catch (error) {
        console.log("error in donate route");
    }
})

app.get("/donate/:orgId",async (req,res)=>{
    try {
        const organisation = await Organisation.findById({_id:req.params.orgId});
        if(req.verified){
            res.render("organisationDetail",{
                user:req.user,
                renderLogout:true,
                organisation:organisation
            });
        }else{
            res.render("organisationDetail",{
                user:"",
                renderLogout:false,
                organisation:organisation
            });
        }
    } catch (error) {
        console.log("error in donate detail route");
    }
})




// --------------------------------------------------- Organisation Routes ----------------------------------------

app.get("/register-organisation",(req,res)=>{
    res.render("organisationRegistration");
})
app.post("/register-organisation",upload.single("orgLogo"),async (req,res)=>{

    var orgLogo = fs.readFileSync(req.file.path);
    var encoded_image = orgLogo.toString("base64");

    const organisation = new Organisation({
        name: req.body.org_name,
        email: req.body.org_email,
        contact: req.body.org_contact,
        cause: req.body.org_cause,
        website: req.body.org_website,
        image:{
            contentType:req.body.mimetype,
            path:req.body.path,
            img:Buffer.from(encoded_image,"base64")
        }
    })

    await organisation.save();

    res.redirect("/donate");
})






// --------------------------------------------------- About Us Route ----------------------------------

app.get("/about-us",authenticateUser, (req,res)=>{
    try {
        if(req.verified){
            console.log("verified");
            res.render("aboutUs",{
                user:req.user,
                renderLogout:true
            });
        }
        else{
            console.log("not verified");
            res.render("aboutUs",{
                user:"",
                renderLogout:false
            });
        }
    } catch (error) {
        res.render("aboutUs",{
            user:"",
            renderLogout:false
        });
        console.log("error in about us route");
    }
})

// ------------------------------------------------- Contact Us Routes  -----------------------------------
app.get("/contact",authenticateUser,(req,res)=>{
    if(req.verified){
        res.render("contact",{
            user: req.user,
            renderLogout: true
        })
    }else{
        res.render("contact",{
            user: "",
            renderLogout: false
        })
    }
})
 
app.post("/contact",authenticateUser,(req,res)=>{
    console.log(req);
    if(req.verified){
        console.log(req.body.name);
        sendMail(req);
        res.redirect('back');
    }
    else{
        sendMail(req);
        res.redirect('back')
    }
})


// --------------------------------------------------- Articles Related Routes ---------------------------


app.get("/articles/:articleId",authenticateUser,async (req,res)=>{

        try {
            const article = await renderArticle(req,res);
            const allComments = await getCommentsForThisArticle(req,res);
            const allReplies = await Reply.find();

            if(req.verified){

                const allLikes = await Like.find({'likes.userId':req.user._id});

                res.render("article",{
                    article:article,
                    user: req.user,
                    renderLogout: true,
                    allComments:allComments,
                    allReplies:allReplies,
                    allLikes: allLikes
                });
            }
            else{
                const allLikes = await Like.find();
                res.render("article",{
                    article:article,
                    user: "", 
                    renderLogout: false,
                    allComments:allComments,
                    allReplies:allReplies,
                    allLikes: allLikes
                });
            }
        } catch (error) {
            console.log("ERROR : of article Rendering", error);
        }

    })

app.post("/articles/:articleId",(req,res)=>{
    res.send("<h1>hey dude you need to signIn to comment here.....Go and sign In first</h1>");
})
app.post("/articles/:articleId/:userId",authenticateUser,async (req,res)=>{
        if(req.verified){
            await postComment(req,res);
            res.redirect('back'); //basically reload your page or to be more precise it redirects it back to the page from where the request came
        }
        else{
            res.send("<h1>hey dude you need to signIn to comment here.....Go and sign In first</h1>");
        }
    })
app.post("/reply/to/:commentId/from/:fromUserId",authenticateUser,async (req,res)=>{
    
    try {
        const allReplies = await postReply(req,res);
        res.redirect('back'); //basically reload your page 
    } catch (error) {
        console.log("error in reply Post route",error);
    }
})


app.post("/comment/like/:commentId",authenticateUser,async(req,res)=>{
     const likes = await likedComment(req,res);
     res.redirect('back');
})
app.post("/reply/like/:replyId",authenticateUser,async(req,res)=>{
     const likes = await likedReply(req,res);
     res.redirect('back');
})





app.route("/write-article")
    .get(authenticateUser,(req,res)=>{
        console.log(req.verified);

        if(req.verified){
            res.render("writeArticle",{
                user: req.user
            });
        }
        else{
            res.send("<h1>you dont have access to this page......Please sign in dude</h1>");
        }
    })
    .post(authenticateUser,upload.single("articleImg"),async (req,res,next)=>{
        //req.body retuns a json object which can be directly passed in Article() instead of writing like this {title: req.body.title, author: req.body.author,category: req.body.category,content: req.body.content}
        try {
            const articleImg = fs.readFileSync(req.file.path);
            const encoded_image = articleImg.toString("base64");
            const article = new Article({
                userId: req.user._id,
                title: req.body.title,
                author:req.body.author,
                category:req.body.category,
                content:req.body.content,
                image:{
                    contentType:req.body.mimetype,
                    path:req.body.path,
                    img:Buffer.from(encoded_image,"base64")
                }
            });   
            const save_article = await article.save();
            await addingArticleIdtoComments(save_article._id);
            res.redirect("/");
        } 
        catch (error) {
            res.send(error);
        }

    })

    app.post("/articles/to/delete/:articleId",authenticateUser,async (req,res)=>{
        if(req.verified){
            await deleteArticle(req,res);
            res.redirect("/");
        }
    })

// ------------------------------------------------- Friends or Connections List Route ---------------------------

app.get("/connections",authenticateUser,async (req,res)=>{
  
    try {
        if(req.verified){
            const connections = await displayConnections(req.user._id);
            // console.log("connections in route",connections);
            res.render("connections",{
                user:req.user,
                renderLogout:true,
                connections:connections
            });
        }
        else{
            res.send("<h1>Sign in to access this page</h1>");
        }
    } catch (error) {
        console.log("Error in Post req for displayConnections Req");
    }
})
app.post("/connections/request/to/:toUserId",authenticateUser, async (req,res)=>{
   try {
       if(req.verified){
            await sendConnectionReq(req,res); 
            res.redirect("/connections");
       }
   } catch (error) {
       console.log("Error in Post req for SendConnection Req");
   }
})



app.post("/connections/accept/:reqFromUserId",authenticateUser,async (req,res)=>{
    try {
            await acceptConnectionReq(req,res); 
            res.redirect("/connections");
    } catch (error) {
        console.log("Error in Post req for acceptConnectionReq Req");
    }
})




app.post("/connections/reject/:reqFromUserId",authenticateUser,async (req,res)=>{
    try {
        await rejectConnectionReq(req,res);
        res.redirect("/connections");
    } catch (error) {
        console.log("Error in Post req for rejectConnectionReq Req");
    }
})
app.post("/connections/remove/:removeUserId",authenticateUser,async (req,res)=>{
    try {
        await removeConnection(req,res);
        res.redirect("/connections");
    } catch (error) {
        console.log("Error in Post req for removeConnection Req");
    }
})

app.get("/connections/chat/:userIdtoChat",authenticateUser,async (req,res)=>{
    
    const {chats,chatUser,chatRoomId} = await displayChats(req,res);

    io.on('connection',socket=>{
        console.log('New Socket chat');
        socket.join(chatRoomId); 
        socket.emit('get_current_user_and_other',chatUser);
    });
     
    res.render("chat",{
        user:req.user,
        renderLogout: true,
        chats : chats,
        chatUser:chatUser,
        chatRoomId:chatRoomId
    });
})
app.post("/connections/chat/send/:chatRoomId",authenticateUser,async (req,res)=>{
    await sendMessage(req,res); 
    const chat = await Chat.findById({_id:req.params.chatRoomId});
    res.render("partials/chatDisplay",{
        user: req.user,
        chats: chat.chats
    });
    res.end();
})



//------------------------------------------------ 404 Error Page ----------------------------------

app.get("/*",authenticateUser,(req,res)=>{
    if(req.verified){
        res.render("404error",{
            user:req.user,
            renderLogout:true
        });
    }
    else{
        res.render("404error",{
            user:"",
            renderLogout:false
        });
    }
})



// ------------------------------------------------ Listening to Server  ---------------------------------------

server.listen(port,function(){
    console.log("server running on 8000.....");
})