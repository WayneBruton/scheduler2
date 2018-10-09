var express = require('express');
var router = express.Router();
var connection = require('./connection');
var fs = require('fs');
var Report = require('fluentreports').Report;
var moment = require('moment');
var Json2csvParser = require('json2csv').Parser;

const  { authenticationMiddleware } = require('./middleware');

router.get('/reports',authenticationMiddleware(), function(req, res){
    var viewjs = '../public/js/reports.js';
    var viewcss = '../public/styles/reports.css';
    // var reportLocation
    res.render('reports', {viewjs: viewjs, viewcss: viewcss});
});


var reportData;
var interimData;
var myCSVData;
var reportLocation = process.env.DATABASE_REPORTS;



router.get('/reports/monthlybilling/:monthForSchedules', function(req,res){
    var monthInput = req.params.monthForSchedules;
    console.log(monthInput);
    // var filename = `${period}-${Date.now()}.txt`;
    var currentMonth = `${monthInput}-01`;
    currentMonth = moment(currentMonth).format('MMMM-YYYY');
    const sql = `select ct.client_type_description as ClientType,   client_id as ClientID, cl.last_name as ClientLastName, cl.first_name as ClientFirstName, shift_start as ShiftStart, shift_end as ShiftEnd, timediff(shift_end, shift_start) as ShiftLength, 
                    payrollCode, ca.employee_number as EmployeeNumber, ca.last_name as CarerLastName, ca.first_name as CarerFirstName
                    from shifts s
                    join clients cl on cl.id = s.client_id
                    join carers ca on ca.id = s.carer_id
                    join client_type ct on ct.id = cl.client_type
                    where shift_month = '${monthInput}' and time_sheets_processed = true
                    order by cl.last_name, cl.first_name, shift_start`;
    connection.query(sql, function(error, result){
        if (error) {
            console.log(error);
        }
        const data = result;
        console.log(data[0]);
        console.log(data.length);
        var host = req.hostname;
        var port = req.socket.localPort;
        var filename = `MonthlyBilling.csv`;
        var filepath = `./files/${filename}`;
        // var dataToSend = `${filename}~${host}~${port}`;
        var dataToSend = `${reportLocation}${filename}`;
        // var dataToSend = `${filename}`;
        myCSVData = []
        
        if (data.length === 0) {
            const billing = {
                'ClientType':'Nothing processed yet',
                'ClientID':'',
                'ClientLastName':'',
                'ClientFirstName':'',
                'ShiftStart':'', 
                'ShiftEnd':'', 
                'ShiftLength':'',
                'payrollCode':'', 
                'EmployeeNumber':'', 
                'CarerLastName':'',
                'CarerFirstName':'' 
            };
            myCSVData.push(billing);
        } else {
            for (i = 0; i < data.length; i++) {
            // for (i = 0; i < 3; i++) {
                const billing = {
                    'ClientType': `${data[i].ClientType}`,
                    'ClientID': `${data[i].ClientID}`,
                    'ClientLastName': `${data[i].ClientLastName}`,
                    'ClientFirstName':`${data[i].ClientFirstName}`,
                    'ShiftStart':`${moment(data[i].ShiftStart).format('YYYY-MM-DD HH:mm')}`, 
                    'ShiftEnd':`${moment(data[i].ShiftEnd).format('YYYY-MM-DD HH:mm')}`, 
                    'ShiftLength':`${data[i].ShiftLength}`,
                    'payrollCode':`${data[i].payrollCode}`, 
                    'EmployeeNumber':`${data[i].EmployeeNumber}`, 
                    'CarerLastName':`${data[i].CarerLastName}`,
                    'CarerFirstName':`${data[i].CarerFirstName}` 
                };
                myCSVData.push(billing);
            };
        };
        
        const fields = ['ClientType', 'ClientID', 'ClientLastName','ClientFirstName','ShiftStart', 'ShiftEnd', 'ShiftLength','payrollCode', 'EmployeeNumber', 'CarerLastName','CarerFirstName' ];
        const json2csvParser = new Json2csvParser({ fields });
        const csv = json2csvParser.parse(myCSVData);
        fs.writeFile(filepath, csv, function(err) {
        if (err) throw err;

        });

        res.send(dataToSend);
        console.log('Created File!!'); 
        
    })
});




function createMonthlySummary() {
    'use strict';
    var mydata = reportData;
    // console.log(mydata);
    var thisMonth = mydata[0].currentMonth;
    console.log(thisMonth);

    var header = function(rpt, data) {
        rpt.fontSize(9);
      rpt.print(new Date().toString('MM/dd/yyyy')); //, {y: 30, align: 'right'});
      // Report Title
      rpt.newline();
      rpt.fontBold();
      rpt.print(`Carer Wages: ${data.currentMonth}`, {fontBold: true, fontSize: 16, align: 'center', underline: true});
      rpt.newline();
      rpt.newline();
    // Detail Header
        rpt.fontsize(9);
        rpt.fontBold();
        rpt.band([
        {data: 'Client Type.', width: 90, align: 2, textColor: 'black', underline: true},
        {data: 'Clients.', width: 90, align: 2, underline: true},
        {data: 'Hours Billed', width: 100, align: 3, underline: true},
        {data: 'Cost in Wages', width: 110, align: 3, underline: true},
        {data: 'Est Income', width: 110, align: 3, underline: true},
        {data: 'Gross Income', width: 110, align: 3, underline: true}


        ]);
        rpt.fontNormal();
        rpt.fontsize(9);
        rpt.newline();
        rpt.bandLine()
        rpt.newline();
    };
    var detail = function(rpt, data) {


        data.wages = ((parseInt((data.wages) * 100)) / 100).toFixed(2);
        data.income = ((parseInt((data.income) * 100)) / 100).toFixed(2);
        data.net = ((parseInt((data.net) * 100)) / 100).toFixed(2);

        rpt.newline();
    // Detail Body
      rpt.band([
                  
       {data: `${data.clientType}`, width: 90, align: 2},
       {data: `${data.clientsThisMonth}`, width: 90, align: 2},
       {data: `${data.hoursThisMonth}`, width: 100, align: 3},
       {data: `${data.wages}`, width: 110, align: 3},
       {data: `${data.income}`, width: 110, align: 3},
       {data: `${data.net}`, width: 110, align: 3}
    //    {data: `${data.net}`, width: 110, align: 3}
      ]);

    //   data.net = (data.net).toFixed(2);
    //   ], {border: 1, width: 0, wrap:2});
  };

  var finalSummary = function(rpt, data) {
    rpt.newline();
    rpt.standardFooter([
        ['clientType', 1, 2],
        ['clientsThisMonth', 2, 2],
        ['hoursThisMonth', 3, 3],
        ['wages', 4, 3],
        ['income', 5, 3],
        ['net', 6, 3]
    ]);

    rpt.newline();
    rpt.newline();
    rpt.print('Thank You for Choosing Eccentric Toad!', {align: 'left'});      
  };

  var totalFormatter = function(data, callback) {
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if (key === 'clientType') { continue; }
            // Simple Stupid Money formatter.  It is fairly dumb.  ;-)
            var money = (data[key].toFixed(2)).toString();
            // console.log('This is money', money);
            var idx = money.indexOf('.');
            // console.log('THIS IS IDX',idx);
            if (idx === -1) {
                money += ".00";
            } else if (idx === money.length-2) {
                money += "0";
            }
            for (var i=6;i<money.length;i+=4) {
                money = money.substring(0,money.length-i) + "," + money.substring(money.length-i);
            }

            // data[key] = '$ '+money;
            data[key] = ' '+money;
            // console.log('This is money', money);

        }
    }

    callback(null, data);
};

  

    var rptName =  "files/MonthlySummary.pdf";
  
    var resultReport = new Report(rptName, {landscape: true, paper: 'A4', autoPrint: false})
        .data(mydata) 
        .totalFormatter(totalFormatter);



    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
        // .groupBy('employeeNumber')
        .groupBy('currentMonth')
        .sum('clientsThisMonth')
        .sum('hoursThisMonth')
        .sum('wages')
        .sum('income')
        .sum('net')
        // .count('employeeNumber')
        .detail(detail)
        .footer(finalSummary)
        .header(header, {pageBreakBefore: true});
  
    console.time("Rendered");
    resultReport.render(function(err, name) {
        console.timeEnd("Rendered");
    });

};



