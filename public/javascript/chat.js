
let usuario = prompt("ingresa tu usuario:");
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
    socket.emit('chat message', {"fecha": dateTime, "usuario":usuario,"mensaje":input.value});
    input.value = '';
  }
});

socket.on('chat message', function (msg) {
  let item = document.createElement('li');
  item.textContent = (msg.fecha + " " + msg.usuario + " " + msg.mensaje);
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
  console.log("entrando al ciclo for");
  for (i = 0; i <= chatStorage.length - 1; i++) {
    console.log("index: " + i)
    console.log(chatStorage[i]);
    let item = document.createElement('li');
    item.textContent = (chatStorage[i].fecha + " " + chatStorage[i].usuario + " " + chatStorage[i].mensaje);
    messages.appendChild(item);
  }
  window.scrollTo(0, document.body.scrollHeight);
});

