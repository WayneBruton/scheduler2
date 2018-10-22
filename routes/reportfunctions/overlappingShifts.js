var Report = require("fluentreports").Report;


function createOverlappingShifts(reportData) {
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
      rpt.print(`Shifts that overlap : ${data.currentMonth}`, {
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
          data: "Start",
          width: 110,
          align: 2,
          textColor: "black",
          underline: true
        },
        {
          data: "End",
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
          data: "Client: Name",
          width: 110,
          align: 2,
          underline: true
        },
        {
          data: "Staff No",
          width: 110,
          align: 2,
          underline: true
        },
        {
          data: "Staff: Name",
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
          data: `${data.shiftStart}`,
          width: 110,
          align: 2
        },
        {
          data: `${data.shiftEnd}`,
          width: 110,
          align: 2
        },
        {
          data: `${data.clientID}`,
          align: 2,
          width: 110
        },
        {
          data: `${data.clLastName} ${data.clFirstName}`,
          width: 110,
          align: 2
        },
        {
          data: `${data.employeeNumber}`,
          width: 110,
          align: 2
        },
        {
          data: `${data.caLastName} ${data.caFirstName}`,
          width: 110,
          align: 2
        }
      ]);
      //   ], {border: 1, width: 0, wrap:2});
    };
  
    var rptName = "files/Overlappingshifts.pdf";
  
    var resultReport = new Report(rptName, {
      landscape: true,
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

  module.exports.createOverlappingShifts = createOverlappingShifts;
  