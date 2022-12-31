let socket = io();

let usuario = "";
let avatarImg = "";

socket.emit("get user", "Serch28");

socket.on("send user", function (userData) {
  try {
    usuario = userData[0].alias;
    avatarImg = userData[0].avatar;
  } catch (error) {
    console.log(" CHAT ERROR => " + error);
  }
});

let messages = document.getElementById("messages");
let form = document.getElementById("form");
let input = document.getElementById("input");

socket.emit("chat init", "chat init");

form.addEventListener("submit", function (e) {
  let today = new Date();
  let date =
    today.getFullYear() + "-" + today.getDate() + "-" + (today.getMonth() + 1);
  let time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date + " " + time;

  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", {
      fecha: dateTime,
      usuario: {
        alias: usuario,
        avatar: avatarImg,
      },
      texto: input.value,
    });
    input.value = "";
  }
});

socket.on("chat message", function (msg) {
  let chatBox = document.createElement("div");

  chatBox.classList.add("chatBox");

  let dateText = document.createElement("p");
  dateText.classList.add("dateTextStyle");
  dateText.textContent = msg.fecha;

  let username = document.createElement("p");
  username.classList.add("usernameStyle");
  username.textContent = msg.usuario.alias + ":";

  let chatText = document.createElement("p");
  chatText.classList.add("chatTextStyle");
  chatText.textContent = msg.texto;

  let avatarImg = document.createElement("img");
  avatarImg.src = msg.usuario.avatar;
  avatarImg.width = 50;
  avatarImg.height = 50;

  chatBox.appendChild(dateText);
  chatBox.appendChild(avatarImg);
  chatBox.appendChild(username);
  chatBox.appendChild(chatText);

  messages.appendChild(chatBox);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("chat init", function (chatStorage) {
  let historyItem = document.createElement("h2");
  if (chatStorage.length == 0) {
    historyItem.textContent = "historial vacio";
  } else {
    historyItem.textContent = "historial";
  }
  messages.appendChild(historyItem);

  console.log("chat storage length: " + chatStorage.length);
  console.log("entrando al ciclo for");
  for (i = 0; i <= chatStorage.length - 1; i++) {
    let chatBox = document.createElement("div");
    chatBox.classList.add("chatBox");

    let dateText = document.createElement("p");
    dateText.classList.add("dateTextStyle");
    dateText.textContent = chatStorage[i].fecha;

    let username = document.createElement("p");
    username.classList.add("usernameStyle");
    username.textContent = chatStorage[i].usuario.alias + ":";

    let chatText = document.createElement("p");
    chatText.classList.add("chatTextStyle");
    chatText.textContent = chatStorage[i].texto;

    let avatarImg = document.createElement("img");
    avatarImg.src = chatStorage[i].usuario.avatar;
    avatarImg.width = 50;
    avatarImg.height = 50;

    chatBox.appendChild(dateText);
    chatBox.appendChild(avatarImg);
    chatBox.appendChild(username);
    chatBox.appendChild(chatText);

    messages.appendChild(chatBox);
    window.scrollTo(0, document.body.scrollHeight);
  }
  window.scrollTo(0, document.body.scrollHeight);
});
