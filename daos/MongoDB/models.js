const { Schema, model } = require("mongoose");

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
    avatar: String
  },
  texto: String
});

const users = new Schema({
    correo: String,
    nombre: String,
    apellido: String,
    edad: Number,
    alias: String,
    avatar: String
});

const chatSchema = model('chatStorage',chat)
const productosSchema = model('productos',productos)
const usersSchema = model('users',users)


//module.exports = model("productos", productSchema)
//module.exports = model("chatStorage", chatSchema)
module.exports = {
  ChatStorage : chatSchema,
  Productos : productosSchema,
  Users : usersSchema
}

