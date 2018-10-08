var express = require('express');
var router = express.Router();
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'scheduler',
    password: '12071994W!',
    multipleStatements: true //for more than one query in a get route
})

module.exports = connection;


// const connection = mysql.createConnection({
//     host: 'localhost:3306',
//     user: 'eccentri_root',
//     database: 'eccentri_scheduler',
//     password: '12071994Wb!@',
//     multipleStatements: true //for more than one query in a get route
// });
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     database: 'scheduler',
//     password: '12071994W!',
//     multipleStatements: true //for more than one query in a get route
// })