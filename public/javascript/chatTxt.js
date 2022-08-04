//const fs = require('fs');

const { ClienteSql }  = require('../../sql.js');
const { options } = require('../../options/SQLite3.js');

const sql = new ClienteSql(options);

class ChatTxt {
    constructor(ruta){
        this.ruta = ruta
    } 
    async getAll() {
        console.log("entrando a getAll")
        try {
            const historialMensajes = await sql.getMensajes();
            console.table(historialMensajes);
            //const historialMensajes = await fs.promises.readFile(this.ruta, "utf-8");
            return historialMensajes;
        } catch (error) {
            console.log("error, return vacio")
            return []
        }
    }

    async save(mensaje) {
        //console.log("entrando a Save");
        const chatStorage = await this.getAll();
        //console.log("chat Storage: " + chatStorage);
        chatStorage.push(mensaje);
        try {
            //await fs.promises.writeFile(this.ruta, JSON.stringify(chatStorage));
            await sql.insertarMensaje(mensaje);
        } catch (error) {
            console.log("error al guardar mensaje en el Chat Storage")
        }
    }
}

module.exports = {
    ChatTxt
  };