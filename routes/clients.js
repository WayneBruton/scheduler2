var express = require('express');
var router = express.Router();
var pool = require('./connection');
const  { authenticationMiddleware } = require('./middleware');


router.get('/clients',authenticationMiddleware(), function(req, res){
    var offset = 0;
    var activeOrNot = req.body.activeOrNot;
    if (activeOrNot === undefined) {
        activeOrNot = true;
    }
    var q = `Select * from clients WHERE ACTIVE = ${activeOrNot} ORDER BY LAST_NAME limit 12 offset ${offset}`;
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(q, function (error, results, fields) {
            if (error) throw error;
            var clients = results;
            var viewjs = '../public/js/clients.js';
            var viewcss = '../public/styles/clients.css';
            res.render('clients', {clients: clients,viewjs: viewjs, viewcss: viewcss});
        });
        connection.release();

    });
    
    // connection.end();
});

router.get('/clients/:page/:activeOrNot', function(req, res){
    // connection.resume();
    var x = req.params.page;
    var activeOrNot = req.params.activeOrNot;
    var offset = x * 12;
    var q = `Select * from clients WHERE ACTIVE = ${activeOrNot} ORDER BY LAST_NAME limit 12 offset ${offset}`;
    try {

        pool.getConnection(function(err, connection){
            if (err) {
                connection.release();
                resizeBy.send('Error with connection');
              }
              connection.query(q, function (error, results, fields) {
                if (error) throw error;
                var clients = results;
                var upDatedClients = clients;
                res.send(upDatedClients);   
            }); 
            connection.release();
            
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
        pool.getConnection(function(err, connection){
            if (err) {
                connection.release();
                resizeBy.send('Error with connection');
              }
              connection.query(q, function (error, results, fields) {
                if (error) throw error;
                var clients = results;
                var upDatedClients = clients;
                res.send(upDatedClients);   
            });
            connection.release();



        });
        
        
        
    } catch(e) {
       
    }
     
});

router.get('/clientReturn', function(req, res){
    var activeOrNot = req.params.activeOrNot;
    console.log(activeOrNot);
    var offset = 0;
    var q = `Select * from clients WHERE ACTIVE = true ORDER BY LAST_NAME limit 12 offset ${offset}`;
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(q, function (error, results, fields) {
            if (error) throw error;
            var clients = results;
            var viewjs = '../public/js/clients.js';
            var viewcss = '../public/styles/clients.css';
            res.render('clients', {clients: clients, viewjs: viewjs, viewcss: viewcss});
        });
        connection.release();

    });
    
});

router.post('/addNewClient', function(req, res){
    var client = {
        last_name: req.body.lastName,
        first_name: req.body.firstName,
        email: req.body.email,
        client_type: req.body.clientType
    } 
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query('INSERT INTO clients SET ?',client, function (error, result) {
            if (error) throw error;
            res.redirect('/clients');
        });
        connection.release();


    });
    
});

router.get('/getClientTypes', function(req, res){
    var sql = `select * from client_type order by client_type_description`;
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(sql, function(error, result) {
            if (error) throw error;
            res.send(result);
        });
        connection.release();

    })
    

});


var clientReturned;
// router.get('/getclient', function(req, res){
router.get('/getclient/:clientID', function(req, res){
    client = req.params.clientID;
    var sql = `select cl.id, cl.first_name, cl.last_name, cl.email, cl.client_type, ct.client_type_description, 
                cl.active, cl.activity_reason from clients cl 
                 inner join client_type  ct on ct.id = cl.client_type
                 where cl.id = ${client}`;
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            clientReturned = results;
            console.log(clientReturned);
            res.send(clientReturned); 
        });
        // connection.release();
        connection.release();


    });
    
    // connection.release();
   
});

router.post('/editClient', function(req, res){
    
    var client = {
        last_name: req.body.lastName,
        first_name: req.body.firstName,
        email: req.body.email,
        active: req.body.activity,
        activity_reason: req.body.activityReason,
        client_type: req.body.clientType
    } 
    var id = req.body.id;
    console.log(client);
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(`UPDATE clients SET ? where ID = ${id}`,client, function (error, result) {
            if (error) throw error;
            res.redirect('/clients');  
        });
        connection.release();




    });
    
});

module.exports = router;