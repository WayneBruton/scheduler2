var express = require('express');
var router = express.Router();
require('dotenv/config');
// var moment = require('moment');
var moment = require('moment-timezone');
var pool = require('./connection');
var fs = require('fs');
const path = require('path');

moment.tz.setDefault('Africa/Johannesburg');



const  { authenticationMiddleware } = require('./middleware');

var reportLocation = process.env.DATABASE_REPORTS;

//PROCESS TIMESHEETS /processVIPFile/

router.get('/processTimesheets',authenticationMiddleware(), function(req, res){
    var viewjs = '../public/js/processTimesheets.js';
    var viewcss = '../public/styles/processTimesheets.css';
    res.render('processTimesheets', {viewjs: viewjs, viewcss: viewcss});

});

router.get('/timesheetRetrieve/:searchMonth/:processedOrNot/:searchBy/:search', function(req, res){
    var shift_month = req.params.searchMonth;
    var time_sheets_processed = req.params.processedOrNot;
    var searchStr = req.params.search;
    var searchBy = req.params.searchBy;

    if (searchStr === '&&') {
        searchStr = '';
    }
    var sqlCount = `select count(*) as count from shifts where shift_month = '${shift_month}' and time_sheets_processed = false`;
    var sqlTotalTimeshheets = `select count(*) as count from shifts where shift_month = '${shift_month}'`;
    var sql = `select shifts.id as shiftId, shifts.client_id as clientId, clients.last_name as clientLastName, clients.first_name as clientFirstName, shifts.carer_id as carerId, carers.last_name as carerLastName, carers.first_name as carerFirstName, shift_month, shift_start, shift_end, time_sheets_processed, carers.employee_number as carerEmployeeNumber from shifts`;
    sql = sql + ` inner join clients on clients.id = client_id`; 
    sql = sql + ` inner join carers on carers.id = carer_id`;
    sql = sql + ` where time_sheets_processed = ${time_sheets_processed}`;
    sql = sql + ` and shift_month = '${shift_month}' and invoice_processed = false and wage_file_processed = false`
    var sql2 = '';
    console.log(sql);
    if (searchBy === 'carers') {
        sql2 = ` and carers.last_name like '${searchStr}%' order by carers.last_name, carers.first_name, carers.employee_number, shift_start`;
    } else if (searchBy === 'clients') {
        sql2 = ` and clients.last_name like '${searchStr}%' order by clients.last_name, clients.first_name, shift_start, carers.last_name, carers.first_name, carers.employee_number`;

    } else if (searchBy === 'employee_number') {
        sql2 = ` and carers.employee_number = '${searchStr}' order by shift_start`;
    }
    var sql3 = ' limit 100';
    sql = sql + sql2 + sql3;

     var sqlDuplicates = `SELECT 
     carers.employee_number as employeeNumber,carers.last_name as caLastName,carers.first_name as caFirstName, COUNT(carer_id),
     date(shift_start) as shiftDate, count(date(shift_start)) as duplicates   
 FROM
     shifts
     inner join clients on clients.id = client_id
     inner join carers on carers.id = carer_id
     where shift_month = '${shift_month}'
     
 GROUP BY 
     carer_id, date(shift_start)
 HAVING 
        (COUNT(carer_id) > 1) AND 
        (COUNT(date(shift_start)) > 1)`;


     var sqlOver24hrs = `select  client_id, clients.last_name, clients.first_name, date(shift_start) ,`;
     sqlOver24hrs = sqlOver24hrs + ` sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) as totalTime from shifts`;
     sqlOver24hrs = sqlOver24hrs + ` join clients on shifts.client_id = clients.id`;
     sqlOver24hrs = sqlOver24hrs + ` where shift_month = '${shift_month}'`;
     sqlOver24hrs = sqlOver24hrs + ` group by  date(shift_start),client_id`;
     sqlOver24hrs = sqlOver24hrs + ` having sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) > 24`;


    var sqlLongShifts = `select carer_id, carers.last_name as carerLName, carers.first_name as carerFName,clients.last_name as clientLName, clients.first_name as clientFName, `;
    sqlLongShifts = sqlLongShifts +  ` date(shift_end) ,time_format(timediff(shift_end,shift_start),'%H:%i'),`;
    sqlLongShifts = sqlLongShifts +  ` time_to_sec(timediff(shift_end, shift_start )) / 3600`;
    sqlLongShifts = sqlLongShifts +  ` from shifts`;
    sqlLongShifts = sqlLongShifts +  ` inner join carers on carers.id = carer_id`;
    sqlLongShifts = sqlLongShifts +  ` inner join clients on clients.id = client_id`;
    sqlLongShifts = sqlLongShifts +  ` where shift_month = '${shift_month}' and ((time_to_sec(timediff(shift_end, shift_start )) / 3600) > 12)`;

    var sqlOverlappingShifts = `select cl.last_name, cl.first_name,cl.id, ca.last_name, ca.first_name,ca.id,  a.shift_start, a.shift_end from shifts a`; 
    sqlOverlappingShifts = sqlOverlappingShifts + ` inner join shifts b on a.client_id = b.client_id`; 
    sqlOverlappingShifts = sqlOverlappingShifts + ` and a.shift_end > b.shift_start and a.shift_start < b.shift_end`;
    sqlOverlappingShifts = sqlOverlappingShifts + ` and a.shift_start < b.shift_start`;
    sqlOverlappingShifts = sqlOverlappingShifts + ` join clients  cl on a.client_id = cl.id`;
    sqlOverlappingShifts = sqlOverlappingShifts + ` join carers  ca on a.carer_id = ca.id`;
    sqlOverlappingShifts = sqlOverlappingShifts + ` where a.shift_month = '${shift_month}' and b.shift_month = '${shift_month}'`;



    var finalSQL = `${sql};${sqlCount};${sqlTotalTimeshheets};${sqlDuplicates};${sqlOver24hrs};${sqlLongShifts};${sqlOverlappingShifts}`
    
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(finalSQL, function (error, results, fields) {
            if (error) throw error;
            var timesheets = results[0];
            var processedCount = results[1];
            var totalTimesheets = results[2];
            var duplicates = results[3];
            var overBilling = results[4];
            var longShifts = results[5];
            var overlaps = results[6];
    
            var latestTimeSheets = [];
    
            res.send({
                timesheets: timesheets, 
                processedCount: processedCount, 
                totalTimesheets: totalTimesheets, 
                duplicates: duplicates,
                overBilling: overBilling,
                longShifts: longShifts,
                overlaps: overlaps
            });
            // console.log(timesheets);  
        });
        connection.release();
    });
});

