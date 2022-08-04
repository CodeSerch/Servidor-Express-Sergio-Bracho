'use strict';

const options = {
    client: 'sqlite3',
    connection: {
        filename: "./DB/ecommerce.db"
    },
    useNullAsDefault: true
}

module.exports = {
    options
};