router.get('/reports/monthlysummary/:monthForSchedules', function(req,res){
    var monthInput = req.params.monthForSchedules;
    console.log(monthInput);
    var currentMonth = `${monthInput}-01`;
    currentMonth = moment(currentMonth).format('MMMM-YYYY');
    console.log(currentMonth);
    reportData = [];
    interimData = [];
 
    // ${monthInput}                   
    var sql = `select  ct.client_type_description as clientType,count(distinct client_id) clientsThisMonth, sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) as hoursThisMonth
                from shifts
                join clients cl on cl.id = client_id
                join client_type ct on cl.client_type = ct.id
                where shift_month = '${monthInput}'
                group by ct.client_type_description`;

    var sql2 = `select  distinct ca.employee_number as employeeNumber, ca.last_name as caLastName, ca.first_name as caFirstName,payrollCode, ca.rate_per_hour, ct.client_type_description as clientType, sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) as totalHours
                from shifts
                join carers ca on shifts.carer_id = ca.id
                join clients cl on shifts.client_id = cl.id
                join client_type ct on cl.client_type = ct.id
                where shift_month = '${monthInput}'
                group by  carer_id, ca.last_name, ca.first_name, payrollCode, cl.client_type
                order by ca.employee_number`;

    var combineSQL = `${sql2};${sql}`

    connection.query(combineSQL, function(error, result){
        if (error) throw error;
        // res.send(result);
        var data = result[0];
        var data2 = result[1]
        // console.log(data2);
        // console.log(data2.length);
        if (data.length === 0) {
            var reportObject = {
                currentMonth: currentMonth,
                clientType: '',
                wages: '',
                income:''
            }
            reportData.push(reportObject);
        } else {
            for (i = 0; i < data.length; i++) {
                var wages = 0;
                var income = 0;
                if (data[i].payrollCode === '100' || data[i].payrollCode === '200' || data[i].payrollCode === '300' || data[i].payrollCode === '400' || data[i].payrollCode === '500') {
                    wages = data[i].totalHours * data[i].rate_per_hour;
                    income = data[i].totalHours * 35.88;
                } else if (data[i].payrollCode === '101' || data[i].payrollCode === '202' || data[i].payrollCode === '303' || data[i].payrollCode === '404' || data[i].payrollCode === '505') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 1.1;
                    income = data[i].totalHours * 35.88 * 1.1;
                } else if (data[i].payrollCode === '201') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 1.5;
                    income = data[i].totalHours * 35.88 * 2;
                } else if (data[i].payrollCode === '203') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 1.5 * 1.1;
                    income = data[i].totalHours * 35.88 * 2 * 1.1;
                } else if (data[i].payrollCode === '800') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 2;
                    income = data[i].totalHours * 35.88 * 2;
                } else if (data[i].payrollCode === '801') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 2 * 1.1;
                    income = data[i].totalHours * 35.88 * 2 * 1.1;
                }
                wages = wages.toFixed(2);
                wages = parseFloat(wages);
                income = income.toFixed(2);
                income = parseFloat(income);

                var reportObject = {
                    currentMonth: currentMonth,
                    clientType: data[i].clientType,
                    wages: wages,
                    income: income
                    }
                interimData.push(reportObject);
            }
            // const res = interimData.reduce((acc, obj) => {
            interimData = interimData.reduce((acc, obj) => {
                const index = acc.findIndex(item => item.clientType === obj.clientType);
                if(index > -1) {
                    // console.log(acc[index])
                    acc[index] = {...acc[index], wages: acc[index].wages + obj.wages, income: acc[index].income + obj.income} ;
                } else {
                    acc = acc.concat([obj]);
                }
                return acc;
           }, []); 
        }

        if (data2.length === 0) {
            reportData = [];
            var reportObject = {
                currentMonth: currentMonth,
                clientType: 'No Details',
                clientsThisMonth: '',
                hoursThisMonth:'',
                wages: '',
                income: '',
                net:''
            }
            reportData.push(reportObject);
        } else {
            for (i = 0; i < data2.length; i++) {
                reportObject = {
                    currentMonth: currentMonth,
                    clientType: data2[i].clientType,
                    clientsThisMonth: data2[i].clientsThisMonth,
                    hoursThisMonth: data2[i].hoursThisMonth,
                    wages: '',
                    income:'',
                    net:''
                }
                reportData.push(reportObject);
            }
        }

        for (i = 0; i < reportData.length; i++) {
            for (a = 0; a < interimData.length; a++) {
                if (reportData[i].clientType === interimData[a].clientType) {
                    reportData[i].wages = interimData[a].wages;
                    reportData[i].income = interimData[a].income;
                }
                
            }
            if (reportData[i].clientType === 'AIB') {
                reportData[i].income = 44.35 * reportData[i].hoursThisMonth;
            }
            if (reportData[i].clientType === 'CCP-12') {
                reportData[i].income = reportData[i].hoursThisMonth / 12 * 513.85;
            }
            if (reportData[i].clientType === 'Package') {
                reportData[i].income = reportData[i].clientsThisMonth * 27667.48;
            }
            reportData[i].net = reportData[i].income - reportData[i].wages
        }

        // console.log(data2)
        res.contentType('application/pdf');
        createMonthlySummary();
        var host = req.hostname;
        var port = req.socket.localPort;
        var filename = `MonthlySummary.pdf`;
        // var dataToSend = `${filename}-${host}-${port}`     
        var dataToSend = `${reportLocation}${filename}`     
        res.send(dataToSend);
        console.log('Created File!!'); 
        console.log('Report data - DONE:', reportData);
        // console.log(reportData.length);
        // console.log(interimData);
        // console.log(add(4, 7));
    })
});


function createCarerWages() {
    'use strict';
    var mydata = reportData;

    var thisMonth = mydata[0].currentMonth;
    console.log(thisMonth);

    var header = function(rpt, data) {
        rpt.fontSize(9);
      rpt.print(new Date().toString('MM/dd/yyyy')); //, {y: 30, align: 'right'});
      // Report Title
      rpt.newline();
      rpt.fontBold();
      rpt.print(`Carer Wages: ${data.currentMonth}`, {fontBold: true, fontSize: 16, align: 'center', underline: true});
      rpt.newline();
      rpt.newline();
    // Detail Header
        rpt.fontsize(9);
        rpt.fontBold();
        rpt.band([
        {data: 'Staff No.', width: 90, align: 2, textColor: 'black', underline: true},
        {data: 'Staff Member Name.', width: 110, align: 2, underline: true},
        {data: 'Rate.', width: 50, align: 2, underline: true},
        {data: 'Client Type.', width: 110, align: 2, underline: true},
        {data: 'Hours.', width: 50, align: 2, underline: true},
        {data: 'Wage.', width: 110, align: 2, underline: true}
        ]);
        rpt.fontNormal();
        rpt.fontsize(9);
        rpt.newline();
        rpt.bandLine()
        rpt.newline();
    };
    var detail = function(rpt, data) {
        data.wages = (data.wages).toFixed(2);
        // var counter = 0;  
        rpt.newline();
    // Detail Body
      rpt.band([
                  
       {data: `${data.employeeNumber}`, width: 90, align: 2},
       {data: `${data.caLastName} ${data.caFirstName}`, width: 110, align: 2},
       {data: `${data.rate_per_hour}`, width: 50, align: 2},
       {data: `${data.clientType}`, width: 110, align: 2},
       {data: `${data.totalHours}`, width: 50, align: 2},
       {data: `${data.wages}`, width: 110, align: 3}
      ]);
    //   ], {border: 1, width: 0, wrap:2});
  };

  var finalSummary = function(rpt, data) {
    rpt.newline();
    rpt.standardFooter([
        ['employeeNumber', 1, 2],
        ['totalHours', 5, 2],
        ['wages', 6, 3]
    ]);
    rpt.newline();
    rpt.newline();
    rpt.print('Thank You for Eccentric Toad!', {align: 'left'});      
  };

  var totalFormatter = function(data, callback) {
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if (key === 'employeeNumber') { continue; }
            // Simple Stupid Money formatter.  It is fairly dumb.  ;-)
            var money = data[key].toString();
            var idx = money.indexOf('.');
            if (idx === -1) {
                money += ".00";
            } else if (idx === money.length-2) {
                money += "0";
            }
            for (var i=6;i<money.length;i+=4) {
                money = money.substring(0,money.length-i) + "," + money.substring(money.length-i);
            }

            // data[key] = '$ '+money;
            data[key] = ' '+money;

        }
    }

    callback(null, data);
};

  

    var rptName =  "files/CarerWages.pdf";
  
    var resultReport = new Report(rptName, {landscape: false, paper: 'A4', autoPrint: false})
        .data(mydata) 
        .totalFormatter(totalFormatter);



    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
        // .groupBy('employeeNumber')
        .groupBy('currentMonth')
        .sum('totalHours')
        .sum('wages')
        .count('employeeNumber')
        .detail(detail)
        .footer(finalSummary)
        .header(header, {pageBreakBefore: true});
  
    console.time("Rendered");
    resultReport.render(function(err, name) {
        console.timeEnd("Rendered");
    });

};

