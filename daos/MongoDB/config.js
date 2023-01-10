//Import the mongoose module
const mongoose = require('mongoose');

//Set up default mongoose connection
const mongoDB = process.env.MONGODB_URI;


//Vencimiento del token
process.env.CADUCIDAD_TOKEN = '48h';

//SEED de autenticacion
process.env.SEED_AUTENTICACION = process.env.SEED_AUTENTICACION || 'este-es-el-seed-desarrollo';

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1})
.then(db => console.log("MongoDB is connected"))
.catch(err => console.log("database connect error"));

//Get the default connection
function getConnection(){
    return mongoose.connection
}

//Bind connection to error event (to get notification of connection errors)
//db.on('error', console.error.bind(console, 'MongoDB connection error:'));