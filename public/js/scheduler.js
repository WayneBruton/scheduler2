$(function() {
    // $('#login')
    $("#login").click(function (e) { 
        e.preventDefault();
        $(this).fadeTo(500, 0, function(){
            $("#login-form").fadeIn(500).css("display", "inline-block");
        });  
    });
    $(".cancel").click(function (e) { 
        e.preventDefault();
        $("#login-form").fadeIn(500).css("display", "none");
        $("#login").fadeTo(500,1);
    });
});



