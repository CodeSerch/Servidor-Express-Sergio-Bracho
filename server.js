//Archivo de seguridad con la data de la url de mi base de datos MongoDB
require("dotenv").config();

const express = require("express");
const app = express();
let sessions = require("express-session");
let cookieParser = require('cookie-parser')
//let cookies = require('cookies')

/*----------------Config de MongoDB------------------------*/
const { model } = require("mongoose");
require("./daos/MongoDB/config");

var { Productos, ChatStorage, Users } = require("./daos/MongoDB/models");

/*---------------------------------------------------------*/

//Crear Usuario en la base de Datos
async function createUser() {
  console.log("creating username...");
  await Users.create({
    correo: "sergioenriquebg28@gmail.com",
    nombre: "Sergio",
    apellido: "Bracho",
    edad: 21,
    alias: "Serch28",
    avatar:
      "https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes-thumbnail.png",
  });
}

//createUser();

//Sistema de usuarios y autenticacion:
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var uniqueValidator = require("mongoose-unique-validator");

/*----------------Config de MYSql--------------------------*/
const { ClienteSql, ClienteMDB } = require("./sql.js");
const { options } = require("./options/SQLite3.js");

const sql = new ClienteSql(options);
/*---------------------------------------------------------*/

//const { MDBoptions } = require('./options/MariaDB');

//MYSQL

async function asynCall() {
  try {
    console.log("trye");
    let articulo = { nombre: "Pollo" };
    await sql.insertarArticulos(articulo);
  } catch (error) {
    console.log("error =>");
  }
}

asynCall();

//socket io
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
///////
const chatJs = require("./public/javascript/chatTxt");
const chatStorageFs = new chatJs.ChatTxt("./chatTxt.txt");

//Loads the handlebars module
const { engine } = require("express-handlebars");

const PORT = 8080;
const bodyParser = require("body-parser");

const contenedor = require("./programa.js");
const { title } = require("process");
const { table, debug } = require("console");
const { session } = require("passport");
const productContainer = new contenedor.Contenedor("./contenedor.txt");
const carritoContainer = new contenedor.ContenedorCarritos();

let bool,
  admin = false;

//Middlewares
//especificamos el subdirectorio donde se encuentran las páginas estáticas

app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: true }));

// Calling the express.json() method for parsing
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cookieParser())

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  sessions({
    secret: "asdasds",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  socket.on("chat init", async (mensaje) => {
    const chatInit = await chatStorageFs.getAll();
    io.emit("chat init", chatInit);
    console.log("este es el mensaje de " + mensaje);
  });

  socket.on("chat message", async (msg) => {
    io.emit("chat message", msg);
    console.log("message: " + msg);
    const ChatPromise = await chatStorageFs.save(msg);
    console.log("chat promise: " + ChatPromise);
  });

  socket.on("send product", async (product) => {
    console.log("producto recibido: " + product);
    let productos = await productContainer.getAll();
    io.sockets.emit("send product", productos);
  });

  socket.on("get user", async (alias) => {
    let usuario = await Users.find({ alias: alias });
    io.sockets.emit("send user", usuario);
  });

  socket.on("delete chat history", async () => {
    console.log("empty chat storage...");
    await ChatStorage.remove({});
    //io.sockets.emit('send user', usuario);
  });
});

const verifyToken = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).json({ error: "Acceso denegado" });
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next(); // continuamos
  } catch (error) {
    res.status(400).json({ error: "token no es válido" });
  }
};

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.get("/", (req, res) => {
  let userData;
  let token = null;
  try {
    console.log(req.cookies.auth)
    token = req.cookies.auth;
    console.log("sucess get cookie auth")
  } catch (error) {
    console.log("cookies doesn't exist");
  }

  //let session = req.session;

  //console.log(session);

  //let token = window.localStorage.getItem("access-token");
  

  if (token) {
    jwt.verify(
      token,
      process.env.SEED_AUTENTICACION,
      function (err, token_data) {
        if (err) {
          return res.status(403).send("Error");
        } else {
          req.user_data = token_data;
          console.log(token_data);
          userData = token_data.usuario;
        }
      }
    );
  } else {
    console.log("no token");
    //return res.status(403).send('No token');
  }

  //let userData = req.user;

  //console.log(userData);

  //if (token) {
    res.render("home", { navbar: "navbaar", userData: userData.alias });
  //} else {
  //  res.render("home", { navbar: "navbar" });
  //}
});

app.get("/login", (req, res) => {
  res.render("login", { layout: "main", navbar: "navbar" });
});

