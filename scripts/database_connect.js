require('dotenv').config()
const mysql = require('mysql2');
var clc = require("cli-color");

async function connect() {
    try {
        const dbConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT
        })
        return dbConnection;
    } catch (err) {
        console.log(clc.red('[SERVER] ') + 'Verbindung zur Datenbank fehlgeschlagen.')
        throw err;
    }
}

module.exports = { connect };
