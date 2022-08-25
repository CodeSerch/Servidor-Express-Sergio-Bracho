console.log("hola desde main.js");
const { create } = require("express-handlebars");
/*----------------Config de MongoDB------------------------*/
const { model } = require("mongoose");
require("../../daos/MongoDB/config");

var { Productos, ChatStorage, Users } = require("../../daos/MongoDB/models");

/*---------------------------------------------------------*/

let usernameItem = document.getElementById("username");

async function getUser() {
  console.log("getting username...");
  usernameItem.textContent = await Users.find({alias:"Serch28"});
}

async function createUser() {
    console.log("creating username...");
    await Users.create({
        correo: "sergioenriquebg28@gmail.com",
        nombre: "Sergio",
        apellido: "Bracho",
        edad: 21,
        alias: "Serch28",
        avatar: "https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes-thumbnail.png"
    });
  }

//getUser();

createUser();