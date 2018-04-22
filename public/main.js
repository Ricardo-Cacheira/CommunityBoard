// $(function () {
//     $('#navbar a').click(function () {
//         $('#navbar a').removeClass('active');
//         $(this).addClass('active');
//     });
// });

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

var but = document.getElementById("submit");

but.onclick = function send() {
    var user = document.getElementById("username").value;
    var pass = document.getElementById("password").value;
    var email = document.getElementById("email").value;
    var fname = document.getElementById("firstname").value;
    var lname = document.getElementById("lastname").value;
    var birth = document.getElementById("birthday").value;

    $.getJSON('/insertUser/' + user + '/' + pass + '/' + email + '/' + fname + '/' + lname + '/' + birth, end);

    function end(data) {
        console.log(data);
    }
}