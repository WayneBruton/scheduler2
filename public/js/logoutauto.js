$(function() {


    // $(window).bind('beforeunload', function(){
    //     // alert('are you sure?');
    //     $.get('/logout');
    // });
    // TO AUTOMATICALLY LOG USER OFF AFTER 20 MINUTES
  var idleTime = 0;
  $(document).ready(function () {
      var idleInterval = setInterval(timerIncrement, 60000); // 1 minute
      idleInterval;

      $(this).mousemove(function (e) {
          idleTime = 0;
      });
      $(this).keypress(function (e) {
          idleTime = 0;
      });
  });
  
  function timerIncrement() {
      idleTime = idleTime + 1;
      if (idleTime > 19) { // 20 minutes
          var url = '/logout'
          $.get(url, function(e){
              console.log("relocating");
              window.location.href = '/logout'; 
          });
      }
  }
});



  