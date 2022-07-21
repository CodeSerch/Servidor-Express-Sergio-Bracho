
let email = prompt("ingresa tu email:");
let socket = io();

let messages = document.getElementById('messages');
let form = document.getElementById('form');
let input = document.getElementById('input');

socket.emit("chat init", "chat init")

form.addEventListener('submit', function (e) {
  let today = new Date();
  let date = today.getFullYear() + '-' + today.getDate() + '-' + (today.getMonth() + 1);
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date + ' ' + time;

  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', dateTime + " " + email + ": " + input.value);
    input.value = '';
  }
});

socket.on('chat message', function (msg) {
  let item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});


socket.on('chat init', function (chatStorage) {
  let item = document.createElement('li');
  if (chatStorage.length == 0) {
    item.textContent = "historial: vacio";
  } else {
    item.textContent = "historial:";
  }
  messages.appendChild(item);


  console.log("chat storage length: " + chatStorage.length);
  console.log(chatStorage);
  console.log("entrando al ciclo for");
  for (i = 0; i <= chatStorage.length - 1; i++) {
    console.log("index: " + i)
    console.log(chatStorage[i]);
    let item = document.createElement('li');
    item.textContent = chatStorage[i];
    messages.appendChild(item);
  }
  window.scrollTo(0, document.body.scrollHeight);
});

