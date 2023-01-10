const config = require("./config");
const { Schema, model } = require("mongoose");
let uniqueValidator = require("mongoose-unique-validator");
//const { rolesValidos } = require("../../server");

const db = config.getConnection();
db.on('error', console.error.bind(console, 'connection error:'));
const myDb = db.useDb('ecommerce');
//const myDb = db.client.db("ecommerce");

let rolesValidos = {
  values: ["ADMIN", "USER"],
  message: "{VALUE} no es un role válido",
};

const products = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const chat = new Schema({
  fecha: String,
  usuario: {
    correo: String,
    nombre: String,
    apellido: String,
    edad: Number,
    alias: String,
    avatar: String,
  },
  texto: String,
});

const users = new Schema({
  correo: String,
  nombre: String,
  apellido: String,
  edad: Number,
  alias: {
    type: String,
    required: [true, "El usuario es necesario"],
  },
  password: {
    type: String,
    required: [true, "La contraseña es necesaria"],
  },
  avatar: String,
  role: {
    type: String,
    default: "USER",
    required: [true],
    enum: rolesValidos,
  },
});

// elimina la key password del objeto que retorna al momento de crear un usuario
users.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

users.plugin(uniqueValidator, {
  message: "{PATH} debe de ser único",
});


const chatSchema = myDb.model("chatStorage", chat);
const productsSchema = myDb.model("products", products);
const usersSchema = myDb.model("users", users);

//module.exports = model("productos", productSchema)
//module.exports = model("chatStorage", chatSchema)
module.exports = {
  ChatStorage: chatSchema,
  Products: productsSchema,
  Users: usersSchema,
};
