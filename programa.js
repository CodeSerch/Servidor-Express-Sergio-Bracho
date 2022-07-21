let fs = require('fs');
let fsPr = fs.promises;
const { stringify } = require('querystring');

class Contenedor {

    constructor(fileName) {
        this.fileName = fileName;
    }

    async save(objeto) {
        try {
            let objectArray = await this.getAll();
            objeto.id = objectArray.length + 1;

            //console.log("guardando objeto con id: " + objeto.id);
            objectArray.push(objeto);

            await fsPr.writeFile(`./${this.fileName}`, JSON.stringify(objectArray))
            //console.log("nuevo archivo: " + JSON.stringify(objectArray));
            return objeto.id;
        } catch (err) {
            console.log("error => " + err);
        }
    }

    async update(object, id) {
        try {
            let objectArray = await this.getAll();

            const objIndex = objectArray.findIndex((obj => obj.id == id));

            objectArray[objIndex].title = object.title;
            objectArray[objIndex].price = object.price;
            objectArray[objIndex].imgUrl = object.imgUrl;

            await fsPr.writeFile(`./${this.fileName}`, JSON.stringify(objectArray))
            return id;
        } catch (err) {
            console.log("error => " + err);
        }
    }

    async getById(number) {
        try {
            console.log("Obteniendo objeto con id: " + number);
            let content = await this.getAll()
            let objeto = content.find(x => x.id === number);
            if (objeto != null) {
                return objeto;
            } else {
                return 'null';
            }
        } catch (err) {
            console.log(err);
        }
    }

    async getAll() {
        try {
            if (fs.existsSync(`./${this.fileName}`)) {
                let content = await fsPr.readFile(`./${this.fileName}`, 'utf-8')
                console.log("productos obtenidos con exito")
                return JSON.parse(content);
            } else {
                console.log("retornado nuevo Array")
                return new Array();
            }

        } catch (err) {
            console.log("getAll err: " + err);
        }
    }

    async deleteById(number) {
        try {
            let content = await this.getAll();
            content = content.filter(x => x.id !== number);
            console.log("new content: " + JSON.stringify(content));
            await fsPr.writeFile(`./${this.fileName}`, JSON.stringify(content))
            return (number + " eliminado")
        }
        catch (err) {
            console.log(err);
        }
    }

    async deleteAll() {
        try {
            await fsPr.unlink(`./${this.fileName}`)
            return "delete all";
        } catch (err) {
            console.error(err)
        }
    }
}

let contenedor = new Contenedor("contenedor.txt");
console.log("nombre de la ruta del archivo: " + stringify(contenedor));

const p1 = {
    nombre: 'producto1',
    precio: 200,
}
const p2 = {
    nombre: 'producto2',
    precio: 300,
}
const p3 = {
    nombre: 'producto3',
    precio: 340,
}



async function test() {

    //Metodo save para guardar Objetos.

    /*console.log(await contenedor.save(p1));
    console.log(await contenedor.save(p2));
    console.log(await contenedor.save(p3));*/

    //Metodo para obtener un objeto segun su ID
    //console.log(await contenedor.getById(2));

    //Metodo para borarr un objeto segun su ID
    //console.log(await test.deleteById(2));


    //Metodo para borrar TODO
    //console.log(await contenedor.deleteAll());

}

//test()


module.exports = {
    Contenedor
};