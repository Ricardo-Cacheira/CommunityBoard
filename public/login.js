var on = document.getElementById("lsubmit");

on.onclick = function send() {
    var user = document.getElementById("username").value;
    var pass = document.getElementById("password").value;
    // var email = document.getElementById("email").value;

    $.getJSON('/selectLogin/' + user + '/' + pass, end);

    function end(data) {
        console.log(data);
    }
}