router.get('/processVIPFile/:dataProcess', function(req, res){
    var period = req.params.dataProcess;
    var sql = `select distinct carer_id, payrollCode, employee_number,  sum(timestampdiff(HOUR,shift_start, shift_end)) as hours, sum(timestampdiff(MINUTE,shift_start, shift_end)) as minutes from shifts`; 
    sql = sql + ` inner join carers on carers.id = carer_id`;
    sql = sql + ` where time_sheets_processed = true and  shift_month = '${period}'`;
    sql = sql + ` group by carer_id, payrollCode`;

    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            var wageFile = results;
            var filename = `${period}-${Date.now()}.txt`;
            var datatosend = `${reportLocation}${filename}`
            var filepath = `./files/${filename}`;
            res.send(datatosend);
    
            // res.send(host);
            for (i = 0; i < wageFile.length; i++) {
                var st1 = 'D002$';
                var st2 =  wageFile[i].employee_number;
                var st3 = '     ';
                var st4 = wageFile[i].payrollCode;
                var st5 = '         ';
                if (wageFile[i].employee_number.length === 3) {
                    st2 = st2;
                } else if (wageFile[i].employee_number.length === 2) {
                    st2 = `0${st2}`;
                } else if (wageFile[i].employee_number.length === 1) {
                    st2 = `00${st2}`;
                }
                if ((wageFile[i].minutes - (wageFile[i].hours * 60)) === 0 ) {
                    var min = '00';
                } else {
                    var min = (wageFile[i].minutes - (wageFile[i].hours * 60));
                };
                var timeLen = 12;
                var totaltime = `${wageFile[i].hours}${min}+`;
                var zeroforTime = timeLen - totaltime.length;
                var st6 = '';
                for (y = 0; y < zeroforTime; y++) {
                    st6 += '0';
                }
                st6 = st6 + totaltime;
                var st7 = ''
                for (x = 0; x < 61; x++) {
                    st7 += ' ';
                }
                var st8 = 'Z';
                var fileInput = `${st1}${st2}${st3}${st4}${st5}${st6}${st7}${st8}`;
                fs.appendFile(`./files/${filename}`,`${fileInput}\n`, function(){
                });
                
            }
        });
        connection.release();
    });
    
    
});

router.get('/download/:file(*)',(req, res) => {
    var file = req.params.file;
    // console.log(file);
    var fileLocation = path.join('./files',file);
    res.download(fileLocation, file); 
  });

  router.get('/remove/:file', (req, res) => {
    var file = req.params.file;
    // console.log("==============");
    // console.log(file);
    var fileLocation = path.join('./files',file);
    // console.log(fileLocation);
    var response = {
        success : 'File Destroyed',
        failure: 'There was a problem'
    }
    fs.unlink(fileLocation, function(error) {
        if (error) {
            res.end(JSON.stringify(response.failure)); 
        }
        res.end(JSON.stringify(response.success));
        console.log('Deleted File!!');
    });

  })
  

router.post('/timesheetsReceived', function(req, res){
    var data = req.body.dataToPost;
    var id = data[0];
    var shift_start = data[1];
    var shift_end = data[2];
    var processed = data[3];
    var response = {
        success : 'Timesheet processed',
        failure: 'There was a problem'
    }
    var sql = `UPDATE shifts SET shift_start = '${shift_start}', shift_end = '${shift_end}', time_sheets_processed = ${processed} where id = ?`;
    
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(sql ,id , function (error, result) {
            if (error) {
                // res.end(JSON.stringify(response.failure));    
                res.end(JSON.stringify(error));    
            }
            res.end(JSON.stringify(response.success));
        }); 
        connection.release();
    });  
});

router.delete('/deleteTimesheetsAllocated', function(req, res){
    var id = req.body.dataToDelete[0];
    // console.log(id);

    var response = {
        success : 'Timesheet Deleted',
        failure: 'There was a problem'
    }

    var sql = `DELETE FROM shifts WHERE (ID) = ?`;
    
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            resizeBy.send('Error with connection');
          }
          connection.query(sql,id, function (error, results, fields) {
            // if (error) throw error;
            if (error) {
                res.end(JSON.stringify(response.failure));    
            }
            res.end(JSON.stringify(response.success));
        });
        connection.release();
    });   
});



module.exports = router;