router.get('/reports/monthlywages/:monthForSchedules', function(req,res){
    var monthInput = req.params.monthForSchedules;
    console.log(monthInput);
    var currentMonth = `${monthInput}-01`;
    currentMonth = moment(currentMonth).format('MMMM-YYYY');
    console.log(currentMonth);
    reportData = [];
    interimData = [];
 
                        
    var sql = `select  distinct ca.employee_number as employeeNumber, ca.last_name as caLastName, ca.first_name as caFirstName,payrollCode, ca.rate_per_hour, ct.client_type_description as clientType, sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) as totalHours
                from shifts
                join carers ca on shifts.carer_id = ca.id
                join clients cl on shifts.client_id = cl.id
                join client_type ct on cl.client_type = ct.id
                where shift_month = '${monthInput}'
                group by  carer_id, ca.last_name, ca.first_name, payrollCode, cl.client_type
                order by ca.employee_number`;

    connection.query(sql, function(error, result){
        if (error) throw error;
        // res.send(result);
        var data = result;
        // console.log(data);
        if (data.length === 0) {
            var reportObject = {
                currentMonth: currentMonth,
                employeeNumber: 'No Wages',
                caLastName: '',
                caFirstName: '',
                payrollCode: '',
                rate_per_hour: '',
                clientType: '',
                totalHours: '',
                wages: ''
            }
            reportData.push(reportObject);
        } else {
            for (i = 0; i < data.length; i++) {
                var wages = 0;
                if (data[i].payrollCode === '100' || data[i].payrollCode === '200' || data[i].payrollCode === '300' || data[i].payrollCode === '400' || data[i].payrollCode === '500') {
                    wages = data[i].totalHours * data[i].rate_per_hour;
                } else if (data[i].payrollCode === '101' || data[i].payrollCode === '202' || data[i].payrollCode === '303' || data[i].payrollCode === '404' || data[i].payrollCode === '505') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 1.1;
                } else if (data[i].payrollCode === '201') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 1.5;
                } else if (data[i].payrollCode === '203') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 1.5 * 1.1;
                } else if (data[i].payrollCode === '800') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 2;
                } else if (data[i].payrollCode === '801') {
                    wages = data[i].totalHours * data[i].rate_per_hour * 2 * 1.1;
                }
                wages = wages.toFixed(2);
                wages = parseFloat(wages);
                var reportObject = {
                    currentMonth: currentMonth,
                    employeeNumber: data[i].employeeNumber,
                    caLastName: data[i].caLastName,
                    caFirstName: data[i].caFirstName,
                    payrollCode: data[i].payrollCode,
                    rate_per_hour: data[i].rate_per_hour,
                    clientType: data[i].clientType,
                    totalHours: data[i].totalHours,
                    wages: wages
                    }
                interimData.push(reportObject);
            }
            // const res = interimData.reduce((acc, obj) => {
            reportData = interimData.reduce((acc, obj) => {
                const index = acc.findIndex(item => item.employeeNumber === obj.employeeNumber);
                if(index > -1) {
                    // console.log(acc[index])
                    acc[index] = {...acc[index], totalHours: acc[index].totalHours + obj.totalHours, wages: acc[index].wages + obj.wages};
                } else {
                    acc = acc.concat([obj]);
                }
                return acc;
           }, []);  


    //        const res = interimData.reduce((acc, obj) => {
    //         const index = acc.findIndex(item => item.clientType === obj.clientType);
    //         if(index > -1) {
    //             // console.log(acc[index])
    //             acc[index] = {...acc[index], totalHours: acc[index].totalHours + obj.totalHours, wages: acc[index].wages + obj.wages};
    //         } else {
    //             acc = acc.concat([obj]);
    //         }
    //         return acc;
    //    }, []); 
    //    console.log(res);

       
        }

        res.contentType('application/pdf');
        createCarerWages();
        var host = req.hostname;
        var port = req.socket.localPort;
        var filename = `CarerWages.pdf`;
        // var dataToSend = `${filename}-${host}-${port}`     
        var dataToSend = `${reportLocation}${filename}`
        console.log(dataToSend);     
        res.send(dataToSend);
        console.log('Created File!!'); 
        console.log('Report data - DONE:', reportData);
        console.log(reportData.length);
        // console.log(res);
    })
});

function createExcessiveHours() {
    'use strict';
    var mydata = reportData;

    var thisMonth = mydata[0].currentMonth;
    console.log(thisMonth);

    var header = function(rpt, data) {
        rpt.fontSize(9);
      rpt.print(new Date().toString('MM/dd/yyyy')); //, {y: 30, align: 'right'});
      // Report Title
      rpt.newline();
      rpt.fontBold();
      rpt.print(`Shifts longer than 12 hours: ${data.currentMonth}`, {fontBold: true, fontSize: 16, align: 'center', underline: true});
      rpt.newline();
      rpt.newline();
    // Detail Header
        rpt.fontsize(9);
        rpt.fontBold();
        rpt.band([
        {data: 'Staff No.', width: 110, align: 2, textColor: 'black', underline: true},
        {data: 'Staff Member Name', width: 110, align: 2, underline: true},
        {data: 'Total Time', width: 110, align: 2, underline: true}
        ]);
        rpt.fontNormal();
        rpt.fontsize(9);
    };
    var detail = function(rpt, data) {
        // var counter = 0;  
        rpt.newline();
    // Detail Body
      rpt.band([
                  
       {data: `${data.employeeNumber}`, width: 110, align: 2},
       {data: `${data.caLastName} ${data.caFirstName}`, width: 110, align: 2},
       {data: `${data.duration}`, width: 110, align: 2}
      ]);
    //   ], {border: 1, width: 0, wrap:2});
  };

    var rptName =  "files/Excessivehours.pdf";
  
    var resultReport = new Report(rptName, {landscape: false, paper: 'A4', autoPrint: false})
        .data(mydata) 
    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
        // .groupBy('employeeNumber')
        .groupBy('currentMonth')
        .detail(detail)
        .header(header, {pageBreakBefore: true});
  
    console.time("Rendered");
    resultReport.render(function(err, name) {
        console.timeEnd("Rendered");
    });

};

router.get('/reports/excessivehours/:monthForSchedules', function(req,res){
    var monthInput = req.params.monthForSchedules;
    console.log(monthInput);
    var currentMonth = `${monthInput}-01`;
    currentMonth = moment(currentMonth).format('MMMM-YYYY');
    console.log(currentMonth);
    reportData = [];
    
    var sql = `select  carer_id, carers.employee_number as employeeNumber , carers.last_name as caLastName, carers.first_name as caFirstName,
                sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) as totalTime
                from shifts
                join carers on carers.id = carer_id
                where shift_month = '${monthInput}'
                group by  carer_id
                having sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) > 195
                order by carers.employee_number`;

    connection.query(sql, function(error, result){
        if (error) throw error;
        // res.send(result);
        var data = result;
        // console.log(data);
        if (data.length === 0) {
            var reportObject = {
                currentMonth: currentMonth,
                employeeNumber: '',
                caLastName: '',
                caFirstName: '',
                totalTime: ''
            }
            reportData.push(reportObject);
        } else {
            for (i = 0; i < data.length; i++) {
                var reportObject = {
                    currentMonth: currentMonth,
                    employeeNumber: data[i].employeeNumber,
                    caLastName: data[i].caLastName,
                    caFirstName: data[i].caFirstName,
                    duration: data[i].totalTime
                    }
                reportData.push(reportObject);
            }
        }
        
        res.contentType('application/pdf');
        createExcessiveHours();
        var host = req.hostname;
        var port = req.socket.localPort;
        var filename = `Excessivehours.pdf`;
        // var dataToSend = `${filename}-${host}-${port}`     
        var dataToSend = `${reportLocation}${filename}`     
        res.send(dataToSend);
        console.log('Created File!!'); 
        console.log(reportData);
    })
});



