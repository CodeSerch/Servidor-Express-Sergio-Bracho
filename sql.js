const knexLib = require('knex');

class ClienteSql {
  constructor(config) {
    this.knex = knexLib(config);
  }

  insertarArticulos(articulos) {
    return this.knex("articulos").insert(articulos);
  }

  getMensajes(){
    return this.knex('mensajes').select('*'); 
  }

  insertarMensaje(mensaje){
    return this.knex('mensajes').insert(mensaje);
  }

  borrarMensajePorUsuario(usuario){
    return this.knex.from('mensajes').where('usuario',usuario).del();
  }
}

class ClienteMDB{
    constructor(config) {
    this.knex = knexLib(config);
    }

    getMensajes(){
      return this.knex('articulos').select('*'); 
    }
}

module.exports = {
    ClienteSql,
    ClienteMDB
};
