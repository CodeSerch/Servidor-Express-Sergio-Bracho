console.log("hola desde main.js");

let mainSocket = io();
let user;

mainSocket.emit("get user", "");

mainSocket.on("send user", function (userData) {
  user = userData;

  let userItem = document.getElementById("username");
  try {
    userItem.textContent = "Bienvenido " + user[0].alias;
  } catch (error) {
    
  }
  
  console.log(user[0]);
});

let buttonClearHistory = document.getElementById("buttonClearHistory");

buttonClearHistory.addEventListener("click", function (e) {
    mainSocket.emit("delete chat history");
});
