$(function(){
    $('#navbar a').click(function () {
        $('#navbar a').removeClass('active');
        $(this).addClass('active');
     });
 });

 var but = document.getElementById("submit");

 but.onclick = function send()
 {
    var user = document.getElementById("username").value;
    var pass = document.getElementById("password").value;
    var email = document.getElementById("email").value;
    var fname = document.getElementById("firstname").value;
    var lname = document.getElementById("lastname").value;
    var birth = document.getElementById("birthday").value;

    $.getJSON('/insertUser/'+user+'/'+pass+'/'+email+'/'+fname+'/'+lname+'/'+birth, end);

    function end(data)
    {
        console.log(data);
    }
 }