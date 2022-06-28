const express = require('express')
const app = express()
const contenedor = require('./programa.js');
const PORT = 8080;

app.use(express.urlencoded({extended:true}));

// Calling the express.json() method for parsing
app.use(express.json());


app.get('/', function (req, res) {
    res.send('Hello World')
})

app.get('/productos', async (req, res) => {
    let productos = await contenedor.getProductos();
    console.log("obteniendo productos...");
    //productos = JSON.stringify(productos);
    res.send(productos);
})

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