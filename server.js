const express = require('express');
const app = express();

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
const productContainer = new contenedor.Contenedor('./contenedor.txt')

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
    res.render('home', {navbar: 'navbar'});
});

app.get('/products', async (req, res) => {
    console.log("obteniendo productos...");
    let productos = await productContainer.getAll();
    res.render('productos', { layout: 'main', products: productos });
})

app.get('/liveProducts', async function (req, res) {
  console.log("obteniendo productos...");
  let productos = await productContainer.getAll();

    res.render('liveProducts', {layout: 'main', products: productos});
  });

app.get("/chat", (req, res) => {
    res.render('chat', { layout: 'main', title: "chat" });
  })

app.get('/productos/:id', async (req, res) => {
    let id = parseInt(req.params.id);
    let producto = await productContainer.getById(id);
    res.send(producto);
})

app.post('/addProducto', async (req, res) => {
    const objetoGuardar = { title: req.body.title, price: req.body.price, imgUrl: req.body.imgUrl };
    console.log(objetoGuardar)
    let producto = await productContainer.save(objetoGuardar);
    console.log(producto);
    //res.redirect('/products')
    let productos = await productContainer.getAll();
    //io emit refrescar productos
    io.emit('refresh product', productos);
    res.render('home', {navbar: 'navbar'});
});

app.put('/putProducto/:id', async (req, res) => {
    let id = parseInt(req.params.id);
    const objetoGuardar = { title: req.body.title, price: req.body.price, imgUrl: req.body.imgUrl };
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


//Start the server
server.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log('Server started at http://localhost:' + PORT);
  });