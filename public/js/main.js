let socket;

// -------------------------- Socket Code for Real time Chat ---------------------------

const chatToUserId = location.pathname.substring(location.pathname.lastIndexOf('/')+1);
if(location.pathname === `/connections/chat/${chatToUserId}`){
    console.log(chatToUserId);
    socket = io();
    
    let currentUserId = $("#chat_message").data("currentuser");
    let otherUser = {};
    socket.on('get_current_user_and_other',chatUser=>{
        otherUser = chatUser;
    }) 

    $("#send_chat_message").on('click',(event)=>{
        event.preventDefault();
        event.stopPropagation();

        let chatRoomId = $("#chat_form").data("chatroomid");
        let message = $("#chat_message").val();
        console.log(message);
        if(message.trim() != ""){
            console.log("curr user from cleent side === ",currentUserId);
            socket.emit("send_message",{chatRoomId,currentUserId,message});
        }
        $("#chat_message").val("");

        
    })


    socket.on('recieved_message',(user,message)=>{
        outputMessage(user,message);
        window.scrollTo(0,$("#chat_display_div").height()-$("footer").height());
    })



    const outputMessage = (user,message)=>{
        const div = document.createElement('div');
        $("#default_chatroom_msg").css('display','none'); 
        if(user._id == currentUserId){
            div.classList.add('my-chat-div');
            div.innerHTML = `<h5 class="my-chat-name">You</h5>
            <p class="my-message">${message}</p>`;
            document.querySelector("#chat_display_div").appendChild(div);
        }
        else{
            div.classList.add('other-chat-div');
            div.innerHTML = `<h5 class="other-chat-name">${user.name}</h5>
            <p class="other-message">${message}</p>`;
            document.querySelector("#chat_display_div").appendChild(div);
        }
    }
}

//  // -------------------------- Socket Code for Fetching Article By Category ---------------------------
//  if(location.pathname === '/'){
//      socket = io();
//      $(".news-category-btn").on('click',function(e){
//         e.preventDefault();
//         e.stopPropagation();
//         const category = $(this).text().toLowerCase();

//         socket.emit("fetch-article-by-category",category);
//         console.log(category);
//      })

//      socket.on("recieve-article-by-category",(articles)=>{
//         console.log(articles);
//      })
//  }