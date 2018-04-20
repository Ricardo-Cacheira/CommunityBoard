$(function(){
    $('#navbar a').click(function () {
        $('#navbar a').removeClass('active');
        $(this).addClass('active');
     });
 });

 var but = document.getElementById("submit");

 but.onclick()
 {
    var user = document.getElementById("username");
    var pass = document.getElementById("password");
    var email = document.getElementById("email");
    var fname = document.getElementById("firstname");
    var lname = document.getElementById("lastname");
    var birth = document.getElementById("birthday");

    $.getJSON('/insertUser/'+user+'/'+pass+'/'+email+'/'+fname+'/'+lname+'/'+birth, end);

    function end(data)
    {
        console.log(data);
    }
 }