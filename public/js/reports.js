
$(function() {

    var initialMonth = moment().format("YYYY-MM");
    $('#currentMonth').val(initialMonth);

    $('#previousMonth').click(function (e) { 
        e.preventDefault();
        var newMonth = $('#currentMonth').val();
        newMonth = moment(newMonth).subtract(1, 'M').format("YYYY-MM");
        $('#currentMonth').val(newMonth); 
        hideLinks();
    });

    $('#nextMonth').click(function (e) { 
        e.preventDefault();
        var newMonth = $('#currentMonth').val();
        newMonth = moment(newMonth).add(1, 'M').format("YYYY-MM");
        $('#currentMonth').val(newMonth);
        hideLinks();
    });

    function hideLinks() {
        $("#printCarerSchedulesLink, #printduplicateShiftsLink, #printmorethan24hrsLink, #printoverlappingShiftsLink, #printlongerThan12HoursShiftsLink, #printexcessiveHoursLink, #printcarerWagesLink, #printmonthlySummaryLink, #printclientHoursLink").css("display", "none"); 
    }

    // console.log(initialMonth);

    var filetodownload;
    var monthForSchedules;


    $('#printduplicateShifts').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/duplicateShifts/' + monthForSchedules;
        $.get(url, function(data){
            filetodownload = data.split('-');
            console.log(filetodownload);
            host = filetodownload[1];
            port = filetodownload[2];
            filetodownload = filetodownload[0];
            console.log(filetodownload);
            console.log(`http://${host}:${port}/files/${filetodownload}`)
            console.log(data);
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            console.log(response);
            $("#printduplicateShiftsLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            $("#printduplicateShiftsLink").css("display", "inline");
        });     
    });


    $('#printmorethan24hrs').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/printmorethan24hrs/' + monthForSchedules;
        $.get(url, function(data){
            filetodownload = data.split('-');
            console.log(filetodownload);
            host = filetodownload[1];
            port = filetodownload[2];
            filetodownload = filetodownload[0];
            console.log(filetodownload);
            console.log(`http://${host}:${port}/files/${filetodownload}`)
            console.log(data);
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            console.log(response);
            $("#printmorethan24hrsLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            $("#printmorethan24hrsLink").css("display", "inline");
        });     
    });

    $('#printoverlappingShifts').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/overlappingshifts/' + monthForSchedules;
        $.get(url, function(data){
            filetodownload = data.split('-');
            console.log(filetodownload);
            host = filetodownload[1];
            port = filetodownload[2];
            filetodownload = filetodownload[0];
            console.log(filetodownload);
            console.log(`http://${host}:${port}/files/${filetodownload}`)
            console.log(data);
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            console.log(response);
            $("#printoverlappingShiftsLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            $("#printoverlappingShiftsLink").css("display", "inline");
        });     
    });

    $('#printlongerThan12HoursShifts').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/longerthan12hourshifts/' + monthForSchedules;
        $.get(url, function(data){
            filetodownload = data.split('-');
            console.log(filetodownload);
            host = filetodownload[1];
            port = filetodownload[2];
            filetodownload = filetodownload[0];
            console.log(filetodownload);
            console.log(`http://${host}:${port}/files/${filetodownload}`)
            console.log(data);
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            console.log(response);
            $("#printlongerThan12HoursShiftsLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            $("#printlongerThan12HoursShiftsLink").css("display", "inline");
        });     
    });


    $('#printexcessiveHours').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        console.log(monthForSchedules);
        var url = '/reports/excessivehours/' + monthForSchedules;
        $.get(url, function(data){
            filetodownload = data.split('-');
            // console.log(filetodownload);
            host = filetodownload[1];
            port = filetodownload[2];
            filetodownload = filetodownload[0];
            console.log(filetodownload);
            console.log(`http://${host}:${port}/files/${filetodownload}`)
            console.log(data);
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            console.log(response);
            $("#printexcessiveHoursLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            $("#printexcessiveHoursLink").css("display", "inline");
        });     
    });


    $('#printCarerSchedules').click(function (e) { 
        e.preventDefault();
        var x = (screen.width);
        var y = (screen.height);
        $('.lightbox').css('display', 'inline').css('width', x).css('height', y);
        var monthForSchedules = $('#currentMonth').val();
        console.log(monthForSchedules);
        // $(this).css("display", "none")

        var url = '/reports/carerSchedules/' + monthForSchedules;
        $.get(url, function(data){
            filetodownload = data.split('-');
            console.log(filetodownload);

            host = filetodownload[1];
            port = filetodownload[2];
            console.log(port);
            filetodownload = filetodownload[0];
            console.log(filetodownload);
            console.log(`http://${host}:${port}/files/${filetodownload}`)
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 250)
        }).done(function(response){
                console.log("This is the response:",response);
                setTimeout(function(){
                    $("#printCarerSchedulesLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
                    $("#printCarerSchedulesLink").css("display", "inline");
                    $('.lightbox').css('display', 'none');
                    //  $('#printCarerSchedules').css("display", "inline")

                }, 6500);
                 
            
            // $("#printCarerSchedulesLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            // $("#printCarerSchedulesLink").css("display", "inline");
          }).fail(function(response){
            console.log(response);
          });      
    });

    $('#printcarerWages').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        console.log(monthForSchedules);
        var url = '/reports/monthlywages/' + monthForSchedules;
        $.get(url, function(data){
            filetodownload = data.split('-');
            // console.log(filetodownload);
            host = filetodownload[1];
            port = filetodownload[2];
            filetodownload = filetodownload[0];
            console.log(filetodownload);
            console.log(`http://${host}:${port}/files/${filetodownload}`)
            console.log(data);
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            console.log(response);
            $("#printcarerWagesLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            $("#printcarerWagesLink").css("display", "inline");
        });     
    });


    $('#printmonthlySummary').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        console.log(monthForSchedules);
        var url = '/reports/monthlysummary/' + monthForSchedules;
        $.get(url, function(data){
            filetodownload = data.split('-');
            // console.log(filetodownload);
            host = filetodownload[1];
            port = filetodownload[2];
            filetodownload = filetodownload[0];
            console.log(filetodownload);
            console.log(`http://${host}:${port}/files/${filetodownload}`)
            console.log(data);
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            console.log(response);
            $("#printmonthlySummaryLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            $("#printmonthlySummaryLink").css("display", "inline");
        });     
    });

    $('#printclientHours').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        console.log(monthForSchedules);
        var url = '/reports/monthlybilling/' + monthForSchedules;
        $.get(url, function(data){
            filetodownload = data.split('-');
            // console.log(filetodownload);
            host = filetodownload[1];
            port = filetodownload[2];
            filetodownload = filetodownload[0];
            console.log(filetodownload);
            console.log(`http://${host}:${port}/files/${filetodownload}`)
            console.log(data);
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            console.log(response);
            $("#printclientHoursLink").attr("href", `http://${host}:${port}/download/${filetodownload}`);
            $("#printclientHoursLink").css("display", "inline");
        });     
    });

    $("#printCarerSchedulesLink, #printduplicateShiftsLink, #printmorethan24hrsLink, #printoverlappingShiftsLink, #printlongerThan12HoursShiftsLink, #printexcessiveHoursLink, #printcarerWagesLink, #printmonthlySummaryLink, #printclientHoursLink").click(function (e) { 
        // e.preventDefault();
        $(this).css("display", "none");
        
    });
    
    
});