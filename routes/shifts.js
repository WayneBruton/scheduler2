var express = require('express');
var router = express.Router();
var connection = require('./connection');

const  { authenticationMiddleware } = require('./middleware');


router.get('/shifts',authenticationMiddleware(), function(req, res){
    var queryClients = `select cl.id, last_name,first_name, ct.client_type_description as cType from clients cl
    join
    client_type  ct on cl.client_type = ct.id
    where active = true
    order by last_name`;
    var queryCarers = 'Select * from carers WHERE ACTIVE = true ORDER BY LAST_NAME';
    var sql = `${queryClients};${queryCarers}`;
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        var clients = results[0];
        var carers = results[1];
        var viewjs = '../public/js/shifts.js';
        var viewcss = '../public/styles/shifts.css';
        console.log(viewjs);
        res.render('shifts', {clients: clients, carers: carers, viewjs: viewjs, viewcss: viewcss});
    });
});

router.post('/postshifts', function(req, res){
    var data = req.body.shiftsToPost;
    // var data = req.params.shiftsToPost;
    console.log(data);
    var response = {
        success : 'New shifts added!',
        failure: 'There was a problem'
    }
    var sql = 'INSERT INTO shifts (shift_schedule_id,client_id,carer_id,shift_month,shift_type,shift_start,shift_end, payrollCode) VALUES ?';
    connection.query(sql ,[data], function (error, result) {
        // if (error) throw error;
        // console.log(sql);
        if (error) {
            res.end(JSON.stringify(response.failure)); 
            // console.log(error)   
        }
        res.end(JSON.stringify(response.success));
        console.log(response.success);
    });
});    

router.get('/shiftsAllocated/:clientSelected/:shiftPeriod', function(req, res){
    var client = req.params.clientSelected;
    var shift = req.params.shiftPeriod;
    var sql = `select shifts.id, time_sheets_processed, client_id, last_name, first_name, carer_id, shift_month, shift_schedule_id, shift_type, shift_start, shift_end from shifts left join carers on shifts.carer_id = carers.id where shift_month = "${shift}" and client_id = ${client}`;
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        var shifts = results;
        res.json({shifts});
    });
});

router.get('/getpublicholidays/:pYear/:pMonth', function(req, res){
    var pYear = req.params.pYear;
    var pMonth = req.params.pMonth;
    

    var sql = `select * from publicHolidays where DAYOFWEEK(publicHolidayDate) != 1 and MONTH(publicHolidayDate) = ${pMonth} and YEAR(publicHolidayDate) = ${pYear}`;
    console.log(sql);
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        var pHolidays = results;
        res.json(pHolidays);
    });
});

router.delete('/deleteshifts', function(req, res){
    var shift = req.body.shiftsToBeDeleted;
    console.log(shift);
    var response = {
        success : 'shift Destroyed',
        failure: 'There was a problem'
    }

    var sql = `DELETE FROM shifts WHERE ID IN (${shift})`;
    connection.query(sql, function (error, results, fields) {
        if (error) {
            res.end(JSON.stringify(response.failure)); 
        };
        res.end(JSON.stringify(response.success)); 
    });
});



module.exports = router;