function createLongerThan12HourShifts() {
    'use strict';
    var mydata = reportData;

    var thisMonth = mydata[0].currentMonth;
    console.log(thisMonth);

    var header = function(rpt, data) {
        rpt.fontSize(9);
      rpt.print(new Date().toString('MM/dd/yyyy')); //, {y: 30, align: 'right'});
      // Report Title
      rpt.newline();
      rpt.fontBold();
      rpt.print(`Shifts londer than 12 hours: ${data.currentMonth}`, {fontBold: true, fontSize: 16, align: 'center', underline: true});
      rpt.newline();
      rpt.newline();
    // Detail Header
        rpt.fontsize(9);
        rpt.fontBold();
        rpt.band([
        {data: 'Start', width: 110, align: 2, textColor: 'black', underline: true},
        {data: 'End', width: 110, align: 2, underline: true},
        {data: 'Duration (HH;mm)', width: 110, align: 2, underline: true},
        {data: 'Client', width: 110, align: 2, underline: true},
        // {data: 'Client: Name', width: 110, align: 2, underline: true},
        {data: 'Staff', width: 110, align: 2, underline: true}
        // {data: 'Staff: Name', width: 110, align: 2, underline: true}

        ]);
        rpt.fontNormal();
        rpt.fontsize(9);
    };
    var detail = function(rpt, data) {
        // var counter = 0;  
        rpt.newline();
    // Detail Body
      rpt.band([
                  
       {data: `${data.shiftStart}`, width: 110, align: 2},
       {data: `${data.shiftEnd}`, width: 110, align: 2},
       {data: `${data.duration}`, width: 110, align: 2},
       {data: `${data.clientID}:${data.clLastName} ${data.clFirstName}`, align: 2, width: 110},
    //    {data: `${data.clLastName} ${data.clFirstName}`, width: 110, align: 2},
       {data: `${data.employeeNumber}:${data.caLastName} ${data.caFirstName}`, width: 110, align: 2}
    //    {data: `${data.caLastName} ${data.caFirstName}`, width: 110, align: 2}
      ]);
    //   ], {border: 1, width: 0, wrap:2});
  };

    var rptName =  "files/Longerthan12hourshifts.pdf";
  
    var resultReport = new Report(rptName, {landscape: false, paper: 'A4', autoPrint: false})
        .data(mydata) 
    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
        .groupBy('employeeNumber')
        // .groupBy('currentMonth')
        .detail(detail)
        .header(header, {pageBreakBefore: true});
  
    console.time("Rendered");
    resultReport.render(function(err, name) {
        console.timeEnd("Rendered");
    });

};


router.get('/reports/longerthan12hourshifts/:monthForSchedules', function(req,res){
    var monthInput = req.params.monthForSchedules;
    console.log(monthInput);
    var currentMonth = `${monthInput}-01`;
    currentMonth = moment(currentMonth).format('MMMM-YYYY');
    console.log(currentMonth);
    reportData = [];
    var sql = `select carers.employee_number as employeeNumber , carers.last_name as caLastName, carers.first_name as caFirstName, clients.id as clientID, clients.last_name as clLastName, clients.first_name as clFirstName, 
    shift_start as shiftStart, shift_end as shiftEnd ,time_format(timediff(shift_end,shift_start),'%H:%i') as duration,
    time_to_sec(timediff(shift_end, shift_start )) / 3600 as duration2
     from shifts
     inner join carers on carers.id = carer_id
     inner join clients on clients.id = client_id
    where shift_month = '${monthInput}' and ((time_to_sec(timediff(shift_end, shift_start )) / 3600) > 12)`;

    connection.query(sql, function(error, result){
        if (error) throw error;
        // res.send(result);
        var data = result;
        // console.log(data);
        if (data.length === 0) {
            var reportObject = {
                currentMonth: currentMonth,
                shiftStart: 'No shifts over 12 hours',
                shiftEnd:'',
                clientID: '',
                clLastName: '',
                clFirstName: '',
                employeeNumber: '',
                caLastName: '',
                caFirstName: '',
                duration: ''
            }
            reportData.push(reportObject);
        } else {
            for (i = 0; i < data.length; i++) {
                var reportObject = {
                    currentMonth: currentMonth,
                    shiftStart: moment(data[i].shiftStart).format('YYYY-MM-DD HH:mm'),
                    shiftEnd:moment(data[i].shiftEnd).format('YYYY-MM-DD HH:mm'),
                    clientID: data[i].clientID,
                    clLastName: data[i].clLastName,
                    clFirstName: data[i].clFirstName,
                    employeeNumber: data[i].employeeNumber,
                    caLastName: data[i].caLastName,
                    caFirstName: data[i].caFirstName,
                    duration: data[i].duration
                    }
                reportData.push(reportObject);
            }
        }
        
        res.contentType('application/pdf');
        createLongerThan12HourShifts();
        var host = req.hostname;
        var port = req.socket.localPort;
        var filename = `Longerthan12hourshifts.pdf`;
        // var dataToSend = `${filename}-${host}-${port}`     
        var dataToSend = `${reportLocation}${filename}`     
        res.send(dataToSend);
        console.log('Created File!!'); 
        console.log(reportData);
    })
});


function createOverlappingShifts() {
    'use strict';
    var mydata = reportData;

    var thisMonth = mydata[0].currentMonth;
    console.log(thisMonth);

    var header = function(rpt, data) {
        rpt.fontSize(9);
      rpt.print(new Date().toString('MM/dd/yyyy')); //, {y: 30, align: 'right'});
      // Report Title
      rpt.newline();
      rpt.fontBold();
      rpt.print(`Shifts that overlap : ${data.currentMonth}`, {fontBold: true, fontSize: 16, align: 'center', underline: true});
      rpt.newline();
      rpt.newline();
    // Detail Header
        rpt.fontsize(9);
        rpt.fontBold();
        rpt.band([
        {data: 'Start', width: 110, align: 2, textColor: 'black', underline: true},
        {data: 'End', width: 110, align: 2, underline: true},
        {data: 'Client ID', width: 110, align: 2, underline: true},
        {data: 'Client: Name', width: 110, align: 2, underline: true},
        {data: 'Staff No', width: 110, align: 2, underline: true},
        {data: 'Staff: Name', width: 110, align: 2, underline: true}

        ]);
        rpt.fontNormal();
        rpt.fontsize(9);
    };
    var detail = function(rpt, data) {


        // var counter = 0;  
        rpt.newline();
    // Detail Body
      rpt.band([
                  
       {data: `${data.shiftStart}`, width: 110, align: 2},
       {data: `${data.shiftEnd}`, width: 110, align: 2},
       {data: `${data.clientID}`, align: 2, width: 110},
       {data: `${data.clLastName} ${data.clFirstName}`, width: 110, align: 2},
       {data: `${data.employeeNumber}`, width: 110, align: 2},
       {data: `${data.caLastName} ${data.caFirstName}`, width: 110, align: 2}
      ]);
    //   ], {border: 1, width: 0, wrap:2});
  };

    var rptName =  "files/Overlappingshifts.pdf";
  
    var resultReport = new Report(rptName, {landscape: true, paper: 'A4', autoPrint: false})
        .data(mydata) 
    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
        .groupBy('currentMonth')
        .detail(detail)
        .header(header, {pageBreakBefore: true})
    ;
  
    console.time("Rendered");
    resultReport.render(function(err, name) {
        console.timeEnd("Rendered");
    });

};



