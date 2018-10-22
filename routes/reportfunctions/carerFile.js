var Report = require("fluentreports").Report;

function createCarerFile(reportData) {
    "use strict";
    var mydata = reportData;
    // console.log(mydata);
    var contactInfo = function (rpt, data) {
      rpt.fontsize(12);
      rpt.fontBold();
      rpt.print([data.carerEENo + " : " + data.carerName], {
        x: 80
      });
    };
  
    var header = function (rpt, data) {
      if (!data.carerEENo) {
        return;
      }
  
      rpt.fontSize(9);
      rpt.print(new Date().toString("MM/dd/yyyy")); //, {y: 30, align: 'right'});
      // Report Title
      rpt.print(`SCHEDULES\n${data.thisMonthsSchedule}`, {
        fontBold: true,
        fontSize: 16,
        align: "center"
      });
      // Contact Info
      contactInfo(rpt, data);
  
      rpt.newline();
      // Detail Header
      rpt.fontsize(15);
      rpt.fontBold();
      rpt.band(
        [{
            data: "Monday",
            width: 110,
            align: 2,
            textColor: "black"
          },
          {
            data: "Tuesday",
            width: 110,
            align: 2
          },
          {
            data: "Wednesday",
            width: 110,
            align: 2
          },
          {
            data: "Thursday",
            align: 2,
            width: 110
          },
          {
            data: "Friday",
            width: 110,
            align: 2
          },
          {
            data: "Saturday",
            width: 110,
            align: 2
          },
          {
            data: "Sunday",
            width: 110,
            align: 2
          }
        ], {
          border: 1,
          width: 0,
          fill: "lightgrey"
        }
      );
      rpt.fontNormal();
      rpt.fontsize(12);
      // rpt.bandLine();
    };
    var detail = function (rpt, data) {
      // var counter = 0;
      rpt.newline();
      var day1 = data.day1.split("~");
      var day2 = data.day2.split("~");
      var day3 = data.day3.split("~");
      var day4 = data.day4.split("~");
      var day5 = data.day5.split("~");
      var day6 = data.day6.split("~");
      var day7 = data.day7.split("~");
      // console.log(day1);
      // Detail Body
      rpt.band(
        [{
            data: `${day1[0]}\n${day1[1]}\n${day1[2]}`,
            width: 110,
            align: 2
          },
          //    {data: data.sale.purchase_order},
          {
            data: `${day2[0]}\n${day2[1]}\n${day2[2]}`,
            width: 110,
            align: 2
          },
          {
            data: `${day3[0]}\n${day3[1]}\n${day3[2]}`,
            align: 2,
            width: 110
          },
          {
            data: `${day4[0]}\n${day4[1]}\n${day4[2]}`,
            width: 110,
            align: 2
          },
          {
            data: `${day5[0]}\n${day5[1]}\n${day5[2]}`,
            width: 110,
            align: 2
          },
          {
            data: `${day6[0]}\n${day6[1]}\n${day6[2]}`,
            width: 110,
            align: 2
          },
          {
            data: `${day7[0]}\n${day7[1]}\n${day7[2]}`,
            width: 110,
            align: 2
          }
        ], {
          border: 1,
          width: 0,
          wrap: 2
        }
      );
    };
  
    var rptName = "files/CarerSchedules.pdf";
  
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
      .groupBy("carerName")
      // .groupBy('carerEENo')
      .detail(detail)
      .header(header, {
        pageBreakBefore: true
      });
  
    console.time("Rendered");
    resultReport.render(function (err, name) {
      console.timeEnd("Rendered");
    });
  }

  module.exports.createCarerFile = createCarerFile;
  