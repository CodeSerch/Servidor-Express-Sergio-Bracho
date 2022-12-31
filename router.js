const express = require("express");
const router = express.Router();
const { systemInfo } = require("./systemInfo");
const cookies = require("cookies");

//Sistema de usuarios y autenticacion:
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var uniqueValidator = require("mongoose-unique-validator");

var { Productos, ChatStorage, Users } = require("./daos/MongoDB/models");

const contenedor = require("./programa.js");
const productContainer = new contenedor.Contenedor("./contenedor.txt");

router.get("/", (req, res) => {

  const verifyToken = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) return res.status(401).json({ error: "Acceso denegado" });
    try {
      const verified = jwt.verify(token, process.env.TOKEN_SECRET);
      req.user = verified;
      console.log("token valido?");
      next(); // continuamos
    } catch (error) {
      res.status(400).json({ error: "token no es válido" });
    }
  };

  let userData;
  let token = null;
  try {
    console.log(req.cookies.auth);
    token = req.cookies.auth;
    console.log("sucess get cookie auth");
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

  if (token) {
    res.render("home", { userData: userData.alias });
  } else {
    res.render("home");
  }
});

router.get("/login", (req, res) => {
  res.render("login", { layout: "main" });
});

router.get("/register", (req, res) => {
  res.render("register", { layout: "main" });
});

router.post("/login", (req, res) => {
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

    console.log("res.cookie");
    res.cookie("auth", token, { maxAge: 10 * 60 * 60 });

    res.redirect("/");
    /*res.json({
        ok: true,
        usuario: usuarioDB,
        token,
      });*/
    //RESPUESTA
  });
});

router.get("/logout", (req, res) => {
  //res.cookie("auth", token);
  res.clearCookie("auth");
  res.redirect("/");
});

router.post("/register", function (req, res) {
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

router.get("/info", (req, res) => {
  res.render("info", { layout: "main", info: systemInfo });
});

router.get("/productos", async (req, res) => {
  console.log("obteniendo productos...");
  const productos = await Productos.find({});

  //Convertir objeto de MongoDB a un objeto normal para poder mostrarlo en handlebars, si no no funciona
  const normalObjects = productos.map((producto) => {
    return {
      name: producto.name,
      price: producto.price,
    };
  });

  res.render("productos", { layout: "main", products: normalObjects });
});

router.get("/liveProducts", async function (req, res) {
  console.log("obteniendo productos...");
  //let productos = await productContainer.getAll();
  const productos = await Productos.find({});

  res.render("liveProducts", { layout: "main", products: productos });
});

router.get("/chat", (req, res) => {
  res.render("chat", { layout: "main", title: "chat" });
});

router.get("/productos/:id", async (req, res) => {
  let id = parseInt(req.params.id);
  let producto = await productContainer.getById(id);
  res.send(producto);
});

router.post("/productos", async (req, res) => {
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

router.put("/productos/:id", async (req, res) => {
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

router.get("/productoRandom", async (req, res) => {
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  let numeroRandom = getRandomInt(1, 4);

  let producto = await productContainer.getProductoById(numeroRandom);
  res.send(producto);
});

router.delete("/deleteProducto/:id", async (req, res) => {
  let id = parseInt(req.params.id);

  let producto = await productContainer.deleteById(id);

  console.log(producto);
  res.json("delete product id: " + id);
});

//Carrito
router.post("/carrito", (req, res) => {
  res.json("creando carrito con id:" + carritoContainer.crearCarrito());
});

router.delete("/carrito/:id", (req, res) => {
  let id = parseInt(req.params.id);
  console.log(carritoContainer.deleteById(id));
  res.json(id);
});

router.get("/carrito/:id", (req, res) => {
  let id = parseInt(req.params.id);
  console.log("obteniendo productos...");
  let productos = carritoContainer.getById(id);
  res.json(productos);
});

router.post("/carrito/:id/productos/:id_prod", async (req, res) => {
  let id = parseInt(req.params.id);
  let id_prod = parseInt(req.params.id_prod);
  let producto = await productContainer.getById(id_prod);
  //agregar producto al carrito segun su id

  carritoContainer.putProduct(producto, id);
  res.json(carritoContainer);
});

router.delete("/carrito/:id/productos/:id_prod", async (req, res) => {
  let id = parseInt(req.params.id);
  let id_prod = parseInt(req.params.id_prod);
  console.log(
    "eliminar del carrito con id: " + id + " el producto con id: " + id_prod
  );
  //Eliminar un producto del carrito por su id de carrito y de producto
  res.json(carritoContainer.deleteProductById(id, id_prod));
});

//ROUTES WITH MONGODB
router.get("/getMongoData", async (req, res) => {
  //Get Data MONGODB
  //const productsMDB = await productModel.find({})
  const productos = await Productos.find({});
  const chats = await ChatStorage.find({});
  //console.log(productos);
  //Table me muestra cosas raras, revisar
  //console.table(productos);
  res.json(chats);
});

module.exports = router;
