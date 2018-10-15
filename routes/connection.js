var express = require('express');
var router = express.Router();
require('dotenv/config');

const mysql = require('mysql');



const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    multipleStatements: true, //for more than one query in a get route
    debug: false
});


module.exports = pool;


