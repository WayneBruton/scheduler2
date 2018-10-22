var Report = require("fluentreports").Report;


function createShiftDaysLongerThan24Hours(reportData) {
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
      rpt.print(`Shifts exceeding 24 hours in a day : ${data.currentMonth}`, {
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
          data: "Shift Date",
          width: 110,
          align: 2,
          textColor: "black",
          underline: true
        },
        {
          data: "Total Time",
          width: 110,
          align: 2,
          underline: true
        },
        {
          data: "Client ID",
          width: 110,
          align: 2,
          underline: true
        },
        {
          data: "Client: Last Name",
          width: 110,
          align: 2,
          underline: true
        },
        {
          data: "Client: First Name",
          width: 110,
          align: 2,
          underline: true
        }
      ]);
      rpt.fontNormal();
      rpt.fontsize(9);
    };
    var detail = function (rpt, data) {
      // var counter = 0;
      rpt.newline();
      // Detail Body
      rpt.band([{
          data: `${data.shiftDate}`,
          width: 110,
          align: 2
        },
        {
          data: `${data.totalTime}`,
          width: 110,
          align: 2
        },
        {
          data: `${data.client_id}`,
          align: 2,
          width: 110
        },
        {
          data: `${data.clLastName}`,
          width: 110,
          align: 2
        },
        {
          data: `${data.clFirstName}`,
          width: 110,
          align: 2
        }
      ]);
      //   ], {border: 1, width: 0, wrap:2});
    };
  
    var rptName = "files/Shiftdayslongerthan24hrs.pdf";
  
    var resultReport = new Report(rptName, {
      landscape: false,
      paper: "A4",
      autoPrint: false
    }).data(mydata);
    // Settings
    resultReport
      .fontsize(9)
      .margins(40)
      .fullscreen(true)
      .groupBy("currentMonth")
      .detail(detail)
      .header(header, {
        pageBreakBefore: true
      });
  
    console.time("Rendered");
    resultReport.render(function (err, name) {
      console.timeEnd("Rendered");
    });
  }

  module.exports.createShiftDaysLongerThan24Hours = createShiftDaysLongerThan24Hours;
  