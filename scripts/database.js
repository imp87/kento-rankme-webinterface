const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
};
const express = require("express");
const app = express();
const dbConnection = require('./database_connect.js');

const secret = process.env.SESSION_SECRET;

async function setConnect() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const sessionStore = new MySQLStore({
            expiration: (60000 * 60 * 24 * 3) // expire session in 3 days
        }, connection);
        return { sessionStore };
    } catch (error) {
        console.error(error);
    }
}

const dbConnect = {
    setConnect: setConnect
};

module.exports = {
    setConnect,
    dbConnect,
};
