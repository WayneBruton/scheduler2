var express = require('express');
var router = express.Router();
var pool = require('./connection');

const  { authenticationMiddleware } = require('./middleware');

router.get('/carers',authenticationMiddleware(), function(req, res){
    var offset = 0;
    var activeOrNot = req.body.activeOrNot;
    if (activeOrNot === undefined) {
        activeOrNot = true;
    }
    console.log(activeOrNot);
    var q = `Select * from carers WHERE ACTIVE = ${activeOrNot} ORDER BY LAST_NAME limit 12 offset ${offset}`;
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(q, function (error, results, fields) {
            if (error) throw error;
            var carers = results;
            var viewjs = '../public/js/carers.js';
            var viewcss = '../public/styles/carers.css';
            res.render('carers', {carers: carers, viewjs: viewjs, viewcss: viewcss});
        });
        connection.release();
    })
    
});

router.get('/carers/:page/:activeOrNot', function(req, res){
    var x = req.params.page;
    var activeOrNot = req.params.activeOrNot;
    console.log(activeOrNot);
    var offset = x * 12;
    var q = `Select * from carers WHERE ACTIVE = ${activeOrNot} ORDER BY LAST_NAME limit 12 offset ${offset}`;
    try {
        pool.getConnection(function(err, connection){
            if (err) {
                connection.release();
                resizeBy.send('Error with connection');
              }
              connection.query(q, function (error, results, fields) {
                if (error) throw error;
                var carers = results;
                var upDatedCarers = carers;
                res.send(upDatedCarers);   
            }); 
            connection.release();
        });
         
    } catch(e) {
       
    }
     
});

router.get('/carer/:search/:activeOrNot', function(req, res){
    var x = req.params.search;
    if (x === '&&') {
        x = '';
    }
    var activeOrNot = req.params.activeOrNot;
    var q = `Select * from carers where last_name like '${x}%' AND ACTIVE = ${activeOrNot} ORDER BY LAST_NAME`;
    try {
        pool.getConnection(function(err, connection){
            if (err) {
                connection.release();
                resizeBy.send('Error with connection');
              }
              connection.query(q, function (error, results, fields) {
                if (error) throw error;
                var carers = results;
                var upDatedCarers = carers;
                res.send(upDatedCarers); 
            });
            connection.release(); 
        });
         
    } catch(e) {
       
    }
     
});

router.get('/carerReturn', function(req, res){
    var offset = 0;
    var q = `Select * from carers WHERE ACTIVE = true ORDER BY LAST_NAME limit 12 offset ${offset}`;
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(q, function (error, results, fields) {
            if (error) throw error;
            var carers = results;
            var viewjs = '../public/js/carers.js';
            var viewcss = '../public/styles/carers.css';
            res.render('carers', {carers: carers, viewjs: viewjs, viewcss: viewcss});
        });
        connection.release();

    });
    
});

router.post('/addNewCarer', function(req, res){
    var carer = {
        last_name: req.body.lastName,
        first_name: req.body.firstName,
        email: req.body.email,
        employee_number: req.body.employeeNumber,
        rate_per_hour: req.body.ratePerHour
    } 
        pool.getConnection(function(err, connection){
            if (err) {
                connection.release();
                resizeBy.send('Error with connection');
              }
              connection.query('INSERT INTO carers SET ?',carer, function (error, result) {
                if (error) throw error;
                res.redirect('/carers');
            }); 
            connection.release();
        });
   
          
});

// app.get('/getcarer/:carerID', function(req, res){
router.get('/getcarer/:carerID', function(req, res){
    carer = req.params.carerID;
    // var offset = 0;
    console.log(carer);
    var q = `Select * from carers WHERE ID = ${carer}`;
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(q, function (error, results, fields) {
            if (error) throw error;
            var carerReturned = results;
            // res.render('carers', {carers: carer});
            res.send(carerReturned);
            console.log(carerReturned);
        });
        connection.release();
    })
    
    // console.log(carerReturned);
});

router.post('/editCarer', function(req, res){
    var carer = {
        // id: req.body.id,
        last_name: req.body.lastName,
        first_name: req.body.firstName,
        email: req.body.email,
        employee_number: req.body.employeeNumber,
        rate_per_hour: req.body.ratePerHour,
        active: req.body.activity,
        activity_reason: req.body.activityReason
    } 
    var id = req.body.id;
    console.log(carer);
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(`UPDATE carers SET ? where ID = ${id}`,carer, function (error, result) {
            if (error) throw error;
            res.redirect('/carers');
        });
        connection.release();
    });
    
});

module.exports = router;