const express = require('express')
const app = express()
const contenedor = require('./programa.js');
const PORT = 8080;
const bodyParser = require('body-parser');

app.use(express.urlencoded({ extended: true }));

// Calling the express.json() method for parsing
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get('/', function (req, res) {
    res.send('Hello World')
})

app.get('/productos', async (req, res) => {
    let productos = await contenedor.getProductos();
    console.log("obteniendo productos...");
    //productos = JSON.stringify(productos);
    res.send(productos);
})

app.get('/productos/:id', async (req, res) => {
    let id = parseInt(req.params.id);
    let producto = await contenedor.getProductoById(id);
    res.send(producto);
})

app.post('/addProducto', async (req, res) => {
    const objetoGuardar = { title: req.body.title, price: req.body.price, imgUrl: req.body.imgUrl };
    console.log(objetoGuardar)
    let producto = await contenedor.saveProduct(objetoGuardar);
    console.log(producto);
    res.json(req.body)
});

app.get('/productoRandom', async (req, res) => {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    let numeroRandom = getRandomInt(1, 4);

    let producto = await contenedor.getProductoById(numeroRandom);
    res.send(producto);
})


//Start the server
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log('Server started at http://localhost:' + PORT);
});