$(function(){
    var inputMonth = moment().format("YYYY-MM");
    var searchMonth; //shift_month to search for
    var processedOrNot = false;//To search for processed or unprocesed timesheets
    var search = '&&';//String to search for

    searchMonth = inputMonth;
    moment.tz.setDefault('Africa/Johannesburg');
    // console.log(moment.tz.setDefault('Africa/Johannesburg'));
    console.log(moment.tz.guess());

    //OPENING DEFAULTS     

    $("#inputMonth").val(inputMonth);
    $('#carerRadio').prop("checked", true);
    $("#searchByRadio").val("carers");

    getTimesheets();
    displayTooltips = 0;

    //TO SEARCH BY CARER, CLIENT OR EMPLOYEE NUMBER

    $('#carerRadio').click(function () { 
        $('#clientRadio').prop("checked", false);
        $('#employeeRadio').prop("checked", false);
        $('#searchInput').attr("placeholder", "Search by Carer's Last Name");
        $("#searchByRadio").val("carers"); 
        getTimesheets();
    });

    $('#clientRadio').click(function () { 
        $('#employeeRadio').prop("checked", false);
        $('#carerRadio').prop("checked", false);
        $('#searchInput').attr("placeholder", "Search by Client's Last Name"); 
        $("#searchByRadio").val("clients");
        getTimesheets();
    });

    $('#employeeRadio').click(function () { 
        $('#clientRadio').prop("checked", false);
        $('#carerRadio').prop("checked", false);
        $('#searchInput').attr("placeholder", "Search by Employee Number");
        $("#searchByRadio").val("employee_number");
        // $('#searchInput').val(1);
        getTimesheets();
    });

    $(function(){//To search for processed or unprocesed timesheets
        $("#processedOrNot").prop("checked", true);
        $(".processedOrNot").val(processedOrNot);
        });

        $("#processedOrNot").click(function (e) { 
            if ($(this).prop("checked") === false) {
                processedOrNot = true;
                $(".checkboxtext").text("Processed but NOT Invoiced Timesheets Selected")
            } 
            else {
                processedOrNot = false;
                $(".checkboxtext").text("Un-Processed Timesheets Selected")

            }
            $(".processedOrNot").val(processedOrNot);

            getTimesheets();
        });


    //MOVE BETWEN MONTHS
    $('#previous').click(function (e) { 
        e.preventDefault();
        var newMonth = $("#inputMonth").val();
        newMonth = newMonth + '-01';
        newMonth = moment(newMonth).subtract(1,'M').format("YYYY-MM-DD"); 
        newMonth = moment(newMonth).format("YYYY-MM");
        $("#inputMonth").val(newMonth);
        searchMonth = newMonth;//shift_month to search for
        getTimesheets();  
    });

    $('#next').click(function (e) { 
        e.preventDefault();
        var newMonth = $("#inputMonth").val();
        newMonth = newMonth + '-01';
        newMonth = moment(newMonth).add(1,'M').format("YYYY-MM-DD"); 
        newMonth = moment(newMonth).format("YYYY-MM");
        $("#inputMonth").val(newMonth); 
        searchMonth = newMonth; //shift_month to search for
        getTimesheets();    
    });

    $('#searchInput').keydown(function (e) {
    if(event.keyCode == 13) {
        e.preventDefault();
        $(".searchShifts").focus();
        // getTimesheets();
        return false;

      }
    // getTimesheets();
    });

    

    

    $('#searchInput').keyup(function (e) {
        search = $(this).val();
        if (search === '') {
            search = '&&'
        } 
    });

    $(".searchShifts").click(function (e) { 
        e.preventDefault();
        getTimesheets();
    });

    $("#timesheetData").on("click", ".processBtn", function (e) {
        e.preventDefault();
        var dataToPost = [];
        var startShiftDate = $(this).siblings('.startShiftDate').val();
        var startShiftTime = $(this).siblings('.startShiftTime').val();
        var shift_start = `${startShiftDate} ${startShiftTime}`
        var endShiftDate = $(this).siblings('.endShiftDate').val();
        var endShiftTime = $(this).siblings('.endShiftTime').val();
        var shift_end = `${endShiftDate} ${endShiftTime}`
        var shiftId = $(this).siblings('.shiftId').val();
        var toProcess = processedOrNot;
        if (toProcess === false) {
            toProcess = true;
        } else {
            toProcess = false;
        }

        dataToPost.push(shiftId);
        dataToPost.push(shift_start);
        dataToPost.push(shift_end);
        dataToPost.push(toProcess);

        console.log(dataToPost);

        var url = '/timesheetsReceived';

        $.ajax({ 
            type: 'POST', 
            url: url, 
            data:  { dataToPost } , 
            dataType: 'json'
          }).done(function(response){
              console.log(response);
          }).fail(function(response){
            console.log(response);

          });
          getTimesheets();    
    });



    $("#timesheetData").on("click", ".deleteBtn", function (e) {
        e.preventDefault();
        var dataToDelete = [];
        var shiftId = $(this).siblings('.shiftId').val();
        dataToDelete.push(shiftId);

        var url = '/deleteTimesheetsAllocated';
        $.ajax({ 
            type: 'DELETE', 
            url: url, 
            data:  { dataToDelete } , 
            dataType: 'json'
          }).done(function(response){

          }).fail(function(response){

          });
          getTimesheets();    
    });



    

    function getTimesheets(){
        const searchBy = $("#searchByRadio").val();
        const url = '/timesheetRetrieve/' + searchMonth + '/' + processedOrNot + '/' + searchBy + '/' + search;
        $.get(url, function(data){
            $('#timesheetData').empty();
            // data = data.timesheets;
            // console.log(data.timesheets);
            data2 = data.processedCount;
            data3 = data.totalTimesheets;
            data4 = data.duplicates;
            data5 = data.overBilling;
            data6 = data.longShifts;
            data7 = data.overlaps;
            var duplicateText = data4.length;
            var overBillingText = data5.length;
            var longShiftsText = data6.length;
            var overlapText = data7.length;
            var labelText = data2[0].count;
            var outOf = data3[0].count;
            if (labelText === 1) {
                labelText = `There is ${labelText} out of ${outOf} shift still unprocessed.`;
            } else {
                labelText = `There are ${labelText} out of ${outOf} shifts still unprocessed.`;
            }
            $(".countLabel").text(`${labelText}`);

            // .duplicateLabel

            if (duplicateText > 0) {
                $('.duplicateLabel').css("display", "block");
            } else {
                $('.duplicateLabel').css("display", "none");
            }
            if (duplicateText === 1) {
                duplicateText = `There is ${duplicateText} duplicate shift in the system - please see reports`;
            } else {
                duplicateText = `There are ${duplicateText} duplicate shifts in the system - please see reports`;
            }
            $(".duplicateLabel").text(`${duplicateText}`);

            // .over24hrsLabel
            if (overBillingText > 0) {
                $('.over24hrsLabel').css("display", "block");
            } else {
                $('.over24hrsLabel').css("display", "none");
            }
            if (overBillingText === 1) {
                overBillingText = `There is ${overBillingText} day allocated more than 24 hours - please see reports`;
            } else {
                overBillingText = `There are ${overBillingText} days allocated more than 24 hours - please see reports`;
            }
            $(".over24hrsLabel").text(`${overBillingText}`);

            // .longShiftsLabel

            if (longShiftsText > 0) {
                $('.longShiftsLabel').css("display", "block");
            } else {
                $('.longShiftsLabel').css("display", "none");
            }
            if (longShiftsText === 1) {
                longShiftsText = `There is ${longShiftsText} shift longer than 12 hours - please see reports`;
            } else {
                longShiftsText = `There are ${longShiftsText} shifts longer than 12 hours - please see reports`;
            }
            $(".longShiftsLabel").text(`${longShiftsText}`);


            if (overlapText > 0) {
                $('.overlapsLabel').css("display", "block");
            } else {
                $('.overlapsLabel').css("display", "none");
            }
            if (overlapText === 1) {
                overlapText = `There is ${overlapText} shift overlapping another - please see reports`;
            } else {
                overlapText = `There are ${overlapText} shifts that overlap - please see reports`;
            }
            $(".overlapsLabel").text(`${overlapText}`);



            data = data.timesheets;
            
 

            $.each(data, function (index, value) { 
                // console.log(data.timesheets);
                // const startDate = moment.tz((this.shift_start), "Africa/Johannesburg").format("YYYY-MM-DD");
                const startDate = moment(this.shift_start).format("YYYY-MM-DD");
   
                
                const startTime = moment(this.shift_start).format("HH:mm");
                const endDate = moment(this.shift_end).format("YYYY-MM-DD");
                const endTime = moment(this.shift_end).format("HH:mm");
                // const startTime = moment.tz(this.shift_start, "Africa/Johannesburg").format("HH:mm:ss");
                // const endDate = moment.tz(this.shift_end, "Africa/Johannesburg").format("YYYY-MM-DD");
                // const endTime = moment.tz(this.shift_end, "Africa/Johannesburg").format("HH:mm:ss");
                // console.log(endTime);
                var input =  `Client:  ${this.clientId} - ${this.clientFirstName} : ${this.clientLastName} `;                   
                input =  input + ` | Carer: EE Num: ${this.carerEmployeeNumber} - ${this.carerFirstName} : ${this.carerLastName}`;
                var timesheetAdd = `<div class="timesheet-li-div"><form action="" method=""><li class="timesheet-li"> ${input} </li>`;
                if (processedOrNot === false) {
                    timesheetAdd = timesheetAdd + `<input type="hidden" name="shiftId" class="shiftId" value="${this.shiftId}"> from: <input type="date"  class="timesheetDate startShiftDate masterTooltip" title="Change to start date" name="shiftStartDate" id="" value="${startDate}">`;
                    timesheetAdd = timesheetAdd + `<input type="time" class="timesheetTime startShiftTime masterTooltip" title="Change to start time" name="shiftStartTime" id="" value="${startTime}" step="900"> to: `;
                    timesheetAdd = timesheetAdd + `</li><input type="date"  class="timesheetDate endShiftDate masterTooltip" title="Change to end date" name="shiftEndDate" id="" value="${endDate}">`;
                    timesheetAdd = timesheetAdd + `<input type="time" class="timesheetTime endShiftTime masterTooltip" title="Change to end time" name="shiftEndTime" id="" value="${endTime}" step="900">`;
                    timesheetAdd = timesheetAdd + `<button class="btn processBtn masterTooltip" id="" title="click to process">&#x2705</button>`;
                    timesheetAdd = timesheetAdd + `<button class="btn deleteBtn masterTooltip" id="deleteBtn" title="click to delete">&#x274E</button></form></div>`;
                } else if (processedOrNot === true) {
                    timesheetAdd = timesheetAdd + `<input type="hidden" name="shiftId" class="shiftId" value="${this.shiftId}"> from: <input type="date"  class="timesheetDate startShiftDate masterTooltip" title="Unprocess first" name="shiftStartDate" id="" value="${startDate}" disabled="true">`;
                    timesheetAdd = timesheetAdd + `<input type="time" class="timesheetTime startShiftTime masterTooltip" title="Unprocess first" name="shiftStartTime" id="" value="${startTime}" disabled="true"> to: `;
                    timesheetAdd = timesheetAdd + `</li><input type="date"  class="timesheetDate endShiftDate masterTooltip" title="Unprocess first" name="shiftEndDate" id="" value="${endDate}" disabled="true">`;
                    timesheetAdd = timesheetAdd + `<input type="time" class="timesheetTime endShiftTime masterTooltip" title="Unprocess first" name="shiftEndTime" id="" value="${endTime}" disabled="true">`;
                    timesheetAdd = timesheetAdd + `<button class="btn processBtn masterTooltip" id="" title="click to unprocess">&#x2705</button>`;
                    timesheetAdd = timesheetAdd + `<button class="btn deleteBtn" id="deleteBtn" title="click to delete" disabled="true" style="opacity:0;">&#x274E</button></form></div>`;
                }
                timesheetAdd = $(timesheetAdd);
                timesheetAdd.appendTo('#timesheetData');
            });

        });
    };

    //PROCESS WAGE FILE 
  
   function deleteFile() {
        var file = filetodownload;
        file = file.split('/');
        file = file[file.length - 1];
        // console.log('This is the file',file);
        var url = '/remove/' + file;

        $.get(url,function(data){

        }).done(function(response){

            clearTimeout(deleteFile);

        }).fail(function(response){

        });
     // setTimeout(run,7000); 
    }

    $('#openDownLoadFile').click(function(e) {
        setTimeout(deleteFile, 1500);
        // deleteFile(); 
        $(this).css("display", "none");
    });

    // var filetodownload = '';
    var host = '';
    var port = '';

    $("#processWages").click(function (e) { 
        e.preventDefault();
        processVIPFileConfirmation();
    });


    function processVIPFile() {
        var dataProcess =  $("#inputMonth").val();
        var url = '/processVIPFile/' + dataProcess;
        $.get(url, function(data){

            // filetodownload = data.filename;
            // host = data.host;
            // port = data.port


    
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 250)
        }).done(function(response){
            // console.log('This is the response',response);
            filetodownload = response;
            $("#openDownLoadFile").attr("href", `${filetodownload}`);
            // $("#openDownLoadFile").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            $("#openDownLoadFile").css("display", "inline");
          }).fail(function(){
            console.log("Failed");
          });
    }

    function processVIPFileConfirmation() {
        var txt;
        var r = confirm("Are you sure?");
        if (r === true) {
            txt = "You pressed OK!";
            processVIPFile();
        } else {
            txt = "You pressed Cancel!";
        }
  
    }

    //TOOLTIPS
    var displayTooltips;
    
    $(".displayTooltips").click(function (e) { 
        e.preventDefault();
        if (displayTooltips === 1){
            displayTooltips = 0;
            $(this).text("Show Tooltips")
        } else {
            displayTooltips = 1;
            $(this).text("Hide Tooltips")
        }   
    });


    $("body").on("mouseenter", ".masterTooltip",function () {
        if (displayTooltips === 1 ) {
 
            var title = $(this).attr('title');
            $(this).data('tipText', title).removeAttr('title');
            $('<p class="tooltip"></p>')
            .text(title)
            .appendTo('body')
            .fadeIn('slow');
    }});


    $("body").on("mousemove",".masterTooltip", function (e) {
        if (displayTooltips === 1 ) { 
            var mousex = e.pageX - 100; //Get X coordinates
                    var mousey = e.pageY - 100; //Get Y coordinates
                    $('.tooltip')
                    .css({ top: mousey, left: mousex })   
    }});


    $("body").on("mouseleave",".masterTooltip", function () {
        if (displayTooltips === 1 ) {
            $(this).attr('title', $(this).data('tipText'));
            $('.tooltip').remove(); 
    }});
    
});