router.get('/reports/overlappingshifts/:monthForSchedules', function(req,res){
    var monthInput = req.params.monthForSchedules;
    console.log(monthInput);
    var currentMonth = `${monthInput}-01`;
    currentMonth = moment(currentMonth).format('MMMM-YYYY');
    console.log(currentMonth);
    reportData = [];
    var sql = `select cl.last_name as clLastName, cl.first_name as clFirstName,cl.id as clientID, ca.last_name as caLastName, ca.first_name as caFirstName ,ca.employee_number as employeeNumber,  a.shift_start as shiftStart, a.shift_end as shiftEnd from shifts a 
    inner join shifts b on a.client_id = b.client_id 
       and a.shift_end > b.shift_start and a.shift_start < b.shift_end
       and a.shift_start < b.shift_start
    join clients  cl on a.client_id = cl.id
    join carers  ca on a.carer_id = ca.id
    where a.shift_month = '${monthInput}' and b.shift_month = '${monthInput}'`;

    connection.query(sql, function(error, result){
        if (error) throw error;
        // res.send(result);
        var data = result;
        // console.log(data);
        if (data.length === 0) {
            var reportObject = {
                currentMonth: currentMonth,
                shiftStart: 'No overlapping shifts',
                shiftEnd:'',
                clientID: '',
                clLastName: '',
                clFirstName: '',
                employeeNumber: '',
                caLastName: '',
                caFirstName: ''
            }
            reportData.push(reportObject);
        } else {
            for (i = 0; i < data.length; i++) {
                var reportObject = {
                    currentMonth: currentMonth,
                shiftStart: moment(data[i].shiftStart).format('YYYY-MM-DD HH:mm'),
                shiftEnd:moment(data[i].shiftEnd).format('YYYY-MM-DD HH:mm'),
                clientID: data[i].clientID,
                clLastName: data[i].clLastName,
                clFirstName: data[i].clFirstName,
                employeeNumber: data[i].employeeNumber,
                caLastName: data[i].caLastName,
                caFirstName: data[i].caFirstName
                }
                reportData.push(reportObject);
            }
        }
        
        res.contentType('application/pdf');
        createOverlappingShifts();
        var host = req.hostname;
        var port = req.socket.localPort;
        var filename = `Overlappingshifts.pdf`;
        // var dataToSend = `${filename}-${host}-${port}`     
        var dataToSend = `${reportLocation}${filename}`     
        res.send(dataToSend);
        console.log('Created File!!'); 
        console.log(reportData);


    })
});

function createShiftDaysLongerThan24Hours() {
    'use strict';
    var mydata = reportData;

    var thisMonth = mydata[0].currentMonth;
    console.log(thisMonth);

    var header = function(rpt, data) {
        rpt.fontSize(9);
      rpt.print(new Date().toString('MM/dd/yyyy')); //, {y: 30, align: 'right'});
      // Report Title
      rpt.newline();
      rpt.fontBold();
      rpt.print(`Shifts exceeding 24 hours in a day : ${data.currentMonth}`, {fontBold: true, fontSize: 16, align: 'center', underline: true});
      rpt.newline();
      rpt.newline();
    // Detail Header
        rpt.fontsize(9);
        rpt.fontBold();
        rpt.band([
        {data: 'Shift Date', width: 110, align: 2, textColor: 'black', underline: true},
        {data: 'Total Time', width: 110, align: 2, underline: true},
        {data: 'Client ID', width: 110, align: 2, underline: true},
        {data: 'Client: Last Name', width: 110, align: 2, underline: true},
        {data: 'Client: First Name', width: 110, align: 2, underline: true}

        ]);
        rpt.fontNormal();
        rpt.fontsize(9);
    };
    var detail = function(rpt, data) {
        // var counter = 0;  
        rpt.newline();
    // Detail Body
      rpt.band([
                  
       {data: `${data.shiftDate}`, width: 110, align: 2},
       {data: `${data.totalTime}`, width: 110, align: 2},
       {data: `${data.client_id}`, align: 2, width: 110},
       {data: `${data.clLastName}`, width: 110, align: 2},
       {data: `${data.clFirstName}`, width: 110, align: 2}
      ]);
    //   ], {border: 1, width: 0, wrap:2});
  };

    var rptName =  "files/Shiftdayslongerthan24hrs.pdf";
  
    var resultReport = new Report(rptName, {landscape: false, paper: 'A4', autoPrint: false})
        .data(mydata) 
    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
        .groupBy('currentMonth')
        .detail(detail)
        .header(header, {pageBreakBefore: true})
    ;
  
    console.time("Rendered");
    resultReport.render(function(err, name) {
        console.timeEnd("Rendered");
    });

};


router.get('/reports/printmorethan24hrs/:monthForSchedules', function(req,res){
    var monthInput = req.params.monthForSchedules;
    console.log(monthInput);
    var currentMonth = `${monthInput}-01`;
    currentMonth = moment(currentMonth).format('MMMM-YYYY');
    console.log(currentMonth);
    reportData = [];
    var sql = `select  client_id, clients.last_name, clients.first_name, date(shift_start) as shiftDate ,
    sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) as totalTime from shifts
    join clients on shifts.client_id = clients.id
    where shift_month = '${monthInput}'
    group by  date(shift_start),client_id
    having sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) > 24`;

    connection.query(sql, function(error, result){
        if (error) throw error;
        // res.send(result);
        var data = result;
        console.log(data);
        if (data.length === 0) {
            var reportObject = {
                currentMonth: currentMonth,
                shiftDate: 'No Extra Billing This Month',
                totalTime:'',
                client_id: '',
                clLastName: '',
                clFirstName: ''
            }
            reportData.push(reportObject);
        } else {
            for (i = 0; i < data.length; i++) {
                var reportObject = {
                    currentMonth: currentMonth,
                    shiftDate: moment(data[i].shiftDate).format('YYYY-MM-DD'),
                    totalTime:data[i].totalTime,
                    client_id: data[i].client_id,
                    clLastName: data[i].last_name,
                    clFirstName: data[i].first_name
                }
                reportData.push(reportObject);
            }

        }
        
        res.contentType('application/pdf');
        createShiftDaysLongerThan24Hours();
        var host = req.hostname;
        var port = req.socket.localPort;
        var filename = `Shiftdayslongerthan24hrs.pdf`;
        // var dataToSend = `${filename}-${host}-${port}`     
        var dataToSend = `${reportLocation}${filename}`     
        res.send(dataToSend);
        console.log('Created File!!'); 
        console.log(reportData);


    })
});




router.get('/reports/duplicateShifts/:monthForSchedules', function(req,res){
    var monthInput = req.params.monthForSchedules;
    console.log(monthInput);
    var currentMonth = `${monthInput}-01`;
    currentMonth = moment(currentMonth).format('MMMM-YYYY');
    console.log(currentMonth);
    reportData = [];
    var sql = `SELECT 
    carers.employee_number as employeeNumber,carers.last_name as caLastName,carers.first_name as caFirstName, COUNT(carer_id),
    date(shift_start) as shiftDate, count(date(shift_start)) as duplicates
     
FROM
    shifts
    inner join clients on clients.id = client_id
    inner join carers on carers.id = carer_id
    where shift_month = '${monthInput}'
    
GROUP BY 
    carer_id, date(shift_start)
HAVING 
       (COUNT(carer_id) > 1) AND 
       (COUNT(date(shift_start)) > 1)`;

    connection.query(sql, function(error, result){
        if (error) throw error;
        // res.send(result);
        var data = result;
        // console.log(data);
        if (data.length === 0) {
            var reportObject = {
                currentMonth: currentMonth,
                shiftDate: 'No Duplicates thus far',
                employeeNumber:'',
                caLastName: '',
                caFirstName: '' ,
                shiftCount:''     
            }
            reportData.push(reportObject);

        } else {
            for (i = 0; i < data.length; i++) {
                var reportObject = {
                    currentMonth: currentMonth,
                    shiftDate: moment(data[i].shiftDate).format('YYYY-MM-DD'),
                    employeeNumber:data[i].employeeNumber,
                    caLastName: data[i].caLastName,
                    caFirstName: data[i].caFirstName,
                    shiftCount: data[i].duplicates
                }
                reportData.push(reportObject);
            }

        }
   
        res.contentType('application/pdf');
        createDuplicateFile();
        // var host = req.hostname;
        // var port = req.socket.localPort;
        var filename = `DuplicateShifts.pdf`;
        // var dataToSend = `${filename}-${host}-${port}`     
        var dataToSend = `${reportLocation}${filename}`     
        res.send(dataToSend);
        console.log('Created File!!'); 
        console.log(reportData);


    })
});

