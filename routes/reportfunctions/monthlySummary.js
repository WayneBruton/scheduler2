var Report = require("fluentreports").Report;


// const test = 'Hello';
// module.exports.newTest = newTest;

function createMonthlySummary(reportData) {
    "use strict";
    var mydata = reportData;
    var thisMonth = mydata[0].currentMonth;
    console.log(thisMonth);
  
    var header = function (rpt, data) {
      rpt.fontSize(9);
      rpt.print(new Date().toString("MM/dd/yyyy")); //, {y: 30, align: 'right'});
      // Report Title
      rpt.newline();
      rpt.fontBold();
      rpt.print(`Monthly Summary: ${data.currentMonth}`, {
        fontBold: true,
        fontSize: 16,
        align: "center",
        underline: true
      });
      rpt.newline();
      rpt.newline();
      // Detail Header
      rpt.fontsize(9);
      rpt.fontBold();
      rpt.band([{
          data: "Client Type.",
          width: 90,
          align: 2,
          textColor: "black",
          underline: true
        },
        {
          data: "Clients.",
          width: 90,
          align: 2,
          underline: true
        },
        {
          data: "Hours Billed",
          width: 100,
          align: 3,
          underline: true
        },
        {
          data: "Cost in Wages",
          width: 110,
          align: 3,
          underline: true
        },
        {
          data: "Est Income",
          width: 110,
          align: 3,
          underline: true
        },
        {
          data: "Gross Income",
          width: 110,
          align: 3,
          underline: true
        }
      ]);
      rpt.fontNormal();
      rpt.fontsize(9);
      rpt.newline();
      rpt.bandLine();
      rpt.newline();
    };
    var detail = function (rpt, data) {
      data.wages = (parseInt(data.wages * 100) / 100).toFixed(2);
      data.income = (parseInt(data.income * 100) / 100).toFixed(2);
      data.net = (parseInt(data.net * 100) / 100).toFixed(2);
  
      rpt.newline();
      // Detail Body
      rpt.band([{
          data: `${data.clientType}`,
          width: 90,
          align: 2
        },
        {
          data: `${data.clientsThisMonth}`,
          width: 90,
          align: 2
        },
        {
          data: `${data.hoursThisMonth}`,
          width: 100,
          align: 3
        },
        {
          data: `${data.wages}`,
          width: 110,
          align: 3
        },
        {
          data: `${data.income}`,
          width: 110,
          align: 3
        },
        {
          data: `${data.net}`,
          width: 110,
          align: 3
        }
      ]);
    };
  
    var finalSummary = function (rpt, data) {
      rpt.newline();
      rpt.standardFooter([
        ["clientType", 1, 2],
        ["clientsThisMonth", 2, 2],
        ["hoursThisMonth", 3, 3],
        ["wages", 4, 3],
        ["income", 5, 3],
        ["net", 6, 3]
      ]);
  
      rpt.newline();
      rpt.newline();
      rpt.print("Thank You for Choosing Eccentric Toad!", {
        align: "left"
      });
    };
  
    var totalFormatter = function (data, callback) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          if (key === "clientType") {
            continue;
          }
          // Simple Stupid Money formatter.  It is fairly dumb.  ;-)
          var money = data[key].toFixed(2).toString();
          // console.log('This is money', money);
          var idx = money.indexOf(".");
          // console.log('THIS IS IDX',idx);
          if (idx === -1) {
            money += ".00";
          } else if (idx === money.length - 2) {
            money += "0";
          }
          for (var i = 6; i < money.length; i += 4) {
            money =
              money.substring(0, money.length - i) +
              "," +
              money.substring(money.length - i);
          }
  
          // data[key] = '$ '+money;
          data[key] = " " + money;
          // console.log('This is money', money);
        }
      }
  
      callback(null, data);
    };
  
    var rptName = "files/MonthlySummary.pdf";
  
    var resultReport = new Report(rptName, {
        landscape: true,
        paper: "A4",
        autoPrint: false
      })
      .data(mydata)
      .totalFormatter(totalFormatter);
  
    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
      // .groupBy('employeeNumber')
      .groupBy("currentMonth")
      .sum("clientsThisMonth")
      .sum("hoursThisMonth")
      .sum("wages")
      .sum("income")
      .sum("net")
      // .count('employeeNumber')
      .detail(detail)
      .footer(finalSummary)
      .header(header, {
        pageBreakBefore: true
      });
  
    console.time("Rendered");
    resultReport.render(function (err, name) {
      console.timeEnd("Rendered");
    });
  }

  module.exports.createMonthlySummary = createMonthlySummary;


