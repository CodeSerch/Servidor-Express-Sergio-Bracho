const { Schema, model } = require('mongoose')

const productSchema = new Schema({
  title:  String, // String is shorthand for {type: String}
  price: Number,
  imgUrl:   String,
});

module.exports = model('productos', productSchema);

