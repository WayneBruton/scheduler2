
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

    var filetodownload;
    var monthForSchedules;
    
    $('#printduplicateShifts').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/duplicateShifts/' + monthForSchedules;
        $.get(url, function(data){
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            filetodownload = response;
            $("#printduplicateShiftsLink").attr("href", `${filetodownload}`);
            $("#printduplicateShiftsLink").css("display", "inline");
        });     
    });


    $('#printmorethan24hrs').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/printmorethan24hrs/' + monthForSchedules;
        $.get(url, function(data){
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            filetodownload = response;
            $("#printmorethan24hrsLink").attr("href", `${filetodownload}`);
            $("#printmorethan24hrsLink").css("display", "inline");
        });     
    });

    $('#printoverlappingShifts').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/overlappingshifts/' + monthForSchedules;
        $.get(url, function(data){
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            filetodownload = response;
            $("#printoverlappingShiftsLink").attr("href", `${filetodownload}`);
            $("#printoverlappingShiftsLink").css("display", "inline");
        });     
    });

    $('#printlongerThan12HoursShifts').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/longerthan12hourshifts/' + monthForSchedules;
        $.get(url, function(data){
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            filetodownload = response;
            $("#printlongerThan12HoursShiftsLink").attr("href", `${filetodownload}`);
            $("#printlongerThan12HoursShiftsLink").css("display", "inline");
        });     
    });


    $('#printexcessiveHours').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/excessivehours/' + monthForSchedules;
        $.get(url, function(data){
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            filetodownload = response;
            $("#printexcessiveHoursLink").attr("href", `${filetodownload}`);
            $("#printexcessiveHoursLink").css("display", "inline");
        });     
    });


    $('#printCarerSchedules').click(function (e) { 
        e.preventDefault();
        var x = (screen.width);
        var y = (screen.height);
        $('.lightbox').css('display', 'inline').css('width', x).css('height', y);
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/carerSchedules/' + monthForSchedules;
        $.get(url, function(data){
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 250)
        }).done(function(response){
                setTimeout(function(){
                    filetodownload = response;
                    $("#printCarerSchedulesLink").attr("href", `${filetodownload}`);
                    $("#printCarerSchedulesLink").css("display", "inline");
                    $('.lightbox').css('display', 'none');
                }, 6500);
          }).fail(function(response){
          });      
    });

    $('#printcarerWages').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/monthlywages/' + monthForSchedules;
        $.get(url, function(data){
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            filetodownload = response;
            $("#printcarerWagesLink").attr("href", `${filetodownload}`);
            $("#printcarerWagesLink").css("display", "inline");
        });     
    });


    $('#printmonthlySummary').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/monthlysummary/' + monthForSchedules;
        $.get(url, function(data){
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            filetodownload = response;
            $("#printmonthlySummaryLink").attr("href", `${filetodownload}`);
            $("#printmonthlySummaryLink").css("display", "inline");
        });     
    });

    $('#printclientHours').click(function (e) { 
        e.preventDefault();
        var monthForSchedules = $('#currentMonth').val();
        var url = '/reports/monthlybilling/' + monthForSchedules;
        $.get(url, function(data){
            $("body").css("background-color", "orange");
            setTimeout(function(){
                $("body").css("background-color", "#DDDDDD");
            }, 100)
        }).done(function(response){
            filetodownload = response;
            $("#printclientHoursLink").attr("href", `${filetodownload}`);
            $("#printclientHoursLink").css("display", "inline");
        });     
    });

    $("#printCarerSchedulesLink, #printduplicateShiftsLink, #printmorethan24hrsLink, #printoverlappingShiftsLink, #printlongerThan12HoursShiftsLink, #printexcessiveHoursLink, #printcarerWagesLink, #printmonthlySummaryLink, #printclientHoursLink").click(function (e) { 
        $(this).css("display", "none");    
    });  
});