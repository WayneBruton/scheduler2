var Report = require("fluentreports").Report;



function createCarerWages(reportData) {
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
      rpt.print(`Carer Wages: ${data.currentMonth}`, {
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
          data: "Staff No.",
          width: 90,
          align: 2,
          textColor: "black",
          underline: true
        },
        {
          data: "Staff Member Name.",
          width: 110,
          align: 2,
          underline: true
        },
        {
          data: "Rate.",
          width: 50,
          align: 2,
          underline: true
        },
        {
          data: "Client Type.",
          width: 110,
          align: 2,
          underline: true
        },
        {
          data: "Hours.",
          width: 50,
          align: 2,
          underline: true
        },
        {
          data: "Wage.",
          width: 110,
          align: 2,
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
      data.wages = data.wages.toFixed(2);
      // var counter = 0;
      rpt.newline();
      // Detail Body
      rpt.band([{
          data: `${data.employeeNumber}`,
          width: 90,
          align: 2
        },
        {
          data: `${data.caLastName} ${data.caFirstName}`,
          width: 110,
          align: 2
        },
        {
          data: `${data.rate_per_hour}`,
          width: 50,
          align: 2
        },
        {
          data: `${data.clientType}`,
          width: 110,
          align: 2
        },
        {
          data: `${data.totalHours}`,
          width: 50,
          align: 2
        },
        {
          data: `${data.wages}`,
          width: 110,
          align: 3
        }
      ]);
      //   ], {border: 1, width: 0, wrap:2});
    };
  
    var finalSummary = function (rpt, data) {
      rpt.newline();
      rpt.standardFooter([
        ["employeeNumber", 1, 2],
        ["totalHours", 5, 2],
        ["wages", 6, 3]
      ]);
      rpt.newline();
      rpt.newline();
      rpt.print("Thank You for Eccentric Toad!", {
        align: "left"
      });
    };
  
    var totalFormatter = function (data, callback) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          if (key === "employeeNumber") {
            continue;
          }
          // Simple Stupid Money formatter.  It is fairly dumb.  ;-)
          var money = data[key].toString();
          var idx = money.indexOf(".");
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
        }
      }
  
      callback(null, data);
    };
  
    var rptName = "files/CarerWages.pdf";
  
    var resultReport = new Report(rptName, {
        landscape: false,
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
      .sum("totalHours")
      .sum("wages")
      .count("employeeNumber")
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

  module.exports.createCarerWages = createCarerWages;
  