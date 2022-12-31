// ./node_modules/.bin/pm2 list

//Archivo de seguridad con la data de la url de mi base de datos MongoDB
require("dotenv").config();

const express = require("express");
const app = express();
let sessions = require("express-session");
let cookieParser = require("cookie-parser");
// Importa el router desde el archivo router.js
const router = require("./router");

//let cookies = require('cookies')

const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

//console.log("numero de Cpus => " + numCPUs);

/*for (let i = 0; i < numCPUs; i++) {
  cluster.fork();
}*/

function masterProcess() {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    console.log(`Forking process number ${i}...`);
    cluster.fork();
  }

  cluster.on("exit", function (worker, code, signal) {
    console.log("Se ha muerto el worker %s, reiniciando", worker.process.pid);
    cluster.fork();
  });

  //process.exit();
}

function childProcess() {
  console.log(`Worker ${process.pid} is running`);

  //process.exit();
}

if (!cluster.isMaster) {
  childProcess();
}


/*----------------Config de MongoDB------------------------*/
const { model } = require("mongoose");
require("./daos/MongoDB/config");

var { Productos, ChatStorage, Users } = require("./daos/MongoDB/models");

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://Sergio28:<password>@cluster0.jtavcgs.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

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


/*----------------Config de MYSql--------------------------*/
const { ClienteSql, ClienteMDB } = require("./sql.js");
const { options } = require("./options/SQLite3.js");

const sql = new ClienteSql(options);
/*---------------------------------------------------------*/

//const { MDBoptions } = require('./options/MariaDB');

//MYSQL

async function asynCall() {
  try {
    //console.log("trye");
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

app.use(express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: true }));

// Calling the express.json() method for parsing
app.use(express.json());

app.use(cookieParser());

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


app.engine('handlebars', engine({
  allowProtoPropertiesByDefault: true
}));
app.set('view engine', 'handlebars');
app.set("views", "./views");


if (cluster.isMaster) {
  masterProcess();
} else {
  //childProcess();
  //Start the server
  server.listen(process.env.PORT || PORT, function (err) {
    if (err) console.log(err);
    //console.log("Server started at http://localhost:" + PORT);
  });
}

module.exports = {
  sql
};