function createDuplicateFile() {
    'use strict';
    var mydata = reportData;

    var thisMonth = mydata[0].currentMonth;
    console.log(thisMonth);

    var header = function(rpt, data) {
        rpt.fontSize(9);
      rpt.print(new Date().toString('MM/dd/yyyy')); //, {y: 30, align: 'right'});
      // Report Title
      rpt.newline();
      rpt.fontBold();
      rpt.print(`Duplicate Shifts : ${data.currentMonth}`, {fontBold: true, fontSize: 16, align: 'center', underline: true});
      rpt.newline();
      rpt.newline();
    // Detail Header
        rpt.fontsize(9);
        rpt.fontBold();
        rpt.band([
        {data: 'Shift Date', width: 110, align: 2, textColor: 'black', underline: true},
        {data: 'Employee Number', width: 110, align: 2, underline: true},
        {data: 'Employee: Last Name', width: 110, align: 2, underline: true},
        {data: 'Employee: First Name', align: 2, width: 110, underline: true},
        {data: 'Duplicates', align: 2, width: 110, underline: true}

        ]);
        rpt.fontNormal();
        rpt.fontsize(9);
    };
    var detail = function(rpt, data) {
        // var counter = 0;  
        rpt.newline();
    // Detail Body
      rpt.band([
                  
       {data: `${data.shiftDate}`, width: 110, align: 2},
       {data: `${data.employeeNumber}`, width: 110, align: 2},
       {data: `${data.caLastName}`, align: 2, width: 110},
       {data: `${data.caFirstName}`, width: 110, align: 2},
       {data: `${data.shiftCount}`, width: 110, align: 2}
      ]);
    //   ], {border: 1, width: 0, wrap:2});
  };

    var rptName =  "files/DuplicateShifts.pdf";
  
    var resultReport = new Report(rptName, {landscape: true, paper: 'A4', autoPrint: false})
        .data(mydata) 
    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
        .groupBy('currentMonth')
        .detail(detail)
        .header(header, {pageBreakBefore: true})
    ;
  
    console.time("Rendered");
    resultReport.render(function(err, name) {
        console.timeEnd("Rendered");
    });

};

// var data;
function createCarerFile() {
    'use strict';
    var mydata = reportData;
    // console.log(mydata);
    var contactInfo = function(rpt, data) {
        rpt.fontsize(12);
        rpt.fontBold();
        rpt.print([
            data.carerEENo + ' : ' + data.carerName
        ], {x:80});
    };
    
    var header = function(rpt, data) {
      if(!data.carerEENo) {return;}
 
      rpt.fontSize(9);
      rpt.print(new Date().toString('MM/dd/yyyy')); //, {y: 30, align: 'right'});
      // Report Title
      rpt.print(`SCHEDULES\n${data.thisMonthsSchedule}`, {fontBold: true, fontSize: 16, align: 'center'});
    // Contact Info
    contactInfo(rpt, data);

    rpt.newline();
    // Detail Header
    rpt.fontsize(15);
    rpt.fontBold();
    rpt.band([
      {data: 'Monday', width: 110, align: 2, textColor: 'black'},
      {data: 'Tuesday', width: 110, align: 2},
      {data: 'Wednesday', width: 110, align: 2},
      {data: 'Thursday', align: 2, width: 110},
      {data: 'Friday', width: 110, align: 2},
      {data: 'Saturday', width: 110, align: 2},
      {data: 'Sunday', width: 110, align: 2}
    ],  {border: 1, width: 0, fill: 'lightgrey'});
    rpt.fontNormal();
    rpt.fontsize(12);
    // rpt.bandLine();
  };
    var detail = function(rpt, data) {
        // var counter = 0;  
        rpt.newline();
        var day1 = data.day1.split('~');
        var day2 = data.day2.split('~');
        var day3 = data.day3.split('~');
        var day4 = data.day4.split('~');
        var day5 = data.day5.split('~');
        var day6 = data.day6.split('~');
        var day7 = data.day7.split('~');
        // console.log(day1);
    // Detail Body
      rpt.band([
                  
       {data: `${day1[0]}\n${day1[1]}\n${day1[2]}`, width: 110, align: 2},
    //    {data: data.sale.purchase_order},
       {data: `${day2[0]}\n${day2[1]}\n${day2[2]}`, width: 110, align: 2},
       {data: `${day3[0]}\n${day3[1]}\n${day3[2]}`, align: 2, width: 110},
       {data: `${day4[0]}\n${day4[1]}\n${day4[2]}`, width: 110, align: 2},
       {data: `${day5[0]}\n${day5[1]}\n${day5[2]}`, width: 110, align: 2},
       {data: `${day6[0]}\n${day6[1]}\n${day6[2]}`, width: 110, align: 2},
       {data: `${day7[0]}\n${day7[1]}\n${day7[2]}`, width: 110, align: 2}
      ], {border: 1, width: 0, wrap:2});
  };

    var rptName =  "files/CarerSchedules.pdf";
  
    var resultReport = new Report(rptName, {landscape: true, paper: 'A4', autoPrint: false})
        .data(mydata) 
    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
        .groupBy('carerName')
        // .groupBy('carerEENo')
        .detail(detail)
        .header(header, {pageBreakBefore: true})
    ;
  
    console.time("Rendered");
    resultReport.render(function(err, name) {
        console.timeEnd("Rendered");
    }); 
  }

// 

