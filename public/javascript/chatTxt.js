const fs = require('fs');
class ChatTxt {
    constructor(ruta){
        this.ruta = ruta
    } 
    async getAll() {
        console.log("entrando a getAll")
        try {
            const chat = await fs.promises.readFile(this.ruta, "utf-8");
            return JSON.parse(chat);
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
            await fs.promises.writeFile(this.ruta, JSON.stringify(chatStorage));
        } catch (error) {
            console.log("error al guardar mensaje en el Chat Storage")
        }
    }
}

module.exports = {
    ChatTxt
  };