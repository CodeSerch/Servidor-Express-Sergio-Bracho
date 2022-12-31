//const fs = require('fs');
/*const { ClienteSql } = require("../../sql.js");
const { options } = require("../../options/SQLite3.js");
const sql = new ClienteSql(options);*/

/*----------------Config de MongoDB------------------------*/
require("../../daos/MongoDB/config");
var { ChatStorage} = require("../../daos/MongoDB/models");
/*---------------------------------------------------------*/

class ChatTxt {
  constructor(ruta) {
    this.ruta = ruta;
  }
  async getAll() {
    try {
      const historialMensajes = await ChatStorage.find({});
      //const historialMensajes = await fs.promises.readFile(this.ruta, "utf-8");
      return historialMensajes;
    } catch (error) {
      console.log("error, return vacio");
      return [];
    }
  }

  async save(mensaje) {
    //console.log("entrando a Save");
    //const chatStorage = await this.getAll();
    //const historialMensajes = await ChatStorage.find({});
    //console.log("chat Storage: " + chatStorage);
    //historialMensajes.push(mensaje);
    try {
      //await fs.promises.writeFile(this.ruta, JSON.stringify(chatStorage));
      //await sql.insertarMensaje(mensaje);
      await ChatStorage.create(mensaje);
    } catch (error) {
      console.log("error al guardar mensaje en el Chat Storage");
    }
  }
}

module.exports = {
  ChatTxt,
};