router.get('/reports/carerSchedules/:monthForSchedules', function(req, res){
        for (i = 0; i < shift.length; i++) {
            shift[i].scheduleDayOfMonth = 0;
            shift[i].scheduleNthDayOfMonth = '';
        } 
        // shift = shift2;
        reportData = [];
    
        var monthInput = req.params.monthForSchedules;
        console.log(monthInput);
        var thisMonth = `${monthInput}-01`;
                var dayOfTheCalendarMonth = moment(thisMonth).format('D');
                var dayOfWeekStartForThisMonth = moment(thisMonth).weekday();
                console.log("Day of the week to start:" + dayOfWeekStartForThisMonth);
                var daysInTheMonth = moment(thisMonth).daysInMonth();
                currentMonth = moment(thisMonth).format('MMMM-YYYY');
                console.log(currentMonth);
                // reportData = [];

                if (dayOfWeekStartForThisMonth === 1) {
                    shift[0].scheduleDayOfMonth = parseInt(dayOfTheCalendarMonth);
                } else if (dayOfWeekStartForThisMonth === 2) {
                    shift[1].scheduleDayOfMonth = parseInt(dayOfTheCalendarMonth);
                } else if (dayOfWeekStartForThisMonth === 3) {
                    shift[2].scheduleDayOfMonth = parseInt(dayOfTheCalendarMonth);
                }else if (dayOfWeekStartForThisMonth === 4) {
                    shift[3].scheduleDayOfMonth = parseInt(dayOfTheCalendarMonth);
                }else if (dayOfWeekStartForThisMonth === 5) {
                    shift[4].scheduleDayOfMonth = parseInt(dayOfTheCalendarMonth);
                }else if (dayOfWeekStartForThisMonth === 6) {
                    shift[5].scheduleDayOfMonth = parseInt(dayOfTheCalendarMonth);
                }else if (dayOfWeekStartForThisMonth === 0) {
                    shift[6].scheduleDayOfMonth = parseInt(dayOfTheCalendarMonth);
                };
                for (i = 1; i < shift.length; i++) {
                    if (shift[i-1].scheduleDayOfMonth !== 0 && shift[i-1].scheduleDayOfMonth < parseInt(daysInTheMonth)) {
                    shift[i].scheduleDayOfMonth = shift[i-1].scheduleDayOfMonth + 1;
                    };
                };

                currentMonth = moment(thisMonth).format("YYYY-MM");
                for (i = 0; i < shift.length; i++) {
                    if (shift[i].scheduleDayOfMonth > 0 && shift[i].scheduleDayOfMonth < 10) {
                        newNth = `${currentMonth}-0${shift[i].scheduleDayOfMonth}`;
                        shift[i].scheduleNthDayOfMonth = moment(newNth).format('Do');
                    } else if (shift[i].scheduleDayOfMonth > 0 && shift[i].scheduleDayOfMonth >= 10) {
                        newNth = `${currentMonth}-${shift[i].scheduleDayOfMonth}`; 
                        shift[i].scheduleNthDayOfMonth = moment(newNth).format('Do');
                    };
                };

                // newShift = shift;

            var response = {
                success : 'Timesheet processed',
                failure: 'There was a problem'
            }

            var sql = `select distinct carer_id from shifts where shift_month = '${monthInput}'`;

            

            connection.query(sql, function(error, result){
                var carers = result;
                // console.log(result);
                if (error) {
                            res.end(JSON.stringify(response.failure));    
                        }

                
                    for(i = 0; i < carers.length; i++){
                        var carerId = parseInt(carers[i].carer_id);
                        var sql = `select shifts.id, shifts.client_id as cliendId, clients.last_name as clientLastName, clients.first_name as clientFirstName,`;
                        sql = sql + ` shifts.carer_id as carerId, carers.last_name as carerLastName, carers.first_name as carerFirstName, shift_month, shift_start,`;
                        sql = sql + ` shift_end, carers.employee_number as employeeNumber, payrollCode from shifts`;
                        sql = sql + ` inner join clients on clients.id = client_id`; 
                        sql = sql + ` inner join carers on carers.id = carer_id`;
                        sql = sql + ` where shift_month = '${monthInput}' and carer_id = ${carerId}`;
                        sql = sql + ` order by carers.last_name,shift_start`;
                        connection.query(sql, function(error, result){
                            if (error) {
                                    res.end(JSON.stringify(response.failure));    
                                }
                                // console.log(result);
                            var data = result;
    
                            for (i = 0; i < data.length; i++) { 
                                for (x = 0; x < shift.length; x++) {
                                        shift[x].scheduleCareId = data[i].carerId;
                                        shift[x].scheduleCarerName = `${data[i].carerLastName} ${data[i].carerFirstName}`;
                                        shift[x].scheduleEmployeeNumber = data[i].employeeNumber;

                                        if (shift[x].scheduleDayOfMonth === parseInt(moment(data[i].shift_start).format('D'))){
                                                    var scheduleShift = data[i].payrollCode; 
                                                    if (parseInt(scheduleShift) === 100 || parseInt(scheduleShift) === 200 || parseInt(scheduleShift) === 300 || parseInt(scheduleShift) === 400 || parseInt(scheduleShift) === 500 || parseInt(scheduleShift) === 800|| parseInt(scheduleShift) === 201) {
                                                        scheduleShift = 'Day Shift';
                                                    } else {
                                                        scheduleShift = 'Night Shift';
                                                    }
                                            shift[x].scheduleShift = scheduleShift;
                                            shift[x].scheduleClient = `${data[i].clientLastName} ${data[i].clientFirstName.substring(0,1)}`;
                                            shift[x].scheduleTimes = `${moment(data[i].shift_start).format('HH:mm')}-${moment(data[i].shift_end).format('HH:mm')}`; 
                                            shift[x].scheduleShiftNumber = i;
                                        }            
                                }
                            }
                        
                            var thisMonthsSchedule = moment(currentMonth).format("MMMM-YYYY");
                            // console.log(thisMonthsSchedule);
    
                            var objectForReportWk1 = {
                                id: shift[0].scheduleCareId,
                                carerEENo: shift[0].scheduleEmployeeNumber,
                                thisMonthsSchedule: thisMonthsSchedule,
                                carerName: `${shift[0].scheduleCarerName}`,
                                day1: `${shift[0].scheduleNthDayOfMonth} ${shift[0].scheduleShift}~${shift[0].scheduleClient}~${shift[0].scheduleTimes}`,
                                day2: `${shift[1].scheduleNthDayOfMonth} ${shift[1].scheduleShift}~${shift[1].scheduleClient}~${shift[1].scheduleTimes}`,
                                day3: `${shift[2].scheduleNthDayOfMonth} ${shift[2].scheduleShift}~${shift[2].scheduleClient}~${shift[2].scheduleTimes}`,
                                day4: `${shift[3].scheduleNthDayOfMonth} ${shift[3].scheduleShift}~${shift[3].scheduleClient}~${shift[3].scheduleTimes}`,
                                day5: `${shift[4].scheduleNthDayOfMonth} ${shift[4].scheduleShift}~${shift[4].scheduleClient}~${shift[4].scheduleTimes}`,
                                day6: `${shift[5].scheduleNthDayOfMonth} ${shift[5].scheduleShift}~${shift[5].scheduleClient}~${shift[5].scheduleTimes}`,
                                day7: `${shift[6].scheduleNthDayOfMonth} ${shift[6].scheduleShift}~${shift[6].scheduleClient}~${shift[6].scheduleTimes}`
                            }
                            var objectForReportWk2 = {
                                id: shift[0].scheduleCareId,
                                carerEENo: shift[0].scheduleEmployeeNumber,
                                thisMonthsSchedule: thisMonthsSchedule,
                                carerName: `${shift[0].scheduleCarerName}`,
                                day1: `${shift[7].scheduleNthDayOfMonth} ${shift[7].scheduleShift}~${shift[7].scheduleClient}~${shift[7].scheduleTimes}`,
                                day2: `${shift[8].scheduleNthDayOfMonth} ${shift[8].scheduleShift}~${shift[8].scheduleClient}~${shift[8].scheduleTimes}`,
                                day3: `${shift[9].scheduleNthDayOfMonth} ${shift[9].scheduleShift}~${shift[9].scheduleClient}~${shift[9].scheduleTimes}`,
                                day4: `${shift[10].scheduleNthDayOfMonth} ${shift[10].scheduleShift}~${shift[10].scheduleClient}~${shift[10].scheduleTimes}`,
                                day5: `${shift[11].scheduleNthDayOfMonth} ${shift[11].scheduleShift}~${shift[11].scheduleClient}~${shift[11].scheduleTimes}`,
                                day6: `${shift[12].scheduleNthDayOfMonth} ${shift[12].scheduleShift}~${shift[12].scheduleClient}~${shift[12].scheduleTimes}`,
                                day7: `${shift[13].scheduleNthDayOfMonth} ${shift[13].scheduleShift}~${shift[13].scheduleClient}~${shift[13].scheduleTimes}`
                            }
                            var objectForReportWk3 = {
                                id: shift[0].scheduleCareId,
                                carerEENo: shift[0].scheduleEmployeeNumber,
                                thisMonthsSchedule: thisMonthsSchedule,
                                carerName: `${shift[0].scheduleCarerName}`,
                                day1: `${shift[14].scheduleNthDayOfMonth} ${shift[14].scheduleShift}~${shift[14].scheduleClient}~${shift[14].scheduleTimes}`,
                                day2: `${shift[15].scheduleNthDayOfMonth} ${shift[15].scheduleShift}~${shift[15].scheduleClient}~${shift[15].scheduleTimes}`,
                                day3: `${shift[16].scheduleNthDayOfMonth} ${shift[16].scheduleShift}~${shift[16].scheduleClient}~${shift[16].scheduleTimes}`,
                                day4: `${shift[17].scheduleNthDayOfMonth} ${shift[17].scheduleShift}~${shift[17].scheduleClient}~${shift[17].scheduleTimes}`,
                                day5: `${shift[18].scheduleNthDayOfMonth} ${shift[18].scheduleShift}~${shift[18].scheduleClient}~${shift[18].scheduleTimes}`,
                                day6: `${shift[19].scheduleNthDayOfMonth} ${shift[19].scheduleShift}~${shift[19].scheduleClient}~${shift[19].scheduleTimes}`,
                                day7: `${shift[20].scheduleNthDayOfMonth} ${shift[20].scheduleShift}~${shift[20].scheduleClient}~${shift[20].scheduleTimes}`
                            }
                            var objectForReportWk4 = {
                                id: shift[0].scheduleCareId,
                                carerEENo: shift[0].scheduleEmployeeNumber,
                                thisMonthsSchedule: thisMonthsSchedule,
                                carerName: `${shift[0].scheduleCarerName}`,
                                day1: `${shift[21].scheduleNthDayOfMonth} ${shift[21].scheduleShift}~${shift[21].scheduleClient}~${shift[21].scheduleTimes}`,
                                day2: `${shift[22].scheduleNthDayOfMonth} ${shift[22].scheduleShift}~${shift[22].scheduleClient}~${shift[22].scheduleTimes}`,
                                day3: `${shift[23].scheduleNthDayOfMonth} ${shift[23].scheduleShift}~${shift[23].scheduleClient}~${shift[23].scheduleTimes}`,
                                day4: `${shift[24].scheduleNthDayOfMonth} ${shift[24].scheduleShift}~${shift[24].scheduleClient}~${shift[24].scheduleTimes}`,
                                day5: `${shift[25].scheduleNthDayOfMonth} ${shift[25].scheduleShift}~${shift[25].scheduleClient}~${shift[25].scheduleTimes}`,
                                day6: `${shift[26].scheduleNthDayOfMonth} ${shift[26].scheduleShift}~${shift[26].scheduleClient}~${shift[26].scheduleTimes}`,
                                day7: `${shift[27].scheduleNthDayOfMonth} ${shift[27].scheduleShift}~${shift[27].scheduleClient}~${shift[27].scheduleTimes}`
                            }
                            var objectForReportWk5 = {
                                id: shift[0].scheduleCareId,
                                carerEENo: shift[0].scheduleEmployeeNumber,
                                thisMonthsSchedule: thisMonthsSchedule,
                                carerName: `${shift[0].scheduleCarerName}`,
                                day1: `${shift[28].scheduleNthDayOfMonth} ${shift[28].scheduleShift}~${shift[28].scheduleClient}~${shift[28].scheduleTimes}`,
                                day2: `${shift[29].scheduleNthDayOfMonth} ${shift[29].scheduleShift}~${shift[29].scheduleClient}~${shift[29].scheduleTimes}`,
                                day3: `${shift[30].scheduleNthDayOfMonth} ${shift[30].scheduleShift}~${shift[30].scheduleClient}~${shift[30].scheduleTimes}`,
                                day4: `${shift[31].scheduleNthDayOfMonth} ${shift[31].scheduleShift}~${shift[31].scheduleClient}~${shift[31].scheduleTimes}`,
                                day5: `${shift[32].scheduleNthDayOfMonth} ${shift[32].scheduleShift}~${shift[32].scheduleClient}~${shift[32].scheduleTimes}`,
                                day6: `${shift[33].scheduleNthDayOfMonth} ${shift[33].scheduleShift}~${shift[33].scheduleClient}~${shift[33].scheduleTimes}`,
                                day7: `${shift[34].scheduleNthDayOfMonth} ${shift[34].scheduleShift}~${shift[34].scheduleClient}~${shift[34].scheduleTimes}`
                            }
                            var objectForReportWk6 = {
                                id: shift[0].scheduleCareId,
                                carerEENo: shift[0].scheduleEmployeeNumber,
                                thisMonthsSchedule: thisMonthsSchedule,
                                carerName: `${shift[0].scheduleCarerName}`,
                                day1: `${shift[35].scheduleNthDayOfMonth} ${shift[35].scheduleShift}~${shift[35].scheduleClient}~${shift[35].scheduleTimes}`,
                                day2: `${shift[36].scheduleNthDayOfMonth} ${shift[36].scheduleShift}~${shift[36].scheduleClient}~${shift[36].scheduleTimes}`,
                                day3: `${shift[37].scheduleNthDayOfMonth} ${shift[37].scheduleShift}~${shift[37].scheduleClient}~${shift[37].scheduleTimes}`,
                                day4: `${shift[38].scheduleNthDayOfMonth} ${shift[38].scheduleShift}~${shift[38].scheduleClient}~${shift[38].scheduleTimes}`,
                                day5: `${shift[39].scheduleNthDayOfMonth} ${shift[39].scheduleShift}~${shift[39].scheduleClient}~${shift[39].scheduleTimes}`,
                                day6: `${shift[40].scheduleNthDayOfMonth} ${shift[40].scheduleShift}~${shift[40].scheduleClient}~${shift[40].scheduleTimes}`,
                                day7: `${shift[41].scheduleNthDayOfMonth} ${shift[41].scheduleShift}~${shift[41].scheduleClient}~${shift[41].scheduleTimes}`
                            }
                            
                            reportData.push(objectForReportWk1);
                            reportData.push(objectForReportWk2);
                            reportData.push(objectForReportWk3);
                            reportData.push(objectForReportWk4);
                            reportData.push(objectForReportWk5);
                            if (shift[35].scheduleNthDayOfMonth != '') {
                                reportData.push(objectForReportWk6);
                            }
                            // console.log(reportData.length);

                            for (i = 0; i < shift.length; i++) {
                                shift[i].scheduleShift = '';
                                shift[i].scheduleClient = '';
                                shift[i].scheduleTimes = '';
                                shift[i].scheduleShiftNumber = -1;
                            }
                            // console.log(reportData.length);
                            // timeOutLength = parseInt(reportData.length) * 100;
                            // console.log("timeOutLength is " + timeOutLength);
                            
                        }) 
                    }

                });
                // console.log('End :' + Date.now());
                // console.log(reportData.length);
                // console.log("timeOutLength is " + timeOutLength);
            setTimeout(function(){
                res.contentType('application/pdf');
                createCarerFile();
                var host = req.hostname;
                var port = req.socket.localPort;
                var filename = `CarerSchedules.pdf`;
                // var dataToSend = `${filename}-${host}-${port}`     
                var dataToSend = `${reportLocation}${filename}`     
                res.send(dataToSend);
                console.log('Created File!!'); 
            }, 3500);

            // res.send(dataToSend);


        
});



