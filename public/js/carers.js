var page;
var search;
var activeOrNot = true;

$(function() {

    $(function(){
        $("#activeYes").prop("checked", true);
        $(".activeOrNot").val(activeOrNot);
        });

        $("#activeYes").click(function (e) { 
            // e.preventDefault();
            if ($(this).prop("checked") === false) {
                activeOrNot = false;
            } 
            else {
                activeOrNot = true;
            }
            $(".activeOrNot").val(activeOrNot);

        });

        $("#activeYes").change(function (e) { 
            e.preventDefault();
            $("#searchInput").val("");
            $("#back").css("opacity", "0").prop("disabled", "true");
            page = 0;
            var url = '/carers/' + page + '/' + activeOrNot;
            $.get(url, function(data){
                $('#carerData').empty();
                $.each(data, function () {
                    var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                    $('<div class="carer-li"><li id="carer-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#carerData');
                });
            }); 
            
        });




        





    $("#forward").click(function (e) { 
        e.preventDefault();
        $("#back").css("opacity", "1").removeAttr("disabled");
        if (page === undefined) {
            page = 1;
        } else {
            page++;   
        }

        var url = '/carers/' + page + '/' + activeOrNot;
        $.get(url, function(data){

            $('#carerData').empty();
            $.each(data, function () {
                var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                $('<div class="carer-li"><li id="carer-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#carerData');
                if (data.length < 12) {
                    $("#forward").css("opacity", "0").prop("disabled", "true");
                } else {
                    $("#forward").css("opacity", "1").removeClass("disabled", "false");
                }
            });
        });
    });
    


    $("#back").click(function (e) { 
        e.preventDefault();
        if (page === undefined) {
            page = 1;
        } else {
            page--;   
        } 
        if (page === 0) {
            $("#back").css("opacity", "0").prop("disabled", "true");
        } else {
            $("#back").css("opacity", "1").removeAttr("disabled");
        }
        $("#forward").css("opacity", "1").removeAttr("disabled");
 
        var url = '/carers/' + page + '/' + activeOrNot;
        $.get(url, function(data){
 
            $('#carerData').empty();
            $.each(data, function () {
                var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                $('<div class="carer-li"><li id="carer-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#carerData');
            });
        });     
    });


    $("#searchInput").focus(function (e) { 
        e.preventDefault();
        $(this).css("background-color", "yellow");
    });

    $("#searchInput").blur(function (e) { 
        e.preventDefault();
        $(this).css("background-color", "rgb(255, 255, 255)");
    });

    $("#addPerson").click(function (e) { 
        e.preventDefault();
        var x = (screen.width);
        var y = (screen.height)
        var swidth = (screen.width) * .6; 
        var sheight = (screen.height) * .6;
        var newTop = (y - sheight)/2;
        var newLeft = (x - swidth)/2;
        var newMargin = (swidth - 300)/2;
        $(".lightbox").fadeIn().css("width", x).css("height", y);
        $(".lightboxA").css("width",swidth).css("height", sheight).css("top", newTop).css("left", newLeft);
        $('.lightboxA').fadeIn().css("display", "flex").css("align-items", "center").css("align-content", "space-around");
        $(".inputData").css("margin-left", newMargin);

    });

    

    $(".lightbox,.lightbox1").click(function (e) { 
        e.preventDefault();
        $(this).css("display", "none");  
        editData = [];//clears edit query
    });

    // $(".lightbox1").click(function (e) { 
    //     e.preventDefault();
    //     $(this).css("display", "none");  
    // });

    $(".inputDataFields,.inputDataFields1").click(function (e) { 
        e.stopPropagation();
        
    });

    //Search for carer
    $("#searchInput").keyup(function (e) {
        e.preventDefault();
        search = $(this).val();
        if (search === "") {
            search = '&&';
        }
        var url = '/carer/' + search + '/' + activeOrNot;
        $.get(url, function(data){
            $('#carerData').empty();
            $.each(data, function () {
                var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                $('<div class="carer-li"><li id="carer-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#carerData');
            });
        });
        
    });

    $('#searchInput').keydown(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });


    $("searchEndBtn").click(function(e){
        e.preventDefault();
        returnAll();

    })

    function returnAll(){
        var url = '/carerReturn';
        $.get(url, function(data){
            $('#carerData').empty();
            $.each(data, function () {
                var input = this.id + ' - ' + this.first_name + ' : ' + this.last_name;
                $('<div class="carer-li"><li id="carer-li">' + input + '</li><button class="edit-btn" id="' + this.id + '">Edit / View</button></div>').appendTo('#carerData');
            });
        });
    }

    $("#addLastName,#addFirstName,#addEmail,#addEENumber").focusout(function (e) { 
        e.preventDefault();
        if ($(this).val() === '') {
            $(this).css("background-color", "red");
            $("#addNewCarer").css("display", "none");
            $(this).focus();  
        } else {
            $("#addNewCarer").css("display", "block"); 
            $(this).css("background-color", "rgb(255, 255, 255)");
        } 
    });

    $("#reset").click(function (e) { 
        e.preventDefault();
        $("#addLastName,#addFirstName,#addEmail,#addEENumber").css("background-color", "rgb(255, 255, 255)");
        $("#addNewCarer").css("display", "block"); 
    });

    var carerID;

    $('#carerData').on("click",".edit-btn",function(e){
        carerID = $(this).attr('id');

        e.preventDefault();
        var x = (screen.width);
        var y = (screen.height)
        var swidth = (screen.width) * .6; 
        var sheight = (screen.height) * .6;
        var newTop = (y - sheight)/2;
        var newLeft = (x - swidth)/2;
        var newMargin = (swidth - 300)/2;
        $(".lightbox1").fadeIn().css("width", x).css("height", y);
        $(".lightboxA1").css("width",swidth).css("height", sheight).css("top", newTop).css("left", newLeft);
        $('.lightboxA1').fadeIn().css("display", "flex").css("align-items", "center").css("align-content", "space-around");
        $(".inputData1").css("margin-left", newMargin);
        var url = '/getcarer/' + carerID;
        $.get(url, function(data){
            editData = [];//clears edit query
            editData.push(data[0]);
            fillEditInputs();
 
        });
    });

    var editData = [];//clears edit query

    function fillEditInputs() {
        $("#carer-id").val(editData[0].id);
        $("#editLastName").val(editData[0].last_name);
        $("#editFirstName").val(editData[0].first_name);
        $("#editEmail").val(editData[0].email);
        $("#editEENumber").val(editData[0].employee_number);
        $("#ratePerHour").val(editData[0].rate_per_hour);
        if (editData[0].active === 1) {
        $("#activeChecked1").prop("checked", true);
        $("#isActive").val(1)
        $("#activeChecked1").val(1);
        $("#inactivityReason").css("display", "none");
        $("#inactivityReasonLabel").css("display", "none"); 
        $('.inputData1').css("height", "580px")
        } else {
        $("#activeChecked1").prop("checked", false);
        $("#activeChecked1").val(0);
        $("#isActive").val(0);
        $('.inputData1').css("height", "650px")
        $("#inactivityReason").val(editData[0].activity_reason);
        }
    }

    $("#editLastName,#editFirstName,#editEmail,#editEENumber").focusout(function (e) { 
        e.preventDefault();
        if ($(this).val() === '') {
            $(this).css("background-color", "red");
            $("#editNewCarer").css("display", "none");
            $(this).focus();  
        } else {
            $(this).css("background-color", "rgb(255, 255, 255)");
            $("#editNewCarer").css("display", "block"); 
        } 
    });

    $("#resetEdit").click(function (e) { 
        e.preventDefault();
        $("#editLastName,#editFirstName,#editEmail,#editEENumber").css("background-color", "rgb(255, 255, 255)");
        $("#editNewCarer").css("display", "block"); 
        fillEditInputs();
    });

    $("#activeChecked1").click(function (e) { 
        if ($('input[name=active]').is(':checked')) {
            $("#inactivityReason").css("display", "none");
            $("#inactivityReasonLabel").css("display", "none");
            $("#inactivityReason").val("");
            $(this).val(1); 
            $("#isActive").val(1)
            $(".inputData1").height(510);
        } 
        else {
            $(this).val(0);
            $("#inactivityReason").css("display", "block");
            $("#isActive").val(0)
            $("#inactivityReasonLabel").css("display", "block");
            $(".inputData1").height(560); 
        }
    });
});