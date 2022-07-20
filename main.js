const express = require('express')

//Loads the handlebars module
const { engine } = require('express-handlebars');

const app = express()
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

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set("views", "./views");

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/productos', async (req, res) => {
    let productos = await productContainer.getAll();
    console.log("obteniendo productos...");
    //productos = JSON.stringify(productos);
    res.render('productos', { layout: 'main', products: productos });
})

app.get('/productos/:id', async (req, res) => {
    let id = parseInt(req.params.id);
    let producto = await productContainer.getById(id);
    res.send(producto);
})

app.post('/addProducto', async (req, res) => {
    const objetoGuardar = { title: req.body.title, price: req.body.price, imgUrl: req.body.imgUrl };
    //console.log(objetoGuardar)
    let producto = await productContainer.save(objetoGuardar);
    //console.log(producto);
    res.redirect('/productos')
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
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log('Server started at http://localhost:' + PORT);
});