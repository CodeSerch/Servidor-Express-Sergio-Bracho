const knexLib = require('knex');

class ClienteSql {
  constructor(config) {
    this.knex = knexLib(config);
  }

  insertarArticulos(articulos) {
    return this.knex("articulos").insert(articulos);
  }
}

module.exports = {
    ClienteSql
};