var shift = [
    {scheduleDay: 1, scheduleDayOfWeek: 1, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 2, scheduleDayOfWeek: 2, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 3, scheduleDayOfWeek: 3, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 4, scheduleDayOfWeek: 4, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 5, scheduleDayOfWeek: 5, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 6, scheduleDayOfWeek: 6, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 7, scheduleDayOfWeek: 7, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 8, scheduleDayOfWeek: 1, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 9, scheduleDayOfWeek: 2, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 10, scheduleDayOfWeek: 3, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 11, scheduleDayOfWeek: 4, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 12, scheduleDayOfWeek: 5, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 13, scheduleDayOfWeek: 6, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 14, scheduleDayOfWeek: 7, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 15, scheduleDayOfWeek: 1, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 16, scheduleDayOfWeek: 2, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 17, scheduleDayOfWeek: 3, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 18, scheduleDayOfWeek: 4, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 19, scheduleDayOfWeek: 5, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 20, scheduleDayOfWeek: 6, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 21, scheduleDayOfWeek: 7, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 22, scheduleDayOfWeek: 1, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 23, scheduleDayOfWeek: 2, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 24, scheduleDayOfWeek: 3, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 25, scheduleDayOfWeek: 4, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 26, scheduleDayOfWeek: 5, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 27, scheduleDayOfWeek: 6, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 28, scheduleDayOfWeek: 7, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 29, scheduleDayOfWeek: 1, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 30, scheduleDayOfWeek: 2, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 31, scheduleDayOfWeek: 3, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 32, scheduleDayOfWeek: 4, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 33, scheduleDayOfWeek: 5, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 34, scheduleDayOfWeek: 6, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 35, scheduleDayOfWeek: 7, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 36, scheduleDayOfWeek: 1, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 37, scheduleDayOfWeek: 2, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 38, scheduleDayOfWeek: 3, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 39, scheduleDayOfWeek: 4, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 40, scheduleDayOfWeek: 5, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 41, scheduleDayOfWeek: 6, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1},
    {scheduleDay: 42, scheduleDayOfWeek: 7, scheduleDayOfMonth: 0, scheduleNthDayOfMonth: '', scheduleCareId: 0, scheduleShift: '', scheduleTimes: '', scheduleClient: '', day: '', scheduleCarerName: '', scheduleEmployeeNumber: '', scheduleShiftNumber: -1}
    
];

module.exports = router;