app.post("/login", (req, res) => {
  let body = req.body;

  Users.findOne({ correo: body.correo }, (erro, usuarioDB) => {
    if (erro) {
      return res.status(500).json({
        ok: false,
        err: erro,
      });
    }

    // Verifica que exista un usuario con el mail escrita por el usuario.
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario incorrecto",
        },
      });
    }

    // Valida que la contraseña escrita por el usuario, sea la almacenada en la db
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Contraseña incorrecta",
        },
      });
    }

    // Genera el token de autenticación
    let token = jwt.sign(
      {
        usuario: usuarioDB,
      },
      process.env.SEED_AUTENTICACION,
      {
        expiresIn: process.env.CADUCIDAD_TOKEN,
      }
    );

    //window.localStorage.setItem("access_token", token);

    //usuarioDB.token = token;

    /*res.header("auth-token", token).json({
      error: null,
      data: { token },
    });*/

    res.cookie("auth", token);

    res.redirect("/");
    /*res.json({
      ok: true,
      usuario: usuarioDB,
      token,
    });*/
    //RESPUESTA
  });
});

app.post("/register", function (req, res) {
  let body = req.body;
  let { correo, nombre, apellido, edad, alias, avatar, password, role } = body;
  let usuario = new Users({
    correo,
    nombre,
    apellido,
    edad,
    alias,
    avatar,
    password: bcrypt.hashSync(password, 10),
    role,
  });

  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      usuario: usuarioDB,
    });
  });
});

/*app.get('/register', (req, res) => {
  res.render('login', { layout: 'main', navbar: 'navbar' });
});*/

app.get("/productos", async (req, res) => {
  console.log("obteniendo productos...");
  let productos = await productContainer.getAll();
  res.json(productos);
  //res.render('productos', { layout: 'main', products: productos });
});

app.get("/liveProducts", async function (req, res) {
  console.log("obteniendo productos...");
  let productos = await productContainer.getAll();

  res.render("liveProducts", { layout: "main", products: productos });
});

app.get("/chat", (req, res) => {
  res.render("chat", { layout: "main", title: "chat" });
});

app.get("/productos/:id", async (req, res) => {
  let id = parseInt(req.params.id);
  let producto = await productContainer.getById(id);
  res.send(producto);
});

app.post("/productos", async (req, res) => {
  const objetoGuardar = {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    codigo: req.body.codigo,
    precio: req.body.precio,
    imgUrl: req.body.imgUrl,
    stock: req.body.stock,
  };
  console.log(objetoGuardar);
  let producto = await productContainer.save(objetoGuardar);
  console.log(producto);
  //res.redirect('/products')
  let productos = await productContainer.getAll();
  //io emit refrescar productos
  io.emit("refresh product", productos);
  //res.render('home', { navbar: 'navbar' });
  res.json(producto);
});

app.put("/productos/:id", async (req, res) => {
  let id = parseInt(req.params.id);
  const objetoGuardar = {
    nombre: req.body.title,
    descripcion: req.body.descripcion,
    codigo: req.body.codigo,
    precio: req.body.precio,
    imgUrl: req.body.imgUrl,
    stock: req.body.stock,
  };
  console.log(objetoGuardar);
  let producto = await productContainer.update(objetoGuardar, id);
  console.log(producto);
  res.json(req.body);
});

app.get("/productoRandom", async (req, res) => {
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  let numeroRandom = getRandomInt(1, 4);

  let producto = await productContainer.getProductoById(numeroRandom);
  res.send(producto);
});

app.delete("/deleteProducto/:id", async (req, res) => {
  let id = parseInt(req.params.id);

  let producto = await productContainer.deleteById(id);

  console.log(producto);
  res.json("delete product id: " + id);
});

//Carrito
app.post("/carrito", (req, res) => {
  res.json("creando carrito con id:" + carritoContainer.crearCarrito());
});

app.delete("/carrito/:id", (req, res) => {
  let id = parseInt(req.params.id);
  console.log(carritoContainer.deleteById(id));
  res.json(id);
});

app.get("/carrito/:id", (req, res) => {
  let id = parseInt(req.params.id);
  console.log("obteniendo productos...");
  let productos = carritoContainer.getById(id);
  res.json(productos);
});

app.post("/carrito/:id/productos/:id_prod", async (req, res) => {
  let id = parseInt(req.params.id);
  let id_prod = parseInt(req.params.id_prod);
  let producto = await productContainer.getById(id_prod);
  //agregar producto al carrito segun su id

  carritoContainer.putProduct(producto, id);
  res.json(carritoContainer);
});

app.delete("/carrito/:id/productos/:id_prod", async (req, res) => {
  let id = parseInt(req.params.id);
  let id_prod = parseInt(req.params.id_prod);
  console.log(
    "eliminar del carrito con id: " + id + " el producto con id: " + id_prod
  );
  //Eliminar un producto del carrito por su id de carrito y de producto
  res.json(carritoContainer.deleteProductById(id, id_prod));
});

//ROUTES WITH MONGODB
app.get("/getMongoData", async (req, res) => {
  //Get Data MONGODB
  //const productsMDB = await productModel.find({})
  const productos = await Productos.find({});
  const chats = await ChatStorage.find({});
  //console.log(productos);
  //Table me muestra cosas raras, revisar
  //console.table(productos);
  res.json(chats);
});

//Start the server
server.listen(process.env.PORT || PORT, function (err) {
  if (err) console.log(err);
  console.log("Server started at http://localhost:" + PORT);
});

module.exports = {
  sql,
};
