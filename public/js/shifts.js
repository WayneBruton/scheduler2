$(function() {
    var dayOfWeekNotMonth;
    var numberOfDaysInTheMonth;
    var shift_type;
    var client_selected;
    var carer_selected;
    var start_time;
    var end_time;
    var shiftsAllocated = [];
    var shiftsToPost = [];
    var shiftsToBeDeleted = [];
    var dayID;
    var displayTooltips;
    
    var input = moment().format("YYYY-MM");
    var first = input + "-01";
    var publicHolidays = [];


    $("#monthInput").val(input);
    $(function(){
    // getPublicHolidays();
    monthCalculate();
    displayTooltips = 0;
    });

   
   
   

   
   
   

    $(window).bind('beforeunload', function(){
        // alert("Are your sure?")
        deleteshifts();
    });
 
    $("#monthInput").change(function (e) { 
        e.preventDefault();
        shiftsAllocated = [];
        input = $("#monthInput").val();
        first = $(this).val()+"-01";
        // getPublicHolidays();
        monthCalculate();
    });
   
    $(".previous").click(function (e) { 
        e.preventDefault();
        shiftsAllocated = [];
        input = $("#monthInput").val();
        input = moment(input).subtract(1, 'M').format("YYYY-MM");
        first = input + "-01";
        $("#monthInput").val(input);
        monthCalculate();
        returnShiftsPosted();
        // deleteShift(); 
        deleteshifts();     
    });

    $(".next").click(function (e) { 
        e.preventDefault();
        shiftsAllocated = [];
        input = $("#monthInput").val();
        input = moment(input).add(1, 'M').format("YYYY-MM");
        first = input + "-01";
        $("#monthInput").val(input);
        monthCalculate();
        returnShiftsPosted() 
        // deleteShift();
        deleteshifts();
    });

    // returnShiftsPosted()
    $("#client-select").change(function (e) { 
        e.preventDefault();
        returnShiftsPosted()
        // deleteShift();
        deleteshifts();
    });

    //Mouseover functions

    $(".previous,.next,.shift1,.process").mouseenter(function () { 
        $(this).css("background-color", "red");
    });
    
    $(".previous,.next,.shift1,.process").mouseleave(function () { 
        $(this).css("background-color", "rgb(255,255,255)");
    }); 

    //Start on a Monday / Wednesday
    $(".shift1").click(function (e) { 
        e.preventDefault();
        shift_type = $("#shift-type");
        client_selected = $("#client-select");
        carer_selected = $("#carer-select"); 
        if(parseInt(client_selected.val()) === 0 || parseInt(carer_selected.val()) === 0 || parseInt(shift_type.val()) === 0){
            alert("Please select a Client, Carer as well as a Shift");
        }

        if(parseInt(shift_type.val()) === 1 || parseInt(shift_type.val()) === 2 || parseInt(shift_type.val()) === 5 && parseInt(client_selected.val()) !== 0 && parseInt(carer_selected.val()) !== 0){
            start_time = '07:00';
            end_time = '19:00';
            timePopup();
        }
        if(parseInt(shift_type.val()) === 3 || parseInt(shift_type.val()) === 4 && parseInt(client_selected.val()) !== 0 && parseInt(carer_selected.val()) !== 0){
            start_time = '19:00';
            end_time = '07:00';
            timePopup();
        }
        
    });

    $("#submitTimes").click(function (e) { 
        e.preventDefault();
        start_time = $("#start-time").val();
        end_time = $("#end-time").val();
        $(".content").fadeIn(500).css("display", "flex");
        $(".load-shift").css("display", "none");
        processShifts();
    });

    $("#submitTimes-manual").click(function (e) { 
        e.preventDefault();
        start_time = $("#start-time-manual").val();
        end_time = $("#end-time-manual").val();
        $(".content").fadeIn(500).css("display", "flex");
        $(".load-manual-shift").css("display", "none");
        processManualShifts();
    });

    function timePopup() {
        $(".content").css("display", "none");
        $(".load-shift").fadeIn(500).css("display", "block");
        $("#start-time").val(start_time);
        $("#end-time").val(end_time);
    };

    function time_manualPopup() {
        $(".content").css("display", "none");
        $(".load-manual-shift").fadeIn(500).css("display", "block");
        $("#start-time-manual").val(start_time);
        $("#end-time-manual").val(end_time);
    };

    $(".clear").click(function (e) { 
        e.preventDefault();
        $(".testing").remove(); 
        shiftsAllocated = [];
    });

    $(".process").click(function (e) { 
        e.preventDefault();
        // deleteShift();
        deleteshifts();
        myProcess();    
    });

    function myProcess() {
        var txt;
        if (shiftsAllocated.length === 0 ) {
            alert("There are no shifts to Process");
        } else {
            var r = confirm("Are you sure?");
        if (r == true) {
            txt = "You pressed OK!";
            processShiftsAllocatedArray();
        } else {
            txt = "You pressed Cancel!";
        }
        }   
    }

    function processShiftsAllocatedArray() {
        shiftsToPost = [];
        var stringArray = [];
        for (i = 0; i < shiftsAllocated.length; i++) {
            stringArray = shiftsAllocated[i].split("-");
            
            var dayDate = parseInt(stringArray[5]);
            if (dayDate < 10) {
                dayDate = `0${dayDate}`
            }

            var startingDate = moment(`${stringArray[3]}-${stringArray[4]}-${dayDate} ${stringArray[7]}:00`).format("YYYY-MM-DD HH:mm:ss");
            var endingDate = `${stringArray[3]}-${stringArray[4]}-${dayDate} ${stringArray[8]}:00`;
            if (parseInt(stringArray[6]) === 3 || parseInt(stringArray[6]) === 4) {
                endingDate = moment(endingDate).add(1,"d").format("YYYY-MM-DD HH:mm:ss");
            } 
            

            var payrollCode;

            //CREATE VIP PAYROLL CODES
            var x = parseInt(stringArray[0].substr(3));
            var wk;
            var ph;
            if (x < 7) {
                wk = 'WK1';
            } else if ( x > 7 && x < 14) {
                wk = 'WK2'
            } else if ( x > 14 && x < 21) {
                wk = 'WK3'
            } else if ( x > 21 && x < 28) {
                wk = 'WK4'
            } else if ((x > 28 && x < 35) || ( x > 35 && x < 42)){
                wk = 'WK5'
            } else
            if (x === 7 || x === 14 || x === 21 || x === 28 || x === 35 || x === 42) {
                wk = 'Sunday'
            };

            var shiftType;


            const filterPublicHolidays = publicHolidays;
            var pholtoCode = filterPublicHolidays.filter((value) => {
                return value === parseInt(moment(startingDate).format("DD"));

            });
            pholtoCode = parseInt(pholtoCode);


            if (pholtoCode === parseInt(moment(startingDate).format("DD"))) {
                wk = 'PublicHoliday';
            }
            if (parseInt(stringArray[6]) === 1 || parseInt(stringArray[6]) === 2 || parseInt(stringArray[6]) === 5) {
                shiftType = 'Day';
            } else if (parseInt(stringArray[6]) === 3 || parseInt(stringArray[6]) === 4) {
                shiftType = 'Night';
            }

            if (shiftType === 'Day' && wk === 'WK1') {

                payrollCode = '100'
            } else
            if (shiftType === 'Night' && wk === 'WK1') {
                
                payrollCode = '101'
            } else
            if (shiftType === 'Day' && wk === 'WK2') {

                payrollCode = '200'
            } else
             if (shiftType === 'Night' && wk === 'WK2') {
                
                payrollCode = '202'
            } else
            if (shiftType === 'Day' && wk === 'WK3') {

                payrollCode = '300'
            } else
            if (shiftType === 'Night' && wk === 'WK3') {
               
                payrollCode = '303'
            } else
            if (shiftType === 'Day' && wk === 'WK4') {
   
                payrollCode = '400'
            } else
            if (shiftType === 'Night' && wk === 'WK4') {
                 
                payrollCode = '404'
            } else
            if (shiftType === 'Day' && wk === 'WK5') {
   
                payrollCode = '500'
            } else
            if (shiftType === 'Night' && wk === 'WK5') {
                    
                payrollCode = '505'
            } else
            if (shiftType === 'Day' && wk === 'Sunday') {

                payrollCode = '201'
            } else
            if (shiftType === 'Night' && wk === 'Sunday') {
              
                payrollCode = '203'
            } else 

            if (shiftType === 'Day' && wk === 'PublicHoliday') {
     
                payrollCode = '800'
            } else
            if (shiftType === 'Night' && wk === 'PublicHoliday') {
                      
                payrollCode = '801'
            };

            var data = [
                stringArray[0],
                parseInt(stringArray[1]),
                parseInt(stringArray[2]),
                `${stringArray[3]}-${stringArray[4]}`,
                parseInt(stringArray[6]),
                startingDate,
                endingDate,
                payrollCode
            ]
            // console.log(data);
            shiftsToPost.push(data);
            // console.log('Shifts to Post',shiftsToPost);
        }

        // shiftsToPost = { shiftsToPost };
        console.log(shiftsToPost);

        

        var url = '/postshifts';
        $.ajax({ 
            type: 'POST', 
            url: url, 
            data:   { shiftsToPost } , 
            // data: { shiftsToPost }, 
            dataType: 'json'
          }).done(function(response){
            // console.log(data);
            shiftsAllocated = [];
            $(".testing").remove();
            shift_type.val(0);
            carer_selected.val(0);
            returnShiftsPosted();
    
          }).fail(function(response){

          });
    };

    
    //THIS DELETES A SHIFT
    $(".day").on('click','.shiftAllocated', function(e){
        e.stopPropagation();
        e.preventDefault();
        var shiftToDelete = $(this).attr("id");


        var str = $(this).text();

        var res = str.charAt(0);


        var timesheetProcessed = escape(res);

        if (timesheetProcessed === '%u2726') {
            alert("This shift timesheet has been processed or finalized\n If it has not been finalized, \nyou can un-process it in the timesheet page.");
        } else if (timesheetProcessed === '%u2714'){
            var shiftToDelete = $(this).attr("id");
            shiftToDelete = parseInt(shiftToDelete);
            shiftsToBeDeleted.push(shiftToDelete);

            $(this).remove();
       
        }      
    });

    
    function deleteshifts() {
        if (shiftsToBeDeleted.length > 0) {
            var url = '/deleteshifts';
            $.ajax({ 
                type: 'DELETE', 
                url: url, 
                data: { shiftsToBeDeleted }, 
                dataType: 'json'
                }).done(function(response){
                    shiftsToBeDeleted = [];

                })
                .fail(function(response){

                });
        } else {

        }

        
                

    }

    $(".day").click(function (e) { 
        e.preventDefault();
        shift_type = $("#shift-type");
        client_selected = $("#client-select");
        carer_selected = $("#carer-select");
        dayID = $(this).attr("id");
        if (parseInt(client_selected.val()) === 0 || parseInt(carer_selected.val()) === 0 || parseInt(shift_type.val()) === 0) {
            alert("Client, Carer and Shift need to be selected")
        } else {
            if (parseInt(shift_type.val()) === 1 || parseInt(shift_type.val()) === 2 || parseInt(shift_type.val()) === 5) {
                start_time = '07:00';
                end_time = '19:00';
            } else {
                start_time = '19:00';
                end_time = '07:00';
            }
            if (parseInt(shift_type.val()) === 1 || parseInt(shift_type.val()) === 2 || parseInt(shift_type.val()) === 5) {
                start_time = '07:00';
                end_time = '19:00';
            } else {
                start_time = '19:00';
                end_time = '07:00';
            }
        time_manualPopup();    
        } 
    });
    
    $(".day").on('click','.testing', function(e){//REMOVE DRAFT SHIFT
        e.stopPropagation();
        var exclude = $(this).prop("id");
        shiftsAllocated = shiftsAllocated.filter(e => e !== exclude);
        $(this).remove();
    });

    //FUNCTIONS
    //THIS IMPORTS PUBLIC HOLIDAYS
    function getPublicHolidays() {
        publicHolidays = [];
        pHolYearMonth = $("#monthInput").val();

        var res = pHolYearMonth.split("-");

        var pYear = parseInt(res[0]);
        var pMonth = parseInt(res[1]);

        var url = '/getpublicholidays/' + pYear + '/' + pMonth;

        $.get(url, function(data){
            $.each(data, function () {
                var x = parseInt(moment(this.publicHolidayDate).format("DD"));
                publicHolidays.push(x);
     
            });
        });
    }

        //CALLS GETPUBLICHOLIDAYS BEFORE RUNNING POPULATEDAYS
    function monthlyCalc() {
        $.when($.ajax(getPublicHolidays())).then(function () {
            populateDays();  
        });
    }
    //THIS CALCULATES THE DAY OF THE MONTH
    function monthCalculate() {
        monthlyCalc();
        dayOfWeekNotMonth = parseInt(moment(first).format("d"));
        numberOfDaysInTheMonth = parseInt(moment(first, "YYYY-MM").daysInMonth());
        if(numberOfDaysInTheMonth === 31 && (dayOfWeekNotMonth === 6 || dayOfWeekNotMonth === 0)) {
            $('.6thWeek').show();
            } else if(numberOfDaysInTheMonth === 30 && dayOfWeekNotMonth === 0) {
                $('.6thWeek').show();
            }
            else {
                $('.6thWeek').hide();
            }
        };
    //THIS CLEARS PUBLIC HOLIDAYS
    function clearPublicHolidays() {
        $.each(basicMonthdata, function(i){
            var returnDay = `#${basicMonthdata[i].id}`;
            $(returnDay).css("background-color","#DDDDDD");
            $('.we').css("background-color","lightgreen");
            basicMonthdata[i].phol = 0;

        });
        // publicHolidays = [];
    };
    //THIS POPULATES THE DAYS ON THE CALENDAR
    function populateDays() {
        clearPublicHolidays();
        var dayOfMonth = 1;
        var populateDay = first;
        var labelName;
        var populateDayOfWeek = parseInt(moment(populateDay).format("d"));
        var numberOfDaysInTheMonth = parseInt(moment(populateDay, "YYYY-MM").daysInMonth());
       
        $.each(basicMonthdata, function (i, v) { 
                if (basicMonthdata[i].weekDay === populateDayOfWeek && dayOfMonth <= numberOfDaysInTheMonth) {
                var dayLabel = moment(populateDay).format("Do");
                labelName = basicMonthdata[i].id;
              
                
                $(`label[for="${labelName}"]`).html(dayLabel);
                populateDay = moment(populateDay).add(1,'d');
                populateDayOfWeek = parseInt(moment(populateDay).format("d"));
                basicMonthdata[i].monthDay = dayOfMonth;

                $.each(publicHolidays, function(x,v){
                    if(publicHolidays[x] === dayOfMonth) {
                        basicMonthdata[i].phol = publicHolidays[x];
                        
                    }
                });
                if (basicMonthdata[i].phol === dayOfMonth) {
                    $(`#${labelName}`).css("background-color", "deepskyblue");
                }
                
                dayOfMonth++;
                } else {
                labelName = basicMonthdata[i].id;
                $(`label[for="${labelName}"]`).html("");
                basicMonthdata[i].monthDay = 0; 
                basicMonthdata[i].phol = 0;
                if (basicMonthdata[i].monthDay === 0) {
                    $(`#${labelName}`).css("background-color", "grey");
                }

                }    
                $(".testing").remove();
   
        });

        

        shiftCalcType1 = [
            {id: "day1",onDuty: true},{id: "day2",onDuty: true},{id: "day3",onDuty: false},{id: "day4",onDuty: false},
            {id: "day5",onDuty: true},{id: "day6",onDuty: true},{id: "day7",onDuty: true},{id: "day8",onDuty: false},
            {id: "day9",onDuty: false},{id: "day10",onDuty: true},{id: "day11",onDuty: true},{id: "day12",onDuty: false},
            {id: "day13",onDuty: false},{id: "day14",onDuty: false},{id: "day15",onDuty: true},{id: "day16",onDuty: true},
            {id: "day17",onDuty: false},{id: "day18",onDuty: false},{id: "day19",onDuty: true},{id: "day20",onDuty: true},
            {id: "day21",onDuty: true},{id: "day22",onDuty: false},{id: "day23",onDuty: false},{id: "day24",onDuty: true},
            {id: "day25",onDuty: true},{id: "day26",onDuty: false},{id: "day27",onDuty: false},{id: "day28",onDuty: false},
            {id: "day29",onDuty: true},{id: "day30",onDuty: true},{id: "day31",onDuty: false},{id: "day32",onDuty: false},
            {id: "day33",onDuty: true},{id: "day34",onDuty: true},{id: "day35",onDuty: true},{id: "day36",onDuty: false},
            {id: "day37",onDuty: false},{id: "day38",onDuty: true},{id: "day39",onDuty: true},{id: "day40",onDuty: false},
            {id: "day41",onDuty: false},{id: "day42",onDuty: false}
        ];

        shiftCalcType2 = [
            {id: "day1",onDuty: false},{id: "day2",onDuty: false},{id: "day3",onDuty: true},{id: "day4",onDuty: true},
            {id: "day5",onDuty: false},{id: "day6",onDuty: false},{id: "day7",onDuty: false},{id: "day8",onDuty: true},
            {id: "day9",onDuty: true},{id: "day10",onDuty: false},{id: "day11",onDuty: false},{id: "day12",onDuty: true},
            {id: "day13",onDuty: true},{id: "day14",onDuty: true},{id: "day15",onDuty: false},{id: "day16",onDuty: false},
            {id: "day17",onDuty: true},{id: "day18",onDuty: true},{id: "day19",onDuty: false},{id: "day20",onDuty: false},
            {id: "day21",onDuty: false},{id: "day22",onDuty: true},{id: "day23",onDuty: true},{id: "day24",onDuty: false},
            {id: "day25",onDuty: false},{id: "day26",onDuty: true},{id: "day27",onDuty: true},{id: "day28",onDuty: true},
            {id: "day29",onDuty: false},{id: "day30",onDuty: false},{id: "day31",onDuty: true},{id: "day32",onDuty: true},
            {id: "day33",onDuty: false},{id: "day34",onDuty: false},{id: "day35",onDuty: false},{id: "day36",onDuty: true},
            {id: "day37",onDuty: true},{id: "day38",onDuty: false},{id: "day39",onDuty: false},{id: "day40",onDuty: true},
            {id: "day41",onDuty: true},{id: "day42",onDuty: true}
        ];

        shiftCalcType3 = [ //Day Only
            {id: "day1",onDuty: true},{id: "day2",onDuty: true},{id: "day3",onDuty: true},{id: "day4",onDuty: true},
            {id: "day5",onDuty: true},{id: "day6",onDuty: false},{id: "day7",onDuty: false},{id: "day8",onDuty: true},
            {id: "day9",onDuty: true},{id: "day10",onDuty: true},{id: "day11",onDuty: true},{id: "day12",onDuty: true},
            {id: "day13",onDuty: false},{id: "day14",onDuty: false},{id: "day15",onDuty: true},{id: "day16",onDuty: true},
            {id: "day17",onDuty: true},{id: "day18",onDuty: true},{id: "day19",onDuty: true},{id: "day20",onDuty: false},
            {id: "day21",onDuty: false},{id: "day22",onDuty: true},{id: "day23",onDuty: true},{id: "day24",onDuty: true},
            {id: "day25",onDuty: true},{id: "day26",onDuty: true},{id: "day27",onDuty: false},{id: "day28",onDuty: false},
            {id: "day29",onDuty: true},{id: "day30",onDuty: true},{id: "day31",onDuty: true},{id: "day32",onDuty: true},
            {id: "day33",onDuty: true},{id: "day34",onDuty: false},{id: "day35",onDuty: false},{id: "day36",onDuty: true},
            {id: "day37",onDuty: true},{id: "day38",onDuty: true},{id: "day39",onDuty: true},{id: "day40",onDuty: true},
            {id: "day41",onDuty: false},{id: "day42",onDuty: false}
        ];     
    };

    
    //THIS PROCESSES THE SHIFT DRAWING BOARD
    function processShifts() {
        shift_type = $("#shift-type");
        client_selected = $("#client-select");
        carer_selected = $("#carer-select");
        var check = $("#day7").width() - 2;
        var data = basicMonthdata;
            $.each(data, function (i, v) { 
                if (data[i].monthDay === 0) {
                shiftCalcType1[i].onDuty = false;
                shiftCalcType2[i].onDuty = false;
                shiftCalcType3[i].onDuty = false;
                }
        });

        var carer = $("#carer-select option:selected").text();
        if (parseInt(client_selected.val()) !== 0 && parseInt(carer_selected.val()) !== 0 && parseInt(shift_type.val()) === 1) {
            $.each(shiftCalcType1, function (i, v) { 
                if (shiftCalcType1[i].onDuty === true) {
                    var insert = `#${shiftCalcType1[i].id}`;
                    var identity = `${shiftCalcType1[i].id}-${$("#client-select").val()}-${$("#carer-select").val()}-${input}-${data[i].monthDay}-${parseInt(shift_type.val())}-${start_time}-${end_time}`;
                    shiftsAllocated.push(identity);
                    var par = $('<button class="testing">').html(`${carer}-${start_time}-${end_time}`).width(check).css("background-color", "blue").attr("id", identity);
                    par.appendTo(insert);
                }
            });
            shift_type.val(0);
            carer_selected.val(0);
        };

        if (parseInt(client_selected.val()) !== 0 && parseInt(carer_selected.val()) !== 0 && parseInt(shift_type.val()) === 2) {
            $.each(shiftCalcType2, function (i, v) { 
                if (shiftCalcType2[i].onDuty === true) {
                    var insert = `#${shiftCalcType2[i].id}`;
                    var identity = `${shiftCalcType2[i].id}-${$("#client-select").val()}-${$("#carer-select").val()}-${input}-${data[i].monthDay}-${parseInt(shift_type.val())}-${start_time}-${end_time}`;
                    shiftsAllocated.push(identity);
                    var par = $('<button class="testing">').html(`${carer}-${start_time}-${end_time}`).width(check).css("background-color", "red").attr("id", identity);
                    par.appendTo(insert);
                };  
            });
            shift_type.val(0);
            carer_selected.val(0);
        };

        if (parseInt(client_selected.val()) !== 0 && parseInt(carer_selected.val()) !== 0 && parseInt(shift_type.val()) === 3) {
            $.each(shiftCalcType1, function (i, v) { 
                if (shiftCalcType1[i].onDuty === true) {
                    var insert = `#${shiftCalcType1[i].id}`;
                    var identity = `${shiftCalcType1[i].id}-${$("#client-select").val()}-${$("#carer-select").val()}-${input}-${data[i].monthDay}-${parseInt(shift_type.val())}-${start_time}-${end_time}`;
                    shiftsAllocated.push(identity);
                    var par = $('<button class="testing">').html(`${carer}-${start_time}-${end_time}`).width(check).css("background-color", "Orange").attr("id", identity);
                    par.appendTo(insert);
                }
            });
            shift_type.val(0);
            carer_selected.val(0);
        };

        if (parseInt(client_selected.val()) !== 0 && parseInt(carer_selected.val()) !== 0 && parseInt(shift_type.val()) === 4) {
            $.each(shiftCalcType2, function (i, v) { 
                if (shiftCalcType2[i].onDuty === true) {
                    var insert = `#${shiftCalcType2[i].id}`;
                    var identity = `${shiftCalcType2[i].id}-${$("#client-select").val()}-${$("#carer-select").val()}-${input}-${data[i].monthDay}-${parseInt(shift_type.val())}-${start_time}-${end_time}`;
                    shiftsAllocated.push(identity);
                    var par = $('<button class="testing">').html(`${carer}-${start_time}-${end_time}`).width(check).css("background-color", "blueviolet").attr("id", identity);
                    par.appendTo(insert);
                };  
            });
            shift_type.val(0);
            carer_selected.val(0);
        };

        if (parseInt(client_selected.val()) !== 0 && parseInt(carer_selected.val()) !== 0 && parseInt(shift_type.val()) === 5) {
            $.each(shiftCalcType1, function (i, v) { 
                if (shiftCalcType3[i].onDuty === true) {
                    var insert = `#${shiftCalcType3[i].id}`;
                    var identity = `${shiftCalcType3[i].id}-${$("#client-select").val()}-${$("#carer-select").val()}-${input}-${data[i].monthDay}-${parseInt(shift_type.val())}-${start_time}-${end_time}`;
                    shiftsAllocated.push(identity);
                    var par = $('<button class="testing">').html(`${carer}-${start_time}-${end_time}`).width(check).css("background-color", "violet").attr("id", identity);
                    par.appendTo(insert);
                        }
                    });
            shift_type.val(0);
            carer_selected.val(0);
        };     
    };

    var basicMonthdata =[
        {id: "day1",weekDay: 1, monthDay: 0, phol: 0},{id: "day2",weekDay: 2, monthDay: 0, phol: 0},{id: "day3",weekDay: 3, monthDay: 0, phol: 0},{id: "day4",weekDay: 4, monthDay: 0, phol: 0},
        {id: "day5",weekDay: 5, monthDay: 0, phol: 0},{id: "day6",weekDay: 6, monthDay: 0, phol: 0},{id: "day7",weekDay: 0, monthDay: 0, phol: 0},{id: "day8",weekDay: 1, monthDay: 0, phol: 0},
        {id: "day9",weekDay: 2, monthDay: 0, phol: 0},{id: "day10",weekDay: 3, monthDay: 0, phol: 0},{id: "day11",weekDay: 4, monthDay: 0, phol: 0},{id: "day12",weekDay: 5, monthDay: 0, phol: 0},
        {id: "day13",weekDay: 6, monthDay: 0, phol: 0},{id: "day14",weekDay: 0, monthDay: 0, phol: 0},{id: "day15",weekDay: 1, monthDay: 0, phol: 0},{id: "day16",weekDay: 2, monthDay: 0, phol: 0},
        {id: "day17",weekDay: 3, monthDay: 0, phol: 0},{id: "day18",weekDay: 4, monthDay: 0, phol: 0},{id: "day19",weekDay: 5, monthDay: 0, phol: 0},{id: "day20",weekDay: 6, monthDay: 0, phol: 0},
        {id: "day21",weekDay: 0, monthDay: 0, phol: 0},{id: "day22",weekDay: 1, monthDay: 0, phol: 0},{id: "day23",weekDay: 2, monthDay: 0, phol: 0},{id: "day24",weekDay: 3, monthDay: 0, phol: 0},
        {id: "day25",weekDay: 4, monthDay: 0, phol: 0},{id: "day26",weekDay: 5, monthDay: 0, phol: 0},{id: "day27",weekDay: 6, monthDay: 0, phol: 0},{id: "day28",weekDay: 0, monthDay: 0, phol: 0},
        {id: "day29",weekDay: 1, monthDay: 0, phol: 0},{id: "day30",weekDay: 2, monthDay: 0, phol: 0},{id: "day31",weekDay: 3, monthDay: 0, phol: 0},{id: "day32",weekDay: 4, monthDay: 0, phol: 0},
        {id: "day33",weekDay: 5, monthDay: 0, phol: 0},{id: "day34",weekDay: 6, monthDay: 0, phol: 0},{id: "day35",weekDay: 0, monthDay: 0, phol: 0},{id: "day36",weekDay: 1, monthDay: 0, phol: 0},
        {id: "day37",weekDay: 2, monthDay: 0, phol: 0},{id: "day38",weekDay: 3, monthDay: 0, phol: 0},{id: "day39",weekDay: 4, monthDay: 0, phol: 0},{id: "day40",weekDay: 5, monthDay: 0, phol: 0},
        {id: "day41",weekDay: 6, monthDay: 0, phol: 0},{id: "day42",weekDay: 0, monthDay: 0, phol: 0}
    ];

    var shiftCalcType1 = [];
    var shiftCalcType2 = []; 
    
    var clientSelected;
    var shiftPeriod;
    //THIS RETURNS SHIFTS IN THE DATABASE
    function returnShiftsPosted(){
        clientSelected = $("#client-select").val();
        shiftPeriod = input;
        var url = '/shiftsAllocated/' + clientSelected + "/" + shiftPeriod;
        var check = $("#day7").width() - 2;
        $(".shiftAllocated").remove();
        $.get(url, function(data){

            $.each(data.shifts, function (i, v) {
                var color;
                if (data.shifts[i].shift_type === 1) {
                    color = '#F5FF00';    
                }
                if (data.shifts[i].shift_type === 2) {
                    color = '#FF2300';   
                }
                if (data.shifts[i].shift_type === 3) {
                    // color = '#887142';   
                    color = '#f7aa00';   
                }
                if (data.shifts[i].shift_type === 4) {
                    color = '#00F700';    
                }
                if (data.shifts[i].shift_type === 5) {
                    // color = '#6A93B0';   
                    color = '#7971EA';   
                }
                if (data.shifts[i].time_sheets_processed === 1) {
                    var status = '&#x2726;';

                } else if (data.shifts[i].time_sheets_processed === 0){
                    var status =  '&#10004;'

                }
                var insert = `#${data.shifts[i].shift_schedule_id}`;
                var identity = `${data.shifts[i].id}`;
                if (`${data.shifts[i].last_name}:${(data.shifts[i].first_name).substr(0,1)}`)
                var shiftDetails = `${status}${data.shifts[i].last_name}:${(data.shifts[i].first_name).substr(0,1)} - ${moment(data.shifts[i].shift_start).format("HH:mm")}:${moment(data.shifts[i].shift_end).format("HH:mm")}`;
                var par = $('<button class="shiftAllocated">').html(shiftDetails).width(check).css("background-color", color).attr("id", identity);
                if ((`${data.shifts[i].last_name}:${(data.shifts[i].first_name).substr(0,1)}`).length > 14) {
                    par.css("font-size", "1em;")
                } else {
                    par.css("font-size", "1.05em;")
                }

                par.appendTo(insert);
            });
        }); 
    };
    
    //PROCESS MANUAL SHIFTS
    function processManualShifts() {
        shift_type = $("#shift-type");
        client_selected = $("#client-select");
        carer_selected = $("#carer-select");
        var clientID = client_selected.val();
        var carerID = carer_selected.val();
        var monthUsed = input;
        var dayUsed = ($(`label[for="${dayID}"]`).html()).match(/\d+/g).map(Number);
        dayUsed = dayUsed[0];
        var shiftType = shift_type.val();
        var carer = $("#carer-select option:selected").text();
        var thisID = `${dayID}-${clientID}-${carerID}-${monthUsed}-${dayUsed}-${shiftType}-${start_time}-${end_time}`; 
        var check = $("#day7").width() - 2;
        var insert = dayID;
        insert = `#${insert}`;
        var par = $('<button class="testing masterTooltip" title="This is a test">').html(`${carer}-${start_time}-${end_time}`).width(check).css("background-color", "green").attr("id", thisID);
        par.appendTo(insert);
        shiftsAllocated.push(thisID);
        shiftsAllocated = shiftsAllocated.filter(e => e !== undefined);
    }; 

    //TOOLTIPS
   
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

    $(".masterTooltip").mouseenter(function () { 
        if (displayTooltips === 1 ) {
        var title = $(this).attr('title');
        $(this).data('tipText', title).removeAttr('title');
        $('<p class="tooltip"></p>')
        .text(title)
        .appendTo('body')
        .fadeIn('slow');
    }});

    $(".masterTooltip").mousemove(function (e) {
        if (displayTooltips === 1 ) { 
        var mousex = e.pageX - 115; //Get X coordinates
                var mousey = e.pageY - 120; //Get Y coordinates
                $('.tooltip')
                .css({ top: mousey, left: mousex })   
    }});

    $(".masterTooltip").mouseleave(function () { 
        if (displayTooltips === 1 ) {
                $(this).attr('title', $(this).data('tipText'));
                $('.tooltip').remove(); 
    }});
        
});


