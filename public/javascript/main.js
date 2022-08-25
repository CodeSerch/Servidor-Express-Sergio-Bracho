console.log("hola desde main.js");

let socket = io();
let user;

socket.emit("get user", "Serch28");

socket.on("send user", function (userData){
    
    user = userData;
    
    let userItem = document.getElementById("username");
    userItem.textContent = "Bienvido " + user[0].alias;
    console.log(user[0]);
})





