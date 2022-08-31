const { Schema, model } = require("mongoose");
let uniqueValidator = require("mongoose-unique-validator");
//const { rolesValidos } = require("../../server");

let rolesValidos = {
  values: ["ADMIN", "USER"],
  message: "{VALUE} no es un role válido",
};

const productos = new Schema({
  title: String, // String is shorthand for {type: String}
  price: Number,
  imgUrl: String,
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

const chatSchema = model("chatStorage", chat);
const productosSchema = model("productos", productos);
const usersSchema = model("users", users);

//module.exports = model("productos", productSchema)
//module.exports = model("chatStorage", chatSchema)
module.exports = {
  ChatStorage: chatSchema,
  Productos: productosSchema,
  Users: usersSchema,
};
