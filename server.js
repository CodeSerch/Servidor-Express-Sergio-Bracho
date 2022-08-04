const express = require('express');
const app = express();

const { ClienteSql }  = require('./sql.js');
const { options } = require('./options/SQLite3.js');

const sql = new ClienteSql(options);

//MYSQL

async function asynCall(){
  try {
    console.log("trye");
    let articulo = {nombre:'Pollo'}
    await sql.insertarArticulos(articulo);
  } catch (error) {
    console.log("error =>")
  }
}

asynCall()

//socket io 
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
///////
const chatJs = require('./public/javascript/chatTxt');
const chatStorage = new chatJs.ChatTxt('./chatTxt.txt')

//Loads the handlebars module
const { engine } = require('express-handlebars');


const PORT = 8080;
const bodyParser = require('body-parser');

const contenedor = require('./programa.js');
const productContainer = new contenedor.Contenedor('./contenedor.txt');
const carritoContainer = new contenedor.ContenedorCarritos;

let bool, admin = false;


//Middlewares
//especificamos el subdirectorio donde se encuentran las páginas estáticas
app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: true }));

// Calling the express.json() method for parsing
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());


io.on('connection', (socket) => {
  console.log('new connection', socket.id);

  socket.on('chat init', async (mensaje) => {
    const chatInit = await chatStorage.getAll();
    io.emit('chat init', chatInit);
    console.log("este es el mensaje de " + mensaje)
  })

  socket.on('chat message', async (msg) => {
    io.emit('chat message', msg);
    console.log('message: ' + msg);
    const ChatPromise = await chatStorage.save(msg);
    console.log("chat promise: " + ChatPromise);
  })

  socket.on('send product', async (product) => {
    console.log("producto recibido: " + product)
    let productos = await productContainer.getAll();
    io.sockets.emit('send product', productos);
  })
});


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set("views", "./views");

app.get('/', (req, res) => {
  res.render('home', { navbar: 'navbar' });
});

app.get('/productos', async (req, res) => {
  console.log("obteniendo productos...");
  let productos = await productContainer.getAll();
  res.json(productos);
  //res.render('productos', { layout: 'main', products: productos });
})

app.get('/liveProducts', async function (req, res) {
  console.log("obteniendo productos...");
  let productos = await productContainer.getAll();

  res.render('liveProducts', { layout: 'main', products: productos });
});

app.get("/chat", (req, res) => {
  res.render('chat', { layout: 'main', title: "chat" });
})

app.get('/productos/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  let producto = await productContainer.getById(id);
  res.send(producto);
})

app.post('/productos', async (req, res) => {
  const objetoGuardar = { nombre: req.body.nombre,descripcion: req.body.descripcion, codigo: req.body.codigo, precio: req.body.precio, imgUrl: req.body.imgUrl, stock: req.body.stock };
  console.log(objetoGuardar)
  let producto = await productContainer.save(objetoGuardar);
  console.log(producto);
  //res.redirect('/products')
  let productos = await productContainer.getAll();
  //io emit refrescar productos
  io.emit('refresh product', productos);
  //res.render('home', { navbar: 'navbar' });
  res.json(producto);
});

app.put('/productos/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  const objetoGuardar = { nombre: req.body.title,descripcion: req.body.descripcion, codigo: req.body.codigo, precio: req.body.precio, imgUrl: req.body.imgUrl, stock: req.body.stock };
  console.log(objetoGuardar)
  let producto = await productContainer.update(objetoGuardar, id)
  console.log(producto);
  res.json(req.body)
});

app.get('/productoRandom', async (req, res) => {
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  let numeroRandom = getRandomInt(1, 4);

  let producto = await productContainer.getProductoById(numeroRandom);
  res.send(producto);
})

app.delete('/deleteProducto/:id', async (req, res) => {
  let id = parseInt(req.params.id);

  let producto = await productContainer.deleteById(id)

  console.log(producto);
  res.json("delete product id: " + id);
});

//Carrito
app.post('/carrito', (req, res) => {
  res.json("creando carrito con id:" + carritoContainer.crearCarrito());
});

app.delete('/carrito/:id', (req, res) => {
  let id = parseInt(req.params.id);
  console.log(carritoContainer.deleteById(id));
  res.json(id);
});

app.get('/carrito/:id', (req, res) => {
  let id = parseInt(req.params.id);
  console.log("obteniendo productos...");
  let productos = carritoContainer.getById(id);
  res.json(productos);
});

app.post('/carrito/:id/productos/:id_prod', async (req, res) => {
  let id = parseInt(req.params.id);
  let id_prod = parseInt(req.params.id_prod);
  let producto = await productContainer.getById(id_prod);
  //agregar producto al carrito segun su id
  
  carritoContainer.putProduct(producto,id);
  res.json(carritoContainer);
});

app.delete('/carrito/:id/productos/:id_prod', async (req, res) => {
  let id = parseInt(req.params.id);
  let id_prod = parseInt(req.params.id_prod);
  console.log("eliminar del carrito con id: " + id + " el producto con id: " + id_prod);
  //Eliminar un producto del carrito por su id de carrito y de producto
  res.json(carritoContainer.deleteProductById(id,id_prod));
});

//Start the server
server.listen(process.env.PORT || PORT, function (err) {
  if (err) console.log(err);
  console.log('Server started at http://localhost:' + PORT);
});

module.exports = {
  sql
};