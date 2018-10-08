var express = require('express');
var router = express.Router();
var connection = require('./connection');
const  { authenticationMiddleware } = require('./middleware');


router.get('/clients',authenticationMiddleware(), function(req, res){
    var offset = 0;
    var activeOrNot = req.body.activeOrNot;
    if (activeOrNot === undefined) {
        activeOrNot = true;
    }
    var q = `Select * from clients WHERE ACTIVE = ${activeOrNot} ORDER BY LAST_NAME limit 12 offset ${offset}`;
    connection.query(q, function (error, results, fields) {
        if (error) throw error;
        var clients = results;
        var viewjs = '../public/js/clients.js';
        var viewcss = '../public/styles/clients.css';
        res.render('clients', {clients: clients,viewjs: viewjs, viewcss: viewcss});
    });
});

router.get('/clients/:page/:activeOrNot', function(req, res){
    var x = req.params.page;
    var activeOrNot = req.params.activeOrNot;
    var offset = x * 12;
    var q = `Select * from clients WHERE ACTIVE = ${activeOrNot} ORDER BY LAST_NAME limit 12 offset ${offset}`;
    try {
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            var clients = results;
            var upDatedClients = clients;
            res.send(upDatedClients);   
        });  
    } catch(e) {
       
    }
     
});

//Search for clients

router.get('/client/:search/:activeOrNot', function(req, res){
    var x = req.params.search;
    if (x === '&&') {
        x = '';
    }
    var activeOrNot = req.params.activeOrNot;
    var q = `Select * from clients where last_name like '${x}%' AND ACTIVE = ${activeOrNot} ORDER BY LAST_NAME`;
    try {
        connection.query(q, function (error, results, fields) {
            if (error) throw error;
            var clients = results;
            var upDatedClients = clients;
            res.send(upDatedClients);   
        });  
    } catch(e) {
       
    }
     
});

router.get('/clientReturn', function(req, res){
    var activeOrNot = req.params.activeOrNot;
    console.log(activeOrNot);
    var offset = 0;
    var q = `Select * from clients WHERE ACTIVE = true ORDER BY LAST_NAME limit 12 offset ${offset}`;
    connection.query(q, function (error, results, fields) {
        if (error) throw error;
        var clients = results;
        var viewjs = '../public/js/clients.js';
        var viewcss = '../public/styles/clients.css';
        res.render('clients', {clients: clients, viewjs: viewjs, viewcss: viewcss});
    });
});

router.post('/addNewClient', function(req, res){
    var client = {
        last_name: req.body.lastName,
        first_name: req.body.firstName,
        email: req.body.email,
        client_type: req.body.clientType
    } 
    connection.query('INSERT INTO CLIENTS SET ?',client, function (error, result) {
        if (error) throw error;
        res.redirect('/clients');
    });
});

router.get('/getClientTypes', function(req, res){
    var sql = `select * from client_type order by client_type_description`;
    connection.query(sql, function(error, result) {
        if (error) throw error;
        res.send(result);
    });

});

router.get('/getclient/:clientID', function(req, res){
    client = req.params.clientID;
    // var offset = 0;
    // console.log(client);
    var q = `Select * from clients WHERE ID = ${client}`;
    connection.query(q, function (error, results, fields) {
        if (error) throw error;
        var clientReturned = results;
        // res.render('carers', {carers: carer});
        res.send(clientReturned);
        // console.log(clientReturned);
    });
    // console.log(carerReturned);
});

router.post('/editClient', function(req, res){
    var client = {
        // id: req.body.id,
        last_name: req.body.lastName,
        first_name: req.body.firstName,
        email: req.body.email,
        active: req.body.activity,
        activity_reason: req.body.activityReason,
        client_type: req.body.clientType
    } 
    var id = req.body.id;
    console.log(client);
    connection.query(`UPDATE CLIENTS SET ? where ID = ${id}`,client, function (error, result) {
        if (error) throw error;
        res.redirect('/clients');
    });
});

module.exports